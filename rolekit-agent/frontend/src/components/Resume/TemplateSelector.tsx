import { Button } from '@/components/UI/Button'
import { useTemplates } from '@/hooks/useTemplates'
import type { Template } from '@/types/template'

interface TemplateSelectorProps {
  selected: string | null | undefined
  onChange: (templateId: string) => void
}

const Skeleton = () => (
  <div className="animate-pulse rounded-xl border border-slate-200 p-4">
    <div className="h-32 rounded-lg bg-slate-100" />
    <div className="mt-4 h-4 rounded bg-slate-100" />
  </div>
)

export const TemplateSelector = ({
  selected,
  onChange,
}: TemplateSelectorProps) => {
  const { templates, isLoading } = useTemplates()

  const renderTemplateCard = (template: Template) => {
    const isSelected = template.id === selected

    return (
      <div
        key={template.id}
        className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="h-32 rounded-xl bg-slate-50" />
        <div className="mt-4 flex flex-1 flex-col">
          <h4 className="text-sm font-semibold text-slate-900">{template.name}</h4>
          <p className="text-xs text-slate-500">{template.category}</p>
          <Button
            variant={isSelected ? 'primary' : 'secondary'}
            size="sm"
            className="mt-auto"
            onClick={() => onChange(template.id)}
          >
            {isSelected ? 'Selected' : 'Use Template'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Templates</p>
          <p className="text-xs text-slate-500">
            Choose from ATS-optimized starter designs
          </p>
        </div>
        <Button variant="ghost" size="sm">
          Manage
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)
          : templates.map(renderTemplateCard)}
      </div>
    </section>
  )
}

