import { useParams, Navigate } from 'react-router-dom'
import { ResumeEditor } from '@/components/Resume/ResumeEditor'

export const EditorPage = () => {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <Navigate to="/" replace />
  }

  return <ResumeEditor resumeId={id} />
}

