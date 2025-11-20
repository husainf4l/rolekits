import { useQuery } from '@tanstack/react-query'
import { resumeService } from '@/services/resumeService'
import { Card } from '@/components/UI/Card'
import { Button } from '@/components/UI/Button'
import { Link } from 'react-router-dom'
import { formatDateRange } from '@/utils/formatters'
import type { Resume } from '@/types/resume'

export const DashboardPage = () => {
  const { data, isLoading } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await resumeService.getAll()
      return response.data
    },
  })

  const items: Array<Resume | null> = isLoading
    ? Array.from({ length: 2 }, () => null)
    : (data ?? [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Your Resumes</p>
          <p className="text-xs text-slate-500">Manage drafts, exports, and history.</p>
        </div>
        <Button>Create Resume</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((resume, idx) => (
          <Card
            key={resume?.id ?? `skeleton-${idx}`}
            title={resume?.title ?? 'Loading resume...'}
            description={
              resume ? `Updated ${new Date(resume.updated_at).toLocaleString()}` : ''
            }
            footer={
              resume ? (
                <div className="flex items-center gap-3">
                  <Link to={`/editor/${resume.id}`} className="text-sm text-primary">
                    Edit
                  </Link>
                  <span className="text-xs text-slate-400">
                    {formatDateRange(resume.created_at, resume.updated_at)}
                  </span>
                </div>
              ) : undefined
            }
          >
            {resume ? (
              <p className="text-sm text-slate-600">
                {resume.content.summary.summary.slice(0, 120)}…
              </p>
            ) : (
              <div className="h-24 animate-pulse rounded-lg bg-slate-100" aria-hidden />
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

