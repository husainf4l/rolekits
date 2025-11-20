import { useQuery } from '@tanstack/react-query'
import { templateService } from '@/services/templateService'
import type { Template } from '@/types/template'

export const useTemplates = () => {
  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await templateService.getAll()
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })

  return {
    templates: templatesQuery.data ?? ([] as Template[]),
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error,
  }
}

