"""
Job Match Optimizer Node
Analyzes job descriptions and optimizes CV for ATS systems
"""
from typing import List, Dict, Any, Tuple
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from app.models.cv_models import CVData, JobMatchResult
from app.core.config import get_settings
import numpy as np
import json


class JobMatchOptimizer:
    """Optimizes CV for specific job descriptions"""
    
    def __init__(self, model: str = "gpt-4o-mini"):
        """
        Initialize job match optimizer
        
        Args:
            model: OpenAI model to use
        """
        settings = get_settings()
        self.llm = ChatOpenAI(
            model=model, 
            temperature=0.3,
            openai_api_key=settings.OPENAI_API_KEY
        )
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=settings.OPENAI_API_KEY
        )
    
    async def extract_job_requirements(self, job_description: str) -> Dict[str, Any]:
        """
        Extract key requirements from job description
        
        Args:
            job_description: Job description text
            
        Returns:
            Extracted requirements
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", """Extract key requirements from the job description.

Return a JSON object with:
{
    "role_title": "exact title",
    "required_skills": ["skill1", "skill2"],
    "preferred_skills": ["skill1", "skill2"],
    "experience_years": number or null,
    "education_required": "degree level",
    "key_responsibilities": ["resp1", "resp2"],
    "must_have_keywords": ["keyword1", "keyword2"],
    "nice_to_have_keywords": ["keyword1", "keyword2"],
    "company_culture": ["value1", "value2"],
    "tools_technologies": ["tool1", "tool2"]
}"""),
            ("human", "Job Description:\n{job_description}")
        ])
        
        chain = prompt | self.llm
        result = await chain.ainvoke({"job_description": job_description})
        
        try:
            content = result.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            return json.loads(content.strip())
        except:
            return {"error": "Failed to parse job requirements"}
    
    async def calculate_match_score(
        self,
        cv_data: CVData,
        job_description: str
    ) -> JobMatchResult:
        """
        Calculate how well CV matches job description
        
        Args:
            cv_data: CV data
            job_description: Job description
            
        Returns:
            Match result with score and recommendations
        """
        # Extract job requirements
        job_reqs = await self.extract_job_requirements(job_description)
        
        # Get embeddings for similarity
        cv_text = self._cv_to_text(cv_data)
        
        cv_embedding = await self.embeddings.aembed_query(cv_text)
        job_embedding = await self.embeddings.aembed_query(job_description)
        
        # Calculate cosine similarity
        similarity = self._cosine_similarity(cv_embedding, job_embedding)
        
        # Extract keywords from CV
        cv_skills = set(cv_data.skills)
        cv_text_lower = cv_text.lower()
        
        # Find matched and missing keywords
        required_skills = set(job_reqs.get("required_skills", []))
        preferred_skills = set(job_reqs.get("preferred_skills", []))
        must_have = set(job_reqs.get("must_have_keywords", []))
        
        matched_required = required_skills & cv_skills
        missing_required = required_skills - cv_skills
        
        matched_preferred = preferred_skills & cv_skills
        missing_preferred = preferred_skills - cv_skills
        
        # Calculate score (0-100)
        score_components = {
            "semantic_similarity": similarity * 40,  # 40 points
            "required_skills": (len(matched_required) / max(len(required_skills), 1)) * 30,  # 30 points
            "preferred_skills": (len(matched_preferred) / max(len(preferred_skills), 1)) * 20,  # 20 points
            "keywords": (len([k for k in must_have if k.lower() in cv_text_lower]) / max(len(must_have), 1)) * 10  # 10 points
        }
        
        total_score = sum(score_components.values())
        
        # Generate suggestions using LLM
        suggestions = await self._generate_suggestions(cv_data, job_reqs, missing_required, missing_preferred)
        
        # Check ATS friendliness
        ats_friendly = self._check_ats_friendly(cv_data)
        
        return JobMatchResult(
            match_score=round(total_score, 2),
            matched_keywords=list(matched_required | matched_preferred),
            missing_keywords=list(missing_required | missing_preferred),
            suggestions=suggestions,
            ats_friendly=ats_friendly
        )
    
    async def optimize_cv_for_job(
        self,
        cv_data: CVData,
        job_description: str
    ) -> CVData:
        """
        Optimize CV for specific job
        
        Args:
            cv_data: Original CV
            job_description: Target job description
            
        Returns:
            Optimized CV
        """
        # Get job requirements
        job_reqs = await self.extract_job_requirements(job_description)
        
        # Reorder and emphasize relevant skills
        if job_reqs.get("required_skills"):
            required = set(job_reqs["required_skills"])
            # Put matching skills first
            matching_skills = [s for s in cv_data.skills if s in required]
            other_skills = [s for s in cv_data.skills if s not in required]
            cv_data.skills = matching_skills + other_skills
        
        # Optimize summary
        if cv_data.summary:
            role = job_reqs.get("role_title", "")
            key_skills = job_reqs.get("must_have_keywords", [])[:5]
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", """Rewrite the professional summary to better match the target role.

