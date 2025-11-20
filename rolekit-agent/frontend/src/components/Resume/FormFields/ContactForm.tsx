import { Input } from '@/components/UI/Input'
import type { ContactInfo } from '@/types/resume'

interface ContactFormProps {
  contact?: ContactInfo
  onChange: (field: keyof ContactInfo, value: string) => void
}

export const ContactForm = ({ contact, onChange }: ContactFormProps) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    <h3 className="text-base font-semibold text-slate-900">Contact Information</h3>
    <p className="text-sm text-slate-500">
      Keep this section accurate for recruiters to reach out.
    </p>

    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Input
        label="Full Name"
        value={contact?.full_name ?? ''}
        onChange={(event) => onChange('full_name', event.target.value)}
        required
      />
      <Input
        label="Location"
        value={contact?.location ?? ''}
        onChange={(event) => onChange('location', event.target.value)}
      />
      <Input
        label="Email"
        type="email"
        value={contact?.email ?? ''}
        onChange={(event) => onChange('email', event.target.value)}
      />
      <Input
        label="Phone"
        value={contact?.phone ?? ''}
        onChange={(event) => onChange('phone', event.target.value)}
      />
      <Input
        label="Website"
        value={contact?.website ?? ''}
        onChange={(event) => onChange('website', event.target.value)}
      />
      <Input
        label="LinkedIn"
        value={contact?.linkedin ?? ''}
        onChange={(event) => onChange('linkedin', event.target.value)}
      />
    </div>
  </div>
)

