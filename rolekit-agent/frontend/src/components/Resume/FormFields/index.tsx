import { ContactForm } from './ContactForm'
import { SummaryForm } from './SummaryForm'
import { ExperienceForm } from './ExperienceForm'
import type { Resume } from '@/types/resume'

interface FormFieldsProps {
  resume: Resume | null | undefined
  onChange: (section: string, field: string, value: unknown) => void
}

export const FormFields = ({ resume, onChange }: FormFieldsProps) => {
  if (!resume) return null

  return (
    <div className="space-y-6">
      <ContactForm
        contact={resume.content.contact}
        onChange={(field, value) => onChange('contact', field, value)}
      />
      <SummaryForm
        summary={resume.content.summary}
        onChange={(field, value) => onChange('summary', field, value)}
      />
      <ExperienceForm
        experience={resume.content.experience}
        onChange={(items) => onChange('experience', '', items)}
      />
    </div>
  )
}

