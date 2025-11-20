import { Button } from '@/components/UI/Button'
import type { ExperienceItem } from '@/types/resume'
import { generateId } from '@/utils/helpers'

interface ExperienceFormProps {
  experience: ExperienceItem[]
  onChange: (items: ExperienceItem[]) => void
}

export const ExperienceForm = ({
  experience,
  onChange,
}: ExperienceFormProps) => {
  const handleFieldUpdate = <K extends keyof ExperienceItem>(
    id: string,
    field: K,
    value: ExperienceItem[K],
  ) => {
    const next = experience.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    )
    onChange(next)
  }

  const handleAdd = () => {
    const next: ExperienceItem = {
      id: generateId(),
      company: 'Company Name',
      role: 'Role Title',
      start_date: new Date().toISOString(),
      achievements: ['Describe an outcome you led or improved.'],
      end_date: undefined,
      location: '',
      technologies: [],
    }
    onChange([...experience, next])
  }

  const handleDelete = (id: string) => {
    onChange(experience.filter((item) => item.id !== id))
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Experience</h3>
          <p className="text-sm text-slate-500">Highlight quantifiable impact.</p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          + Add
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {experience.map((item) => (
          <div
            key={item.id}
            className="space-y-3 rounded-xl border border-slate-200 p-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={item.role}
                onChange={(event) =>
                  handleFieldUpdate(item.id, 'role', event.target.value)
                }
                placeholder="Role"
              />
              <input
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={item.company}
                onChange={(event) =>
                  handleFieldUpdate(item.id, 'company', event.target.value)
                }
                placeholder="Company"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="date"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={item.start_date.slice(0, 10)}
                onChange={(event) =>
                  handleFieldUpdate(item.id, 'start_date', event.target.value)
                }
              />
              <input
                type="date"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={item.end_date?.slice(0, 10) ?? ''}
                onChange={(event) =>
                  handleFieldUpdate(item.id, 'end_date', event.target.value)
                }
              />
            </div>
            <textarea
              className="min-h-[90px] rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={item.achievements.join('\n')}
              onChange={(event) =>
                handleFieldUpdate(
                  item.id,
                  'achievements',
                  event.target.value.split('\n') as ExperienceItem['achievements'],
                )
              }
            />
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

