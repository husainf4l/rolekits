import { useTemplates } from '@/hooks/useTemplates'
import { Card } from '@/components/UI/Card'
import { Button } from '@/components/UI/Button'
import type { Template } from '@/types/template'

export const TemplatesPage = () => {
  const { templates, isLoading } = useTemplates()
  const items: Array<Template | null> = isLoading
    ? Array.from({ length: 3 }, () => null)
    : templates

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Template Library</p>
          <p className="text-xs text-slate-500">
            Explore curated ATS-friendly layouts ready to customize.
          </p>
        </div>
        <Button variant="secondary">New Template</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((template, idx) => (
          <Card
            key={template?.id ?? `template-skeleton-${idx}`}
            title={template?.name ?? 'Loading template...'}
            description={template?.category ?? 'Preparing details'}
            footer={
              template ? (
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{template.is_ats_optimized ? 'ATS Optimized' : 'Custom'}</span>
                  <Button size="sm" variant="secondary">
                    Use Template
                  </Button>
                </div>
              ) : undefined
            }
          >
            {template ? (
              <div className="h-32 rounded-xl bg-slate-50" />
            ) : (
              <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

