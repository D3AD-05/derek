import type { ApiResponse } from '@/core/types/api.types'
import { get, post } from '@/core/api/helper'

export type JoinSessionPayload = {
  name: string
  email: string
}

export type SessionDetails = {
  id: number
  name?: string | null
  venue?: string | null
  questions?: any[]
  [key: string]: any
}

export async function GetSessionDetailsApi(
  sessionId: number,
): Promise<ApiResponse<SessionDetails>> {
  return get<SessionDetails>(`session/${sessionId}`)
}
export async function StartSessionApi(
  sessionId: number,
): Promise<ApiResponse<SessionDetails | null>> {
  return patch<SessionDetails | null>(`session/${sessionId}/start`)
}
export async function EndSessionApi(
  sessionId: number,
): Promise<ApiResponse<SessionDetails | null>> {
  return patch<SessionDetails | null>(`session/${sessionId}/end`)
}

export async function JoinLiveSessionApi(
  sessionId: number,
  payload: JoinSessionPayload,
  opts?: { returnData?: boolean; expand?: string[] },
): Promise<ApiResponse<Record<string, any>>> {
  const qs = new URLSearchParams()
  if (opts?.returnData) qs.set('return_data', 'true')
  if (opts?.expand && opts.expand.length) qs.set('expand', opts.expand.join(','))
  const q = qs.toString() ? `?${qs.toString()}` : ''
  return post<Record<string, any>>(`session_participant/join/${sessionId}${q}`, payload)
}

export async function TriggerQuestionApi(
  sessionId: number,
  questionId: number,
): Promise<ApiResponse<Record<string, any> | null>> {
  // Backend endpoint may vary. This posts to a reasonable REST path; adjust if your API differs.
  return post<Record<string, any> | null>(`session/${sessionId}/start-question/${questionId}`, {})
}

export type SessionLeaderboardItem = {
  rank: number
  user_id: number
  name: string
  score: number
}

export type SessionLeaderboardData = {
  session_id: number
  items: SessionLeaderboardItem[]
}

export async function GetSessionLeaderboardApi(
  sessionId: number,
  token?: string | null,
): Promise<ApiResponse<SessionLeaderboardData>> {
  const qs = token ? `?token=${encodeURIComponent(token)}` : ''
  return get<SessionLeaderboardData>(`session/${sessionId}/leaderboard${qs}`)
}

export type SessionProgressData = {
  total_questions_attended: number
  last_question?: {
    id: number
    text: string
    type: string
    options?: Array<{
      id: number | string
      text?: string | null
      label?: string | null
    }>
  } | null
  last_answer_status?: 'answered' | 'skipped' | 'timeout' | string | null
  last_answer?: {
    option_id?: number | null
    option_ids?: number[] | null
    answer_text?: string | null
  } | null
}

export async function GetSessionProgressApi(
  sessionId: number,
  token?: string | null,
): Promise<ApiResponse<SessionProgressData>> {
  const qs = token ? `?token=${encodeURIComponent(token)}` : ''
  return get<SessionProgressData>(`session_participant/session_progress/${sessionId}${qs}`)
}
