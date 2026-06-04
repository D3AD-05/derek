import type { ApiResponse } from '@/core/types/api.types'
import type {
  QBListResponse,
  CreateQB,
  QBCreateResponse,
  UpdateQB,
  QBListParams,
  QuestionListParams,
  QuestionListResponse,
  CreateQuestion,
  Question,
} from './types'

//*------------------------------------------------------------------------*/
//-                       QUESTION BANK APIS
//*------------------------------------------------------------------------*/

export async function QBListApi(params?: QBListParams): Promise<ApiResponse<QBListResponse>> {
  const communityId = getStoredCommunityId()
  return getWithConfig<QBListResponse>('question-bank/', params, {
    headers: attachCommunityIdHeader({}, communityId),
  })
}

export async function DeleteQBApi(id: number): Promise<ApiResponse<void>> {
  return del<void>(`question-bank/${id}`)
}

export async function CreateQBApi(data: CreateQB): Promise<ApiResponse<QBCreateResponse>> {
  return post<QBCreateResponse>('question-bank', data)
}

export async function EditQBApi(
  id: number,
  data: UpdateQB,
): Promise<ApiResponse<QBCreateResponse | null>> {
  return patch<QBCreateResponse | null>(`question-bank/${id}`, data)
}

export async function QBQuestionsApi(
  bankId: number,
  params: Record<string, any> | null = null,
): Promise<ApiResponse<QBListResponse>> {
  return get<QBListResponse>('question', {
    ...params,
    question_bank_id: bankId,
  })
}

//*------------------------------------------------------------------------*/
//-                       QUESTION APIS
//*------------------------------------------------------------------------*/

function flattenQuestionParams(params?: QuestionListParams): Record<string, any> {
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

  // Flatten search
  if (params.search) {
    const search =
      typeof params.search === 'string' ? params.search.trim() : String(params.search).trim()

    if (search) {
      flatParams.search = search
    }
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

export async function ListQuestionsApi(
  params?: QuestionListParams,
): Promise<ApiResponse<QuestionListResponse>> {
  const flatParams = flattenQuestionParams(params)
  return get<QuestionListResponse>('question/', flatParams)
}

export async function CreateNewQuestionAPI(
  data: CreateQuestion,
  options?: { return_data?: boolean },
): Promise<ApiResponse<Question>> {
  const config = options?.return_data ? { params: { return_data: true } } : undefined
  return post<Question>('question', data, config)
}

export async function UpdateQuestionAPI(
  id: number,
  data: CreateQuestion,
): Promise<ApiResponse<Question>> {
  return patch<Question>(`question/${id}`, data)
}

export async function RetrievQuestionAPI(id: number): Promise<ApiResponse<Question>> {
  return get<Question>(`question/${id}`)
}

export async function DeleteQuestionAPI(id: number): Promise<ApiResponse<void>> {
  return del<void>(`question/${id}`)
}
