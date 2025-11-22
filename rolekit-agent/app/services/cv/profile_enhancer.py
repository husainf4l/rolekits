"""
Profile Enhancer Node
Uses LLM to enhance CV content with professional phrasing and impact statements
"""
from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.models.cv_models import CVData, WorkExperience
from app.core.config import get_settings
import json


class ProfileEnhancer:
    """Enhances CV content using LLM"""
    
    def __init__(self, model: str = "gpt-4o-mini", temperature: float = 0.7):
        """
        Initialize the profile enhancer
        
        Args:
            model: OpenAI model to use
            temperature: LLM temperature
        """
        settings = get_settings()
        self.llm = ChatOpenAI(
            model=model, 
            temperature=temperature,
            openai_api_key=settings.OPENAI_API_KEY
        )
    
    async def enhance_summary(self, summary: str, role: str = None, experience_level: str = None) -> str:
        """
        Enhance professional summary
        
        Args:
            summary: Original summary
            role: Target role
            experience_level: junior, mid, senior, lead
            
        Returns:
            Enhanced summary
        """
        context = []
        if role:
            context.append(f"Target role: {role}")
        if experience_level:
            context.append(f"Experience level: {experience_level}")
        
        context_str = " | ".join(context) if context else "General enhancement"
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert CV writer. Enhance the professional summary to be:
1. Concise and impactful (2-3 sentences max)
2. Start with years of experience and core expertise
3. Highlight key achievements with numbers/metrics
4. Include relevant skills and technologies
5. End with career goals or value proposition

Guidelines:
- Use action-oriented language
- Avoid clichés ("team player", "hard worker")
- Focus on unique value and measurable impact
- Tailor to the target role if provided
- Keep it professional yet engaging

