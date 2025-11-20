from typing import Dict, List

from openai import OpenAI

from app.core.config import get_settings


class AIService:
    def __init__(self, api_key: str | None = None):
        settings = get_settings()
        self.client = OpenAI(api_key=api_key or settings.openai_api_key)

    def enhance_text(self, text: str, context: str) -> Dict[str, List[str]]:
        prompt = f"""Improve this {context} entry for a professional resume.
Keep it concise, action-oriented, and quantify impact when possible.

Original:
{text}

Return three improved variations."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional resume writer."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=400,
        )

        suggestions = response.choices[0].message.content.split("\n")
        cleaned = [line.strip("-• ") for line in suggestions if line.strip()]
        return {
            "original": text,
            "suggestions": cleaned[:3],
        }

    def generate_cover_letter(self, resume_data: dict, job_description: str) -> str:
        prompt = f"""Create a compelling cover letter using the following resume data and job description.

Resume:
{resume_data}

Job Description:
{job_description}
"""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You craft tailored cover letters."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=600,
        )

        return response.choices[0].message.content

