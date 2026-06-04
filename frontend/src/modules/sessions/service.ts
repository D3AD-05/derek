import type { ApiResponse } from '@/core/types/api.types'
import type {
  CreateSession,
  SessionListParams,
  SessionListResponse,
  SessionOut,
  UpdateSession,
  SessionQuestionListParams,
  SessionQuestionListResponse,
  SessionStatusCount,
} from './types'

function flattenSessionParams(params?: SessionListParams): Record<string, any> {
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

export async function SessionListApi(
  params?: SessionListParams,
): Promise<ApiResponse<SessionListResponse>> {
  const flatParams = flattenSessionParams(params)
  const communityId = getStoredCommunityId()
  return getWithConfig<SessionListResponse>('session/', flatParams, {
    headers: attachCommunityIdHeader(undefined, communityId),
  })
}

export async function CreateNewSessionAPI(
  data: CreateSession,
  options?: { return_data?: boolean },
): Promise<ApiResponse<SessionOut | null>> {
  const config = options?.return_data ? { params: { return_data: true } } : undefined
  data.session_status_id = 1
  return post<SessionOut>('session', data, config)
}

function flattenSessionQuestionParams(params?: SessionQuestionListParams): Record<string, any> {
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

  // Flatten expand array to comma-separated
  if (params.expand && params.expand.length > 0) {
    flatParams.expand = params.expand.join(',')
  }

  return flatParams
}

export async function SessionQuestionListApi(
  params?: SessionQuestionListParams,
): Promise<ApiResponse<SessionQuestionListResponse>> {
  const flatParams = flattenSessionQuestionParams(params)
  return get<SessionQuestionListResponse>('session_question/', flatParams)
}

export async function UpdateSessionAPI(
  id: number | string,
  data: UpdateSession,
  options?: { return_data?: boolean },
): Promise<ApiResponse<SessionOut | null>> {
  const config = options?.return_data ? { params: { return_data: true } } : undefined
  return patch<SessionOut | null>(`session/${id}`, data, config)
}

// SESSION STATUS

export async function SessionStatusCountsApi(): Promise<ApiResponse<SessionStatusCount>> {
  const communityId = getStoredCommunityId()
  return getWithConfig<SessionStatusCount>(
    'session/status-counts',
    {},
    {
      headers: attachCommunityIdHeader(undefined, communityId),
    },
  )
}
