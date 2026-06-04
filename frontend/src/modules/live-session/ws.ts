import { createJsonWebSocket } from '@/core/api/ws'

export interface WsParticipant {
  id: number
  user_id: number
  name: string | null
  email: string | null
  // Optional fields commonly included in leaderboard payloads
  score?: number | null
  answeredCount?: number | null
  answered?: number | null
  ready?: boolean | null
}

export type ParticipantJoinedMessage = {
  type: 'participant_joined'
  session_id: number
  participant: WsParticipant
}

//  full list payloads
export type ParticipantsListMessage = {
  type: 'participants_list'
  session_id: number
  participants: WsParticipant[]
}

// Not in requirement
export type ParticipantLeftMessage = {
  type: 'participant_left'
  session_id: number
  participant_id: number
}

export type LiveSessionWsMessage =
  | ParticipantJoinedMessage
  | ParticipantsListMessage
  | ParticipantLeftMessage
  | QuestionStartedMessage
  | SubmitAnswerMessage
  | Record<string, any>

export type SubmitAnswerMessage = {
  type: 'submit_answer'
  question_id: number
  // Single-choice answer
  option_id?: number
  // Multi-choice answer (checkbox)
  option_ids?: number[]
  answer_status_id: number
  time_taken_ms: number
  answer_text?: string
}

export type QuestionStartedMessage = {
  type: 'question_started'
  session_id: number
  question: {
    id: number
    text: string
    type: string
    options?: Array<{
      id: number | string
      label?: string | null
      option_text?: string | null
      score?: number | null
    }>
    timeout_ms?: number | null
  }
}

export function connectLiveSessionWs(
  sessionId: number,
  handlers: {
    onOpen?: () => void
    onClose?: (ev: CloseEvent) => void
    onError?: (ev: Event) => void
    onMessage?: (msg: LiveSessionWsMessage) => void
  } = {},
  token?: string | null,
) {
  const qs = token ? `?token=${encodeURIComponent(token)}` : ''
  console.log(' ~ connectLiveSessionWs ~ Token ✅')
  return createJsonWebSocket<LiveSessionWsMessage>(`/${sessionId}${qs}`, {
    onOpen: handlers.onOpen,
    onClose: handlers.onClose,
    onError: handlers.onError,
    onMessage: (msg) => handlers.onMessage?.(msg),
  })
}