Guidelines:
- Emphasize relevant experience for the target role
- Include key skills and technologies from the job description
- Maintain honesty - don't fabricate experience
- Keep it concise (2-3 sentences)
- Use keywords naturally, not keyword stuffing

Return only the rewritten summary."""),
                ("human", """Target Role: {role}
Key Skills Needed: {skills}

Current Summary:
{summary}""")
            ])
            
            chain = prompt | self.llm
            result = await chain.ainvoke({
                "role": role,
                "skills": ", ".join(key_skills),
                "summary": cv_data.summary
            })
            
            cv_data.summary = result.content.strip()
        
        return cv_data
    
    async def _generate_suggestions(
        self,
        cv_data: CVData,
        job_reqs: Dict,
        missing_required: set,
        missing_preferred: set
    ) -> List[str]:
        """Generate improvement suggestions"""
        suggestions = []
        
        if missing_required:
            suggestions.append(f"Add these required skills if you have them: {', '.join(list(missing_required)[:5])}")
        
        if missing_preferred:
            suggestions.append(f"Consider highlighting these preferred skills: {', '.join(list(missing_preferred)[:5])}")
        
        # Check experience alignment
        required_years = job_reqs.get("experience_years")
        if required_years and len(cv_data.experience) == 0:
            suggestions.append(f"Add work experience (role requires {required_years}+ years)")
        
        # Check education
        required_edu = job_reqs.get("education_required", "").lower()
        if required_edu and not cv_data.education:
            suggestions.append(f"Add education section (role requires {required_edu})")
        
        return suggestions
    
    @staticmethod
    def _cv_to_text(cv_data: CVData) -> str:
        """Convert CV data to text for embedding"""
        parts = []
        
        if cv_data.summary:
            parts.append(cv_data.summary)
        
        for exp in cv_data.experience:
            parts.append(f"{exp.position} at {exp.company}")
            if exp.description:
                parts.append(exp.description)
            parts.extend(exp.achievements)
        
        parts.extend(cv_data.skills)
        
        for proj in cv_data.projects:
            parts.append(f"{proj.name}: {proj.description}")
        
        return " ".join(parts)
    
    @staticmethod
    def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
    
    @staticmethod
    def _check_ats_friendly(cv_data: CVData) -> bool:
        """Check if CV is ATS-friendly"""
        issues = []
        
        # Check for contact info
        if not cv_data.contact.email:
            issues.append("Missing email")
        
        if not cv_data.contact.phone:
            issues.append("Missing phone")
        
        # Check for essential sections
        if not cv_data.experience:
            issues.append("No work experience")
        
        if not cv_data.education:
            issues.append("No education")
        
        if not cv_data.skills:
            issues.append("No skills listed")
        
        return len(issues) == 0


class ATSOptimizer:
    """Specific ATS optimization"""
    
    @staticmethod
    async def check_ats_compatibility(cv_data: CVData) -> Dict[str, Any]:
        """
        Check ATS compatibility
        
        Returns:
            Compatibility report
        """
        checks = {
            "has_contact_info": bool(cv_data.contact.email and cv_data.contact.phone),
            "has_work_experience": bool(cv_data.experience),
            "has_education": bool(cv_data.education),
            "has_skills": bool(cv_data.skills),
            "has_quantified_achievements": any(
                any(char.isdigit() for char in ach)
                for exp in cv_data.experience
                for ach in exp.achievements
            ),
            "experience_has_dates": all(
                exp.start_date for exp in cv_data.experience
            ),
            "clear_section_structure": True,  # Structural check
        }
        
        score = (sum(checks.values()) / len(checks)) * 100
        
        issues = [k.replace("_", " ").title() for k, v in checks.items() if not v]
        
        return {
            "ats_score": round(score, 1),
            "is_compatible": score >= 70,
            "passed_checks": sum(checks.values()),
            "total_checks": len(checks),
            "issues": issues,
            "recommendations": ATSOptimizer._get_recommendations(issues)
        }
    
    @staticmethod
    def _get_recommendations(issues: List[str]) -> List[str]:
        """Get recommendations based on issues"""
        recs = []
        
        if "Has Contact Info" in issues:
            recs.append("Add email and phone number for ATS parsing")
        
        if "Has Quantified Achievements" in issues:
            recs.append("Add numbers and metrics to achievements (%, $, time saved)")
        
        if "Experience Has Dates" in issues:
            recs.append("Include start and end dates for all positions")
        
        return recs
