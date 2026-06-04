import type { ApiResponse } from '@/core/types/api.types'
import type { Community, CommunityCreateInput, CommunityList, CommunityListParams } from '../types'

function flattenCommunityParams(params?: CommunityListParams): Record<string, any> {
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

  return flatParams
}

//* CREATE
export async function CreateCommunityApi(
  data: CommunityCreateInput,
  options?: { return_data?: boolean },
): Promise<ApiResponse<Community | null>> {
  const config = options?.return_data ? { params: { return_data: true } } : undefined
  return post<Community>('/community', data, config)
}

// ^ UPDATE
export async function UpdateCommunityApi(
  id: number | string,
  data: CommunityCreateInput,
  options?: { return_data?: boolean },
): Promise<ApiResponse<Community | null>> {
  const config = options?.return_data ? { params: { return_data: true } } : undefined
  return patch<Community | null>(`/community/${id}`, data, config)
}

// > LIST
export async function ListCommunityApi(
  params?: CommunityListParams,
): Promise<ApiResponse<CommunityList>> {
  const flatParams = flattenCommunityParams(params)
  return getWithConfig<CommunityList>('/community', flatParams)
}

// ? RETRIEVE
export async function RetrieveCommunityApi(
  community_id: number ,
   params?: { expand?: any[] } | Record<string, any> | null,
): Promise<ApiResponse<Community>> {
  const queryParams: Record<string, any> = {}
  
  if (params?.expand && params.expand.length > 0) {
    queryParams.expand = params.expand.join(',')
  }
  return get<Community>(`/community/${community_id}`,queryParams)
}

//! DELETE
export async function DeleteCommunityApi(id: number | string): Promise<ApiResponse<void>> {
  return del<void>(`/community/${id}`)
}
