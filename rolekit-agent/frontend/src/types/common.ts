export interface ApiResponse<T> {
  data: T
  message?: string
}

export type Nullable<T> = T | null

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type ID = string

