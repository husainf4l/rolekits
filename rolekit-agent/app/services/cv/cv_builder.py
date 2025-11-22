"""
CV Builder Node
Generates formatted CV in various formats (Markdown, HTML, JSON)
"""
from typing import Dict, Any, Optional
from app.models.cv_models import CVData
from jinja2 import Template
from datetime import datetime


class CVBuilder:
    """Builds formatted CVs from structured data"""
    
    @staticmethod
    def to_markdown(cv_data: CVData, template: str = "default") -> str:
        """
        Convert CV data to Markdown format
        
        Args:
            cv_data: Structured CV data
            template: Template name
            
        Returns:
            Markdown formatted CV
        """
        md_template = """# {{ contact.full_name }}

{% if contact.location or contact.email or contact.phone %}
{% if contact.location %}📍 {{ contact.location }}{% endif %}
{% if contact.email %} | ✉️ {{ contact.email }}{% endif %}
{% if contact.phone %} | 📞 {{ contact.phone }}{% endif %}
{% endif %}

{% if contact.linkedin or contact.github or contact.website %}
{% if contact.linkedin %}[LinkedIn]({{ contact.linkedin }}){% endif %}
{% if contact.github %} | [GitHub]({{ contact.github }}){% endif %}
{% if contact.website %} | [Website]({{ contact.website }}){% endif %}
{% endif %}

---

{% if summary %}
## Professional Summary

{{ summary }}
{% endif %}

{% if experience %}
## Work Experience

{% for exp in experience %}
### {{ exp.position }}
**{{ exp.company }}**{% if exp.location %} | {{ exp.location }}{% endif %}  
*{{ exp.start_date }}{% if exp.end_date %} - {{ exp.end_date }}{% else %}{% if exp.start_date %} - Present{% endif %}{% endif %}*

{% if exp.description %}
{{ exp.description }}
{% endif %}

{% if exp.achievements %}
{% for achievement in exp.achievements %}
- {{ achievement }}
{% endfor %}
{% endif %}

{% if exp.technologies %}
**Technologies:** {{ exp.technologies|join(', ') }}
{% endif %}

{% endfor %}
{% endif %}

{% if education %}
## Education

{% for edu in education %}
### {{ edu.degree }} in {{ edu.field_of_study }}
**{{ edu.institution }}**{% if edu.location %} | {{ edu.location }}{% endif %}  
{% if edu.start_date or edu.end_date %}*{% if edu.start_date %}{{ edu.start_date }}{% endif %}{% if edu.end_date %} - {{ edu.end_date }}{% endif %}*{% endif %}

{% if edu.gpa %}**GPA:** {{ edu.gpa }}{% endif %}

{% if edu.honors %}
{% for honor in edu.honors %}
- {{ honor }}
{% endfor %}
{% endif %}

{% endfor %}
{% endif %}

{% if skills %}
## Skills

{{ skills|join(' • ') }}
{% endif %}

{% if projects %}
## Projects

{% for project in projects %}
### {{ project.name }}
{% if project.url or project.repository %}
{% if project.url %}[Demo]({{ project.url }}){% endif %}{% if project.repository %} | [Code]({{ project.repository }}){% endif %}
{% endif %}

{{ project.description }}

{% if project.technologies %}
**Tech Stack:** {{ project.technologies|join(', ') }}
{% endif %}

{% if project.highlights %}
{% for highlight in project.highlights %}
- {{ highlight }}
{% endfor %}
{% endif %}

{% endfor %}
{% endif %}

{% if certifications %}
## Certifications

{% for cert in certifications %}
- **{{ cert.name }}** - {{ cert.issuer }}{% if cert.date_obtained %} ({{ cert.date_obtained }}){% endif %}
{% endfor %}
{% endif %}

{% if languages %}
## Languages

{% for lang in languages %}
- **{{ lang.language }}**: {{ lang.proficiency }}
{% endfor %}
{% endif %}

{% if awards %}
## Awards & Honors

{% for award in awards %}
- {{ award }}
{% endfor %}
{% endif %}
"""
        
        template_obj = Template(md_template)
        return template_obj.render(**cv_data.model_dump())
    
    @staticmethod
    def to_html(cv_data: CVData, style: str = "modern") -> str:
        """
        Convert CV data to HTML format
        
        Args:
            cv_data: Structured CV data
            style: Style theme (modern, classic, minimal)
            
        Returns:
            HTML formatted CV
        """
        html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ contact.full_name }} - CV</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
        }
        
        .cv-container {
            background: white;
            padding: 60px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            color: #1a1a1a;
        }
        
        .contact-info {
            font-size: 0.95rem;
            color: #666;
            margin-bottom: 1rem;
        }
        
        .contact-links {
            margin-bottom: 2rem;
        }
        
        .contact-links a {
            color: #0066cc;
            text-decoration: none;
            margin-right: 15px;
        }
        
        .contact-links a:hover {
            text-decoration: underline;
        }
        
        hr {
            border: none;
            border-top: 2px solid #e0e0e0;
            margin: 2rem 0;
        }
        
        h2 {
            font-size: 1.5rem;
            color: #1a1a1a;
            margin-top: 2rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 0.5rem;
        }
        
        .summary {
            font-size: 1.05rem;
            line-height: 1.7;
            margin-bottom: 2rem;
            color: #444;
        }
        
        .job, .education-item, .project {
            margin-bottom: 1.8rem;
        }
        
        .job-title, .edu-degree, .project-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 0.3rem;
        }
        
        .company, .institution {
            font-size: 1.05rem;
            color: #0066cc;
            font-weight: 500;
            margin-bottom: 0.2rem;
        }
        
        .date-range {
            font-size: 0.9rem;
            color: #666;
            font-style: italic;
            margin-bottom: 0.5rem;
        }
        
        ul {
            margin-left: 1.5rem;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        li {
            margin-bottom: 0.35rem;
            line-height: 1.5;
        }
        
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 1rem;
        }
        
        .skill-tag {
            background: #f0f0f0;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 0.9rem;
            color: #333;
        }
        
        .tech-stack {
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #666;
        }
        
        .future-goals {
            font-size: 1.05rem;
            line-height: 1.7;
            margin-bottom: 2rem;
            color: #444;
            padding: 1rem;
            background: #f9f9f9;
            border-left: 4px solid #0066cc;
            border-radius: 4px;
        }
        
        /* Print optimization - prevent section breaks */
        @media print {
            body {
                background: white;
            }
            
            .cv-container {
                box-shadow: none;
                padding: 0;
            }
            
            /* Prevent sections from splitting across pages */
            h2 {
                page-break-after: avoid;
                page-break-inside: avoid;
                margin-top: 1.5rem;
                margin-bottom: 1rem;
                orphans: 3;
                widows: 3;
            }
            
            /* Keep job, education, and project items together */
            .job,
            .education-item,
            .project {
                page-break-inside: avoid;
                orphans: 3;
                widows: 3;
            }
            
            /* Keep skills section together */
            .skills {
                page-break-inside: avoid;
            }
            
            /* Keep lists together */
            ul {
                page-break-inside: avoid;
            }
            
            /* Ensure header stays with content */
            h1 {
                page-break-after: avoid;
            }
            
            .contact-info,
            .contact-links {
                page-break-after: avoid;
            }
            
            hr {
                page-break-after: avoid;
            }
            
            .summary {
                page-break-inside: avoid;
                orphans: 2;
                widows: 2;
            }
            
            /* Tighten margins for better page utilization */
            body {
                padding: 20px;
            }
            
            .cv-container {
                padding: 40px 20px;
            }
            
            /* Reduce spacing to fit better on pages */
            h2 {
                margin-top: 1.2rem;
            }
            
            .job,
            .education-item,
            .project {
                margin-bottom: 1.5rem;
            }
        }
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <h1>{{ contact.full_name }}</h1>
        
        <div class="contact-info">
            {% if contact.location %}📍 {{ contact.location }}{% endif %}
            {% if contact.email %} | ✉️ {{ contact.email }}{% endif %}
            {% if contact.phone %} | 📞 {{ contact.phone }}{% endif %}
        </div>
        
        {% if contact.linkedin or contact.github or contact.website %}
        <div class="contact-links">
            {% if contact.linkedin %}<a href="{{ contact.linkedin }}" target="_blank">LinkedIn</a>{% endif %}
            {% if contact.github %}<a href="{{ contact.github }}" target="_blank">GitHub</a>{% endif %}
            {% if contact.website %}<a href="{{ contact.website }}" target="_blank">Website</a>{% endif %}
        </div>
        {% endif %}
        
        <hr>
        
        {% if summary %}
        <h2>Professional Summary</h2>
        <div class="summary">{{ summary }}</div>
        {% endif %}
        
        {% if experience %}
        <h2>Work Experience</h2>
        {% for exp in experience %}
            <div class="job">
            <div class="job-title">{{ exp.position }}</div>
            <div class="company">{{ exp.company }}{% if exp.location %} | {{ exp.location }}{% endif %}</div>
            <div class="date-range">{{ exp.start_date }}{% if exp.end_date %} - {{ exp.end_date }}{% else %}{% if exp.start_date %} - Present{% endif %}{% endif %}</div>            {% if exp.description %}
            <p style="margin-top: 0.5rem;">{{ exp.description }}</p>
            {% endif %}
            
            {% if exp.achievements %}
            <ul>
                {% for achievement in exp.achievements %}
                <li>{{ achievement }}</li>
                {% endfor %}
            </ul>
            {% endif %}
            
            {% if exp.technologies %}
            <div class="tech-stack"><strong>Technologies:</strong> {{ exp.technologies|join(', ') }}</div>
            {% endif %}
        </div>
        {% endfor %}
        {% endif %}
        
        {% if education %}
        <h2>Education</h2>
        {% for edu in education %}
        <div class="education-item">
            <div class="edu-degree">{{ edu.degree }} in {{ edu.field_of_study }}</div>
            <div class="institution">{{ edu.institution }}{% if edu.location %} | {{ edu.location }}{% endif %}</div>
            {% if edu.start_date or edu.end_date %}
            <div class="date-range">{% if edu.start_date %}{{ edu.start_date }}{% endif %}{% if edu.end_date %} - {{ edu.end_date }}{% endif %}</div>
            {% endif %}
            
            {% if edu.gpa %}
            <div style="margin-top: 0.5rem;"><strong>GPA:</strong> {{ edu.gpa }}</div>
            {% endif %}
            
            {% if edu.honors %}
            <ul>
                {% for honor in edu.honors %}
                <li>{{ honor }}</li>
                {% endfor %}
            </ul>
            {% endif %}
        </div>
        {% endfor %}
        {% endif %}
        
        {% if projects %}
        <h2>Projects</h2>
        {% for project in projects %}
        <div class="project">
            <div class="project-name">{{ project.name }}</div>
            {% if project.url or project.repository %}
            <div class="contact-links">
                {% if project.url %}<a href="{{ project.url }}" target="_blank">Demo</a>{% endif %}
                {% if project.repository %}<a href="{{ project.repository }}" target="_blank">Code</a>{% endif %}
            </div>
            {% endif %}
            
            <p>{{ project.description }}</p>
            
            {% if project.technologies %}
            <div class="tech-stack"><strong>Tech Stack:</strong> {{ project.technologies|join(', ') }}</div>
            {% endif %}
            
            {% if project.highlights %}
            <ul>
                {% for highlight in project.highlights %}
                <li>{{ highlight }}</li>
                {% endfor %}
            </ul>
            {% endif %}
        </div>
        {% endfor %}
        {% endif %}
        
        {% if skills %}
        <h2>Skills</h2>
        <div class="skills">
            {% for skill in skills %}
            <span class="skill-tag">{{ skill }}</span>
            {% endfor %}
        </div>
        {% endif %}
        
        {% if certifications %}
        <h2>Certifications</h2>
        <ul>
            {% for cert in certifications %}
            <li><strong>{{ cert.name }}</strong> - {{ cert.issuer }}{% if cert.date_obtained %} ({{ cert.date_obtained }}){% endif %}</li>
            {% endfor %}
        </ul>
        {% endif %}
        
        {% if languages %}
        <h2>Languages</h2>
        <ul>
            {% for lang in languages %}
            <li><strong>{{ lang.language }}:</strong> {{ lang.proficiency }}</li>
            {% endfor %}
        </ul>
        {% endif %}
        
        {% if awards %}
        <h2>Awards & Honors</h2>
        <ul>
            {% for award in awards %}
            <li>{{ award }}</li>
            {% endfor %}
        </ul>
        {% endif %}
        
        {% if future_goals %}
        <h2>Future Goals</h2>
        <div class="future-goals">
            {{ future_goals }}
        </div>
        {% endif %}
    </div>
</body>
</html>"""
        
        template_obj = Template(html_template)
        return template_obj.render(**cv_data.model_dump())
    
    @staticmethod
    def to_json(cv_data: CVData, pretty: bool = True) -> str:
        """
        Convert CV data to JSON format
        
        Args:
            cv_data: Structured CV data
            pretty: Pretty print JSON
            
        Returns:
            JSON string
        """
        indent = 2 if pretty else None
        return cv_data.model_dump_json(indent=indent)
