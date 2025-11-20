import type { SummarySection } from '@/types/resume'

interface SummaryFormProps {
  summary?: SummarySection
  onChange: (field: keyof SummarySection, value: string) => void
}

export const SummaryForm = ({ summary, onChange }: SummaryFormProps) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    <h3 className="text-base font-semibold text-slate-900">Summary</h3>
    <p className="text-sm text-slate-500">
      Communicate your unique value in 2-3 impact statements.
    </p>

    <div className="mt-4 space-y-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Headline
        <input
          className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={summary?.headline ?? ''}
          onChange={(event) => onChange('headline', event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Summary
        <textarea
          className="min-h-[120px] rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={summary?.summary ?? ''}
          onChange={(event) => onChange('summary', event.target.value)}
        />
      </label>
    </div>
  </div>
)

