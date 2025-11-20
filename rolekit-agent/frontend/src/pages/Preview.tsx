import { useParams } from 'react-router-dom'
import { useResume } from '@/hooks/useResume'
import { Preview as ResumePreview } from '@/components/Resume/Preview'

export const PreviewPage = () => {
  const { id } = useParams<{ id: string }>()
  const { resume, isLoading } = useResume(id)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Generating preview...
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 shadow-inner">
      <ResumePreview resume={resume} template={resume?.template_id} />
    </div>
  )
}

