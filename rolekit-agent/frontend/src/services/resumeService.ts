import { apiClient } from './api'
import type { Resume, ResumeUpdatePayload } from '@/types/resume'

export const resumeService = {
  getAll: () => apiClient.get<Resume[]>('/resumes'),
  getById: (id: string) => apiClient.get<Resume>(`/resumes/${id}`),
  create: (payload: Partial<Resume>) => apiClient.post<Resume>('/resumes', payload),
  update: (id: string, payload: ResumeUpdatePayload) =>
    apiClient.patch<Resume>(`/resumes/${id}`, payload),
  delete: (id: string) => apiClient.delete(`/resumes/${id}`),
  export: (id: string, format: 'pdf' | 'docx' | 'html') =>
    apiClient.post(`/resumes/${id}/export`, { format }, { responseType: 'blob' }),
}

