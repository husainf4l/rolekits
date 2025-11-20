import { useCallback } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { resumeService } from '@/services/resumeService'
import { useResumeStore } from '@/store/resumeStore'
import type { Resume, ResumeContent, ResumeUpdatePayload } from '@/types/resume'

export const useResume = (resumeId?: string) => {
  const queryClient = useQueryClient()
  const {
    currentResume,
    setCurrentResume,
    updateCurrentResume,
  } = useResumeStore()

  const resumeQuery = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      if (!resumeId) return null
      const response = await resumeService.getById(resumeId)
      setCurrentResume(response.data)
      return response.data
    },
    enabled: Boolean(resumeId),
    staleTime: 1000 * 60,
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: ResumeUpdatePayload) => {
      if (!resumeId) throw new Error('Resume ID missing')
      const response = await resumeService.update(resumeId, payload)
      return response.data
    },
    onSuccess: (data) => {
      setCurrentResume(data)
      queryClient.setQueryData(['resume', resumeId], data)
    },
  })

  const localUpdate = useCallback(
    (section: string, field: string, value: unknown) => {
      const snapshot = resumeQuery.data ?? currentResume
      if (!snapshot) return

      if (section === 'meta') {
        const nextResume: Resume = { ...snapshot, [field]: value }
        setCurrentResume(nextResume)
        updateMutation.mutate({ [field]: value } as ResumeUpdatePayload)
        return
      }

      const typedSection = section as keyof ResumeContent
      const currentSection = snapshot.content[typedSection] as unknown
      const nextSection =
        field && typeof currentSection === 'object' && !Array.isArray(currentSection)
          ? { ...(currentSection as Record<string, unknown>), [field]: value }
          : value

      const updatedContent = {
        ...snapshot.content,
        [typedSection]: nextSection,
      }

      updateCurrentResume({ [typedSection]: nextSection } as Partial<ResumeContent>)
      updateMutation.mutate({ content: updatedContent })
    },
    [
      resumeQuery.data,
      currentResume,
      updateCurrentResume,
      updateMutation,
      setCurrentResume,
    ],
  )

  return {
    resume: resumeQuery.data ?? currentResume,
    isLoading: resumeQuery.isLoading || updateMutation.isPending,
    error: resumeQuery.error ?? updateMutation.error,
    updateResume: updateMutation.mutateAsync,
    handleFieldChange: localUpdate,
  }
}

