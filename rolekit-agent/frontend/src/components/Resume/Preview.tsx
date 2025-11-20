import type { Resume } from '@/types/resume'
import { formatDateRange } from '@/utils/formatters'

interface PreviewProps {
  resume: Resume | null | undefined
  template: string | null | undefined
}

export const Preview = ({ resume, template }: PreviewProps) => {
  if (!resume) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Select or create a resume to start editing
      </div>
    )
  }

  const { contact, summary, experience, education, skills } = resume.content

  return (
    <div className="min-h-full bg-white p-8">
      <div className="rounded-3xl border border-slate-200 p-10 shadow-lg">
        <div className="space-y-1 border-b border-slate-200 pb-6 text-center">
          <p className="text-3xl font-bold text-slate-900">{contact.full_name}</p>
          <p className="text-sm text-slate-500">{summary.headline}</p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500">
            <span>{contact.email}</span>
            <span>{contact.phone}</span>
            <span>{contact.location}</span>
            {contact.website && <span>{contact.website}</span>}
          </div>
          {template && (
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              Template: {template}
            </span>
          )}
        </div>

        <section className="mt-8 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Professional Summary
            </h3>
            <p className="mt-2 text-sm text-slate-700">{summary.summary}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Experience
            </h3>
            <div className="mt-3 space-y-4">
              {experience.map((role) => (
                <div key={role.id}>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>
                      {role.role} · {role.company}
                    </span>
                    <span className="text-xs font-normal text-slate-500">
                      {formatDateRange(role.start_date, role.end_date)}
                    </span>
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {role.achievements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Education
              </h3>
              <div className="mt-3 space-y-4">
                {education.map((entry) => (
                  <div key={entry.id}>
                    <p className="text-sm font-semibold text-slate-900">{entry.school}</p>
                    <p className="text-sm text-slate-600">{entry.degree}</p>
                    <p className="text-xs text-slate-500">
                      {formatDateRange(entry.start_date, entry.end_date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Skills
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

