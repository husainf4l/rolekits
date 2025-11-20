import { apiClient } from './api'
import type { Template } from '@/types/template'

export const templateService = {
  getAll: () => apiClient.get<Template[]>('/templates'),
  getById: (id: string) => apiClient.get<Template>(`/templates/${id}`),
}

