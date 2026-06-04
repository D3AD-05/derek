// src/core/types/api.types.ts
export interface ApiResponse<T> {
  status: string
  code: number
  message: string
  data: T
}
