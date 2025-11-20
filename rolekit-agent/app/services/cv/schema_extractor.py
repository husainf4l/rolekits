"""
CV Schema Extractor Node
Uses LLM to extract structured CV data from raw text
"""
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.models.cv_models import CVData
from app.core.config import get_settings
import json


class CVSchemaExtractor:
    """Extracts structured CV data using LLM"""
    
    def __init__(self, model: str = "gpt-4o-mini", temperature: float = 0.1):
        """
        Initialize the CV schema extractor
        
        Args:
            model: OpenAI model to use
            temperature: LLM temperature (lower for more structured output)
        """
        settings = get_settings()
        self.llm = ChatOpenAI(
            model=model, 
            temperature=temperature,
            openai_api_key=settings.OPENAI_API_KEY
        )
        self.parser = JsonOutputParser(pydantic_object=CVData)
        
        # Create extraction prompt
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self._get_system_prompt()),
            ("human", "{cv_text}")
        ])
        
        # Create the chain
        self.chain = self.prompt | self.llm | self.parser
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for CV extraction"""
        return """You are an expert CV parser. Extract structured information from the provided CV text.

Your task:
1. Parse the CV text carefully and extract ALL available information
2. Organize it into a structured JSON format
3. For work experience, extract:
   - Company name
   - Position/title
   - Dates (keep original format like "Jan 2020 - Present")
   - Location if mentioned
   - Bullet points as achievements with metrics when available
   - Technologies/tools used
4. For education, extract:
   - Institution name
   - Degree type and field of study
   - Dates
   - GPA if mentioned
   - Honors/awards
5. Extract skills, categorizing them if possible
6. Identify projects, certifications, languages, and other sections

Format guidelines:
- Use "Present" for current positions
- Keep date formats as provided (e.g., "Jan 2020", "2020-01", "2020")
- Extract quantifiable achievements (e.g., "Increased sales by 30%")
- Separate technical skills from soft skills when possible
- Preserve all URLs (LinkedIn, GitHub, portfolio, etc.)

{format_instructions}

Return ONLY valid JSON, no markdown code blocks or extra text."""
    
    async def extract(self, cv_text: str) -> CVData:
        """
        Extract structured CV data from text
        
        Args:
            cv_text: Raw CV text
            
        Returns:
            Structured CVData object
        """
        try:
            # Get format instructions from parser
            format_instructions = self.parser.get_format_instructions()
            
            # Invoke the chain
            result = await self.chain.ainvoke({
                "cv_text": cv_text,
                "format_instructions": format_instructions
            })
            
            # Convert to CVData
            return CVData(**result)
            
        except Exception as e:
            raise ValueError(f"Failed to extract CV schema: {str(e)}")
    
    async def extract_with_context(
        self,
        cv_text: str,
        target_role: str = None,
        additional_context: str = None
    ) -> CVData:
        """
        Extract CV with additional context for better parsing
        
        Args:
            cv_text: Raw CV text
            target_role: Target job role (helps with skills extraction)
            additional_context: Any additional context
            
        Returns:
            Structured CVData object
        """
        # Add context to the prompt if provided
        context_parts = []
        if target_role:
            context_parts.append(f"Target role: {target_role}")
        if additional_context:
            context_parts.append(additional_context)
        
        if context_parts:
            enhanced_text = f"Context: {' | '.join(context_parts)}\n\n{cv_text}"
        else:
            enhanced_text = cv_text
        
        return await self.extract(enhanced_text)


class CVSchemaValidator:
    """Validates and cleans extracted CV data"""
    
    @staticmethod
    def validate_and_clean(cv_data: CVData) -> CVData:
        """
        Validate and clean CV data
        
        Args:
            cv_data: Raw CV data
            
        Returns:
            Cleaned CV data
        """
        # Ensure contact info has at least a name
        if not cv_data.contact.full_name or cv_data.contact.full_name.strip() == "":
            cv_data.contact.full_name = "Unknown"
        
        # Clean URLs - ensure they start with http:// or https://
        if cv_data.contact.linkedin and not cv_data.contact.linkedin.startswith(('http://', 'https://')):
            cv_data.contact.linkedin = f"https://{cv_data.contact.linkedin}"
        
        if cv_data.contact.github and not cv_data.contact.github.startswith(('http://', 'https://')):
            cv_data.contact.github = f"https://{cv_data.contact.github}"
        
        if cv_data.contact.website and not cv_data.contact.website.startswith(('http://', 'https://')):
            cv_data.contact.website = f"https://{cv_data.contact.website}"
        
        # Remove duplicate skills
        if cv_data.skills:
            cv_data.skills = list(dict.fromkeys(cv_data.skills))
        
        # Sort experience by start date (most recent first)
        if cv_data.experience:
            cv_data.experience.sort(
                key=lambda x: x.start_date.lower() == "present" or x.start_date,
                reverse=True
            )
        
        # Sort education by end date (most recent first)
        if cv_data.education:
            cv_data.education.sort(
                key=lambda x: x.end_date or "",
                reverse=True
            )
        
        return cv_data
    
    @staticmethod
    async def validate_with_llm(cv_data: CVData, llm: ChatOpenAI = None) -> Dict[str, Any]:
        """
        Use LLM to validate CV data quality
        
        Args:
            cv_data: CV data to validate
            llm: LLM instance (creates new if None)
            
        Returns:
            Validation results with issues and suggestions
        """
        settings = get_settings()
        if llm is None:
            llm = ChatOpenAI(
                model="gpt-4o-mini", 
                temperature=0.2,
                openai_api_key=settings.OPENAI_API_KEY
            )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a CV quality validator. Analyze the CV data and identify:
1. Missing critical information (contact details, work dates, etc.)
2. Formatting inconsistencies (date formats, capitalization)
3. Vague or unclear descriptions
4. Missing quantifiable achievements
5. Any red flags or issues

Return a JSON object with:
{{
    "is_valid": true/false,
    "quality_score": 0-100,
    "issues": ["list of issues found"],
    "suggestions": ["list of improvement suggestions"]
}}"""),
            ("human", "Validate this CV:\n\n{cv_json}")
        ])
        
        chain = prompt | llm | JsonOutputParser()
        
        result = await chain.ainvoke({
            "cv_json": cv_data.model_dump_json(indent=2)
        })
        
        return result