Return ONLY the enhanced summary, no extra text or explanation."""),
            ("human", f"Context: {context_str}\n\nOriginal summary:\n{summary}")
        ])
        
        chain = prompt | self.llm
        result = await chain.ainvoke({})
        
        return result.content.strip()
    
    async def enhance_experience_description(
        self,
        experience: WorkExperience,
        focus_on: List[str] = None
    ) -> WorkExperience:
        """
        Enhance work experience descriptions
        
        Args:
            experience: Work experience entry
            focus_on: Focus areas (impact, clarity, keywords)
            
        Returns:
            Enhanced work experience
        """
        focus_areas = focus_on or ["impact", "clarity", "keywords"]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at writing impactful work experience descriptions AND job title optimization.

Your tasks:

**PART 1: Validate & Correct Job Title**
- Check if the job title provided is written correctly and professionally
- Fix common mistakes: typos, poor grammar, inconsistent capitalization, awkward phrasing
- Ensure it follows industry-standard naming conventions
- Examples of corrections:
  ✓ "sofware engineer" → "Software Engineer"
  ✓ "Sr. developer" → "Senior Developer"
  ✓ "web dev" → "Web Developer"
  ✓ "manager/lead" → "Engineering Manager" or "Team Lead"
  ✓ "devops eng" → "DevOps Engineer"
- If the title is already correct, keep it unchanged
- IMPORTANT: Only return corrected title if there's an actual issue, otherwise keep original

**PART 2: Transform the job description following these rules:**

**Context & Understanding:**
- Use the job title (corrected if needed) to understand the core responsibilities and expectations
- The position and job title define the scope
- Tailor achievements to be relevant to this specific role
- Consider industry-standard responsibilities for this position level
- Highlight what makes this person stand out in this exact role

**Structure:**
- Create 3-5 bullet points
- Each bullet should have a clear action → result format
- Start with strong action verbs (Led, Developed, Optimized, Implemented, etc.)

**Content Requirements:**
- Add quantifiable metrics (%, $, time saved, users impacted)
- Use the STAR method (Situation, Task, Action, Result) implicitly
- Highlight technical skills and tools used (especially those common in the specific role)
- Show progression and scope of responsibility
- Demonstrate business impact and value delivered
- Ensure achievements align with what's expected in the position

**Writing Style:**
- Be specific and concrete (not vague)
- Use active voice, not passive
- Avoid jargon and buzzwords
- Keep bullets concise (1-2 lines max)
- Use parallel structure (consistent verb tense)

**Example Good Bullets:**
✅ "Led development of microservices architecture using Node.js and AWS, reducing API latency by 60% and serving 2M+ daily requests"
✅ "Implemented CI/CD pipeline with GitHub Actions, decreasing deployment time from 2 hours to 15 minutes and improving release frequency by 3x"

**Example Bad Bullets:**
❌ "Responsible for developing features"
❌ "Worked on various projects using modern technologies"

Return ONLY a JSON object with TWO fields (no explanation):
{{
  "corrected_position": "The corrected/validated job title",
  "bullets": ["bullet 1", "bullet 2", ...]
}}"""),
            ("human", """Job Title: {position} at {company}
Current description: {description}
Current achievements: {achievements}
Technologies used: {technologies}

Context: The primary job title is the one provided above. Use this to understand:
- What skills and responsibilities are core to this role
- What achievements would be most impressive for someone in this position
- What metrics and outcomes matter most for this role

Tasks:
1. Check if job title is written correctly (grammar, capitalization, industry standard)
2. Correct if needed, keep if already correct
3. Generate 3-5 enhanced bullet points based on the role

Enhance the description with focus on: {focus_areas}""")
        ])
        
        chain = prompt | self.llm
        
        result = await chain.ainvoke({
            "position": experience.position,
            "company": experience.company,
            "description": experience.description or "Not provided",
            "achievements": json.dumps(experience.achievements) if experience.achievements else "[]",
            "technologies": ", ".join(experience.technologies) if experience.technologies else "Not specified",
            "focus_areas": ", ".join(focus_areas)
        })
        
        # Parse the result
        content = result.content.strip()
        
        # Try to extract JSON with corrected position and bullets
        try:
            # Remove markdown code blocks if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            response_data = json.loads(content.strip())
            
            # Update position if it was corrected
            if isinstance(response_data, dict):
                if "corrected_position" in response_data and response_data["corrected_position"]:
                    corrected_title = response_data["corrected_position"].strip()
                    # Only update if different from original (meaning LLM corrected it)
                    if corrected_title and corrected_title != experience.position:
                        experience.position = corrected_title
                
                # Update achievements/bullets
                if "bullets" in response_data:
                    enhanced_bullets = response_data["bullets"]
                    if isinstance(enhanced_bullets, list):
                        experience.achievements = enhanced_bullets
                    else:
                        # Fallback if bullets is a string
                        experience.achievements = [enhanced_bullets]
            else:
                # Legacy support: if response is just an array
                if isinstance(response_data, list):
                    experience.achievements = response_data
            
        except json.JSONDecodeError:
            # If JSON parsing fails, split by newlines
            bullets = [line.strip().lstrip('•-*').strip() 
                      for line in content.split('\n') 
                      if line.strip() and not line.strip().startswith('[')]
            experience.achievements = bullets
        
        return experience
    
    async def enhance_education_degree(self, education_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance and validate education degree field
        
        Args:
            education_data: Education entry with school, degree, field_of_study
            
        Returns:
            Enhanced education data with corrected/formatted degree
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at validating and enhancing education credentials.

Your task: Validate and enhance the degree field

**PART 1: Validate & Correct Degree**
- Check if the degree is written correctly and professionally
- Fix common mistakes: typos, poor grammar, inconsistent capitalization, awkward phrasing
- Ensure it follows academic naming conventions
- Examples of corrections:
  ✓ "bsc computer scince" → "Bachelor of Science in Computer Science"
  ✓ "B.A english" → "Bachelor of Arts in English"
  ✓ "mba" → "Master of Business Administration"
  ✓ "PhD Physics" → "Doctor of Philosophy in Physics"
  ✓ "BS" → "Bachelor of Science"
- If the degree is already correct, keep it unchanged
- Be formal and use full names (not abbreviations unless standard)

**Return Format:**
Return ONLY a JSON object with one field:
{{
  "enhanced_degree": "The corrected/enhanced degree"
}}"""),
            ("human", """School/University: {school}
Current Degree: {degree}
Field of Study: {field_of_study}

Please validate and enhance the degree field if needed.""")
        ])
        
        chain = prompt | self.llm
        result = await chain.ainvoke({
            "school": education_data.get("institution") or education_data.get("school") or "Unknown",
            "degree": education_data.get("degree") or "Not provided",
            "field_of_study": education_data.get("field_of_study") or ""
        })
        
        # Parse the result
        content = result.content.strip()
        
        try:
            # Remove markdown code blocks if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            response_data = json.loads(content.strip())
            
            # Update degree if it was enhanced
            if isinstance(response_data, dict) and "enhanced_degree" in response_data:
                enhanced_degree = response_data["enhanced_degree"].strip()
                if enhanced_degree:
                    education_data["degree"] = enhanced_degree
            
        except json.JSONDecodeError:
            # If JSON parsing fails, just keep the original
            pass
        
        return education_data
    
    async def enhance_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance project description and technologies
        
        Args:
            project_data: Project information dict with name, description, technologies, etc.
            
        Returns:
            Enhanced project data with improved description and technologies
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at enhancing project descriptions for professional portfolios.

Your task: Enhance and validate the project information

**PART 1: Enhance Description**
- Make the description more impactful and results-focused
- Add metrics and outcomes if possible
- Use professional, concise language
- Highlight the key achievements and business value
- Keep it between 1-3 sentences

**PART 2: Validate & Enhance Technologies**
- Review the list of technologies
- Ensure proper capitalization and naming conventions
- Remove duplicates
- Ensure they are actual technologies/tools
- Examples: "react" → "React", "node" → "Node.js", "sql" → "SQL", etc.
- Keep them in a comma-separated list format

**Return Format:**
Return ONLY a JSON object with these fields:
{{
  "enhanced_description": "The improved project description",
  "enhanced_technologies": ["Technology 1", "Technology 2", "Technology 3"]
}}"""),
            ("human", """Project Name: {name}
Current Description: {description}
Current Technologies: {technologies}
Project URL: {url}
Repository: {repository}

Please enhance the description and validate the technologies list.""")
        ])
        
        chain = prompt | self.llm
        
        # Format technologies for the prompt
        tech_list = ", ".join(project_data.get("technologies", [])) if project_data.get("technologies") else "Not provided"
        
        result = await chain.ainvoke({
            "name": project_data.get("name") or "Untitled Project",
            "description": project_data.get("description") or "No description provided",
            "technologies": tech_list,
            "url": project_data.get("url") or "",
            "repository": project_data.get("repository") or ""
        })
        
        # Parse the result
        content = result.content.strip()
        
        try:
            # Remove markdown code blocks if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            response_data = json.loads(content.strip())
            
            # Update description if it was enhanced
            if isinstance(response_data, dict):
                if "enhanced_description" in response_data:
                    enhanced_desc = response_data["enhanced_description"].strip()
                    if enhanced_desc:
                        project_data["description"] = enhanced_desc
                
                if "enhanced_technologies" in response_data:
                    enhanced_techs = response_data["enhanced_technologies"]
                    if isinstance(enhanced_techs, list) and enhanced_techs:
                        project_data["technologies"] = enhanced_techs
            
        except json.JSONDecodeError:
            # If JSON parsing fails, just keep the original
            pass
        
        return project_data
    
    async def enhance_full_cv(
        self,
        cv_data: CVData,
        target_role: str = None,
        enhancement_focus: List[str] = None
    ) -> CVData:
        """
        Enhance complete CV
        
        Args:
            cv_data: Original CV data
            target_role: Target job role
            enhancement_focus: Focus areas
            
        Returns:
            Enhanced CV data
        """
        focus = enhancement_focus or ["clarity", "impact", "keywords"]
        
        # Enhance summary
        if cv_data.summary:
            experience_years = len(cv_data.experience)
            level = "senior" if experience_years > 5 else "mid" if experience_years > 2 else "junior"
            
            cv_data.summary = await self.enhance_summary(
                cv_data.summary,
                role=target_role,
                experience_level=level
            )
        
        # Enhance each work experience
        enhanced_experiences = []
        for exp in cv_data.experience:
            enhanced_exp = await self.enhance_experience_description(exp, focus_on=focus)
            enhanced_experiences.append(enhanced_exp)
        
        cv_data.experience = enhanced_experiences
        
        return cv_data
    
    async def rewrite_with_tone(self, text: str, tone: str = "professional") -> str:
        """
        Rewrite text with specific tone
        
        Args:
            text: Original text
            tone: Desired tone (professional, confident, humble, technical)
            
        Returns:
            Rewritten text
        """
        tone_guidelines = {
            "professional": "formal, polished, and business-appropriate",
            "confident": "assertive and achievement-focused",
            "humble": "modest yet competent, team-oriented",
            "technical": "detailed and technically precise"
        }
        
        tone_desc = tone_guidelines.get(tone, tone)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", f"Rewrite the text with a {tone_desc} tone. Maintain the key information but adjust the language style. Return only the rewritten text."),
            ("human", "{text}")
        ])
        
        chain = prompt | self.llm
        result = await chain.ainvoke({"text": text})
        
        return result.content.strip()

    async def suggest_skills(self, cv_data: Dict[str, Any]) -> List[str]:
        """
        Suggest relevant skills based on experience, projects, and technologies
        
        Args:
            cv_data: CV data with experience, projects, and existing skills
            
        Returns:
            List of suggested skill names
        """
        # Extract context from experience, projects, and technologies
        experience_context = []
        
        # Add job titles and descriptions from experience
        if cv_data.get('experience'):
            for exp in cv_data['experience']:
                if exp.get('position'):
                    experience_context.append(f"Position: {exp['position']}")
                if exp.get('description'):
                    experience_context.append(f"Description: {exp['description']}")
        
        # Add project info and technologies
        if cv_data.get('projects'):
            for proj in cv_data['projects']:
                if proj.get('name'):
                    experience_context.append(f"Project: {proj['name']}")
                if proj.get('description'):
                    experience_context.append(f"Project Details: {proj['description']}")
                if proj.get('technologies'):
                    techs = proj['technologies']
                    if isinstance(techs, list):
                        experience_context.append(f"Technologies: {', '.join(techs)}")
                    else:
                        experience_context.append(f"Technologies: {techs}")
        
        # Get existing skills to avoid duplicates
        existing_skills = cv_data.get('skills', [])
        
        context_str = "\n".join(experience_context)
        existing_skills_str = ", ".join(existing_skills) if existing_skills else "None yet"
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert career coach who helps professionals identify relevant skills based on their experience.

