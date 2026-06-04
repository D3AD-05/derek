import type { ApiResponse } from '@/core/types/api.types'
import type { User, UserCreateInput, UserList, UserListParams } from "../types";


function flattenSessionParams(params?: UserListParams): Record<string, any> {
  if (!params) return {}

  const flatParams: Record<string, any> = {}

  // Flatten filter params
  if (params.filter) {
    Object.assign(flatParams, params.filter)
  }

  // Flatten pagination params
  if (params.pagination) {
    Object.assign(flatParams, params.pagination)
  }

  // Flatten order params
  if (params.order) {
    Object.assign(flatParams, params.order)
  }

  // Flatten search
  if (params.search) {
    const search =
      typeof params.search === 'string' ? params.search.trim() : String(params.search).trim()
    if (search) {
      flatParams.search = search
    }
  }

  // Flatten expand array to comma-separated
  if (params.expand && params.expand.length > 0) {
    flatParams.expand = params.expand.join(',')
  }

  return flatParams
}

//* CREATE
export async function CreateUserApi(
  data: UserCreateInput,
  options?: { return_data?: boolean },
): Promise<ApiResponse<User | null>> {
  const config = options?.return_data ? { params: { return_data: true } } : undefined
  return post<User>('user', data, config)
}

// ^ UPDATE
export async function UpdateUserAPI(
  id: number | string,
  data: UserCreateInput,
  options?: { return_data?: boolean },
): Promise<ApiResponse<User | null>> {
  const config = options?.return_data ? { params: { return_data: true } } : undefined
  return patch<User | null>(`user/${id}`, data, config)
}

// > LIST
export async function ListUserApi(
  params?: UserListParams,
): Promise<ApiResponse<UserList>> {
  const flatParams = flattenSessionParams(params)
  const communityId = getStoredCommunityId()
  return getWithConfig<UserList>('user', flatParams, {
    headers: attachCommunityIdHeader(undefined, communityId),
  })
}

// ? RETRIEVE
export async function RetrieveUserApi(
  user_id: number,
  params?: { expand?: any[] } | Record<string, any> | null,
): Promise<ApiResponse<User>> {
  const queryParams: Record<string, any> = {}
  
  if (params?.expand && params.expand.length > 0) {
    queryParams.expand = params.expand.join(',')
  }
  
  return get<User>(`user/${user_id}`, queryParams)
}

//! DELETE
export async function DeleteUserApi(id: number): Promise<ApiResponse<void>> {
  return del<void>(`user/${id}`)
}

