import { create } from 'zustand'
import type { Resume, ResumeContent } from '@/types/resume'

interface ResumeStore {
  resumes: Resume[]
  currentResume: Resume | null
  isLoading: boolean
  error: string | null
  setResumes: (resumes: Resume[]) => void
  setCurrentResume: (resume: Resume | null) => void
  updateCurrentResume: (updates: Partial<ResumeContent>) => void
  addResume: (resume: Resume) => void
  deleteResume: (id: string) => void
}

export const useResumeStore = create<ResumeStore>((set, _get) => ({
  resumes: [],
  currentResume: null,
  isLoading: false,
  error: null,
  setResumes: (resumes) => set({ resumes }),
  setCurrentResume: (resume) => set({ currentResume: resume }),
  updateCurrentResume: (updates) =>
    set(({ currentResume }) => {
      if (!currentResume) return { currentResume: null }
      return {
        currentResume: {
          ...currentResume,
          content: {
            ...currentResume.content,
            ...updates,
          },
        },
      }
    }),
  addResume: (resume) =>
    set(({ resumes }) => ({
      resumes: [...resumes, resume],
    })),
  deleteResume: (id) =>
    set(({ resumes, currentResume }) => ({
      resumes: resumes.filter((resume) => resume.id !== id),
      currentResume: currentResume?.id === id ? null : currentResume,
    })),
}))

