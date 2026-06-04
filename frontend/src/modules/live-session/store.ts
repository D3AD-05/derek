import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import type { ApiResponse } from '@/core/types/api.types'
import {
  GetSessionDetailsApi,
  JoinLiveSessionApi,
  type JoinSessionPayload,
  type SessionDetails,
} from './service'
import type { User } from '../users/types'
import type { ExpandableInt } from '@/core/types/generic.types'

export interface SessionParticipant {
  id: number
  session: number
  user: ExpandableInt<User>
}

export interface ParticipantIdentity {
  session_participant_id: number | null
  session_id: number | null
  user_id: number | null
  name: string
  email: string
  participant_token?: string | null
}

const PARTICIPANT_STORAGE_KEY = 'live_session_participant'

function readParticipantFromStorage(): ParticipantIdentity | null {
  try {
    const raw = window.sessionStorage.getItem(PARTICIPANT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    const name = String((parsed as any).name ?? '').trim()
    const email = String((parsed as any).email ?? '').trim()

    const user_id_raw = (parsed as any).user_id
    const session_participant_id_raw = (parsed as any).session_participant_id
    const session_id_raw = (parsed as any).session_id
    const participant_token_raw = (parsed as any).participant_token

    const castNumber = (v: unknown): number | null => {
      if (typeof v === 'number') return v
      if (typeof v === 'string' && v.trim() !== '') {
        const n = Number(v)
        return Number.isNaN(n) ? null : n
      }
      return null
    }

    const user_id = castNumber(user_id_raw)
    const session_participant_id = castNumber(session_participant_id_raw)
    const session_id = castNumber(session_id_raw)
    const participant_token =
      typeof participant_token_raw === 'string' && participant_token_raw.trim()
        ? participant_token_raw
        : null

    if (!name || !email) return null

    return { name, email, user_id, session_participant_id, session_id, participant_token }
  } catch {
    return null
  }
}

function writeParticipantToStorage(p: ParticipantIdentity | null) {
  try {
    if (!p) {
      window.sessionStorage.removeItem(PARTICIPANT_STORAGE_KEY)
      return
    }
    // only persist primitive fields
    const toStore: Record<string, any> = {
      name: p.name,
      email: p.email,
      user_id: p.user_id,
      session_participant_id: p.session_participant_id,
      session_id: p.session_id,
      participant_token: p.participant_token,
    }
    window.sessionStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(toStore))
  } catch {
    // ignore
  }
}

export const useLiveSessionStore = defineStore('live-session', () => {
  const session = ref<SessionDetails | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const participant = ref<ParticipantIdentity | null>(readParticipantFromStorage())
  const joinedUserId = ref<number | null>(null)
  const joinedUser = ref<any | null>(null)

  const sessionName = computed(() => String((session.value as any)?.name ?? '—'))

  async function fetchSessionDetails(sessionId: number) {
    loading.value = true
    error.value = null
    try {
      const res: ApiResponse<SessionDetails> = await GetSessionDetailsApi(sessionId)
      if (res.status === 'success' && res.data) {
        session.value = res.data
      } else {
        error.value = res.message || 'Failed to load session details'
      }
      return res
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load session details'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function joinSession(sessionId: number, payload: JoinSessionPayload) {
    loading.value = true
    error.value = null

    try {
      const res: ApiResponse<Record<string, any>> = await JoinLiveSessionApi(sessionId, payload, {
        returnData: true,
        expand: ['user'],
      })

      if (res.status === 'success' && res.data) {
        const data = res.data.participant as SessionParticipant
        const participantToken =
          typeof res.data.participant_token === 'string' ? res.data.participant_token : null
        const sessionParticipantId = Number(res.data.session_participant_id ?? data.id)

        const userId = typeof data.user === 'number' ? data.user : Number((data.user as User).id)

        joinedUserId.value = userId
        joinedUser.value = typeof data.user === 'object' ? data.user : null

        participant.value = {
          session_participant_id: Number.isFinite(sessionParticipantId)
            ? sessionParticipantId
            : null,
          session_id: data.session ?? null,
          user_id: userId,
          name: typeof data.user === 'object' ? (data.user as User).name : payload.name,
          email: typeof data.user === 'object' ? (data.user as User).email : payload.email,
          participant_token: participantToken,
        }

        writeParticipantToStorage(participant.value)

        // centralised navigation after successful join
        await router.push({ name: 'ParticipantSession', params: { id: sessionId } })
      } else {
        error.value = res.message || 'Failed to join live session'
      }

      return res
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to join live session'
      throw e
    } finally {
      loading.value = false
    }
  }

  function clearParticipant() {
    participant.value = null
    writeParticipantToStorage(null)
  }

  return {
    session,
    sessionName,
    participant,
    joinedUserId,
    joinedUser,
    loading,
    error,
    fetchSessionDetails,
    joinSession,
    clearParticipant,
    // convenience
    participantName: computed(() => (participant.value ? participant.value.name : '')),
  }
})
