import type { ApiResponse } from '@/core/types/api.types'
import type { PaginatedUsers, User } from './types'

export const getUsers = async (): Promise<ApiResponse<PaginatedUsers>> => {
  const response = await get<PaginatedUsers>('/user')
  return response
}
export const getMe = async (): Promise<ApiResponse<User>> => {
  const response = await get<User>('/user/me?expand=communities')
  return response
}
