import uuid
from typing import Iterable

from sqlalchemy.orm import Session

from app.data.templates import TEMPLATES
from app.db.session import SessionLocal
from app.models.template import Template


def seed_templates(db: Session, templates: Iterable[dict]) -> None:
    for template_data in templates:
        template_id = template_data.get("id") or str(uuid.uuid4())
        template_uuid = uuid.UUID(str(template_id))
        existing = db.query(Template).filter(Template.id == template_uuid).first()
        if existing:
            continue

        template = Template(
            id=template_uuid,
            name=template_data["name"],
            category=template_data.get("category"),
            html_template=template_data["html_template"],
            css_styles=template_data["css_styles"],
            preview_image_url=template_data.get("preview_image_url"),
            is_ats_optimized=template_data.get("is_ats_optimized", True),
            is_active=template_data.get("is_active", True),
        )
        db.add(template)
    db.commit()


def main() -> None:
    db = SessionLocal()
    try:
        seed_templates(db, TEMPLATES)
        print(f"Seeded {len(TEMPLATES)} templates.")
    finally:
        db.close()


if __name__ == "__main__":
    main()