Given a professional's experience, projects, and technologies, suggest 8-12 relevant skills that would strengthen their profile.

Rules:
1. Only suggest skills NOT already in their list
2. Include technical skills (programming languages, tools, frameworks)
3. Include soft skills relevant to their experience
4. Focus on skills that are demonstrated by their work
5. Order by relevance - most important first

Return ONLY a JSON array of skill names (no descriptions, just names):
["Skill1", "Skill2", "Skill3", ...]

Example:
["Python", "Machine Learning", "Data Analysis", "Problem Solving", "Team Leadership", "Cloud Computing"]"""),
            ("human", """
Professional Experience and Context:
{context}

Existing Skills (avoid these):
{existing_skills}

Suggested Skills (JSON array only):""")
        ])
        
        chain = prompt | self.llm
        result = await chain.ainvoke({
            "context": context_str,
            "existing_skills": existing_skills_str
        })
        
        try:
            content = result.content.strip()
            
            # Parse JSON array from response
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            # Find JSON array in the content
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                skills = json.loads(json_str)
                
                # Filter out existing skills (case-insensitive)
                existing_lower = {s.lower() for s in existing_skills}
                suggested = [s for s in skills if s.lower() not in existing_lower]
                
                return suggested[:12]  # Return max 12 suggestions
            
            return []
        except Exception as e:
            print(f"Error parsing suggested skills: {e}")
            print(f"Response content: {result.content}")
            return []


class ImpactQuantifier:
    """Adds quantifiable metrics to achievements"""
    
    def __init__(self, model: str = "gpt-4o-mini"):
        settings = get_settings()
        self.llm = ChatOpenAI(
            model=model, 
            temperature=0.6,
            openai_api_key=settings.OPENAI_API_KEY
        )
    
    async def suggest_metrics(self, achievement: str) -> List[str]:
        """
        Suggest ways to add metrics to an achievement
        
        Args:
            achievement: Achievement description
            
        Returns:
            List of suggestions with metrics
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at quantifying achievements in CVs.

Given an achievement, suggest 3 ways to add metrics or numbers to make it more impactful.

Types of metrics to consider:
- Percentages (%, increase/decrease)
- Time saved (hours, days, months)
- Money (revenue, cost savings)
- Scale (users, customers, team size)
- Frequency (daily, weekly, monthly)
- Quality (error rate, uptime, satisfaction)

Return as JSON array:
["suggestion 1 with metric", "suggestion 2 with metric", "suggestion 3 with metric"]

Example:
Input: "Improved the application performance"
Output: [
  "Optimized application performance, reducing page load time by 45% (from 3.2s to 1.8s)",
  "Improved application performance by implementing caching, serving 10,000+ daily users with 99.9% uptime",
  "Enhanced application performance through code optimization, decreasing server costs by $5K/month"
]"""),
            ("human", "Achievement: {achievement}")
        ])
        
        chain = prompt | self.llm
        result = await chain.ainvoke({"achievement": achievement})
        
        try:
            content = result.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            suggestions = json.loads(content.strip())
            return suggestions
        except:
            return [result.content.strip()]

