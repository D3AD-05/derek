import { defineComponent, onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/core/components/header/PageHeader'
import Card from '@/core/components/card/Card'
import Button from '@/core/components/button/Button'
import { Clock } from 'lucide-vue-next'
import { useToast } from '@/core/composables/useToast'
import { type AnswerStatusCode } from '@/core/constants/appConstants'
import { useLiveSessionStore } from '../store'
import { connectLiveSessionWs, type LiveSessionWsMessage, type SubmitAnswerMessage } from '../ws'
import {
  GetSessionLeaderboardApi,
  GetSessionProgressApi,
  type SessionProgressData,
} from '../service'
import { useSessionStore } from '@/modules/sessions/store'

type LeaderboardItem = {
  user_id: number
  name: string
  score: number
  rank?: number
}

function formatScore(score: number) {
  const n = Number(score) || 0
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
}

type QuestionType =
  | {
      id: number
      text: string
      type: 'radio'
      options: Array<{ id: string; label: string; score: number }>
    }
  | {
      id: number
      text: string
      type: 'checkbox'
      options: Array<{ id: string; label: string; score: number }>
    }
  | {
      id: number
      text: string
      type: 'text'
      options?: never
    }

type ParticipantQuestionSnapshot = {
  version: 1
  session_id: number
  participant_token: string
  question: QuestionType
  question_timeout_ms: number | null
  question_started_at_ms: number | null
  total_questions_attended: number | null
  last_answer_status: AnswerStatusCode | null
  time_taken_ms: number | null
  saved_at_ms: number
}

const PARTICIPANT_QUESTION_SNAPSHOT_KEY_PREFIX = 'live_session_participant_question_'

const getParticipantQuestionSnapshotKey = (sessionId: number, participantToken: string) =>
  `${PARTICIPANT_QUESTION_SNAPSHOT_KEY_PREFIX}${sessionId}_${participantToken}`

const getQuestionIdFromProgress = (data: SessionProgressData | null): number | null => {
  const qid = Number((data as any)?.last_question?.id)
  return Number.isFinite(qid) && qid > 0 ? qid : null
}

export default defineComponent({
  name: 'ParticipantSession',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const toast = useToast()

    useDisableBack()
    useDisableInspect()
    const liveSessionStore = useLiveSessionStore()
    const sessionStore = useSessionStore()
    const { answerStatusIdMap } = storeToRefs(useConstantsStore())

    const statusCodeById = computed(() => {
      const map = new Map<number, string>()
      for (const status of sessionStore.sessionStatusList) {
        map.set(status.id, status.code)
      }
      return map
    })

    const sessionId = computed(() => Number(route.params.id))

    const questions = ref<QuestionType[]>([])

    const activeIndex = ref(0)
    const activeQuestion = computed(() => questions.value[activeIndex.value] ?? null)

    const radioAnswer = ref<Record<number, string>>({})
    const checkboxAnswer = ref<Record<number, string[]>>({})
    const textAnswer = ref<Record<number, string>>({})

    const participantName = computed(() => liveSessionStore.participant?.name ?? 'Guest')
    const participantEmail = computed(() => liveSessionStore.participant?.email ?? '')
    const participantUserId = computed(() => {
      const n = Number(liveSessionStore.participant?.user_id)
      return Number.isFinite(n) ? n : null
    })

    const leaderboardItems = ref<LeaderboardItem[]>([])
    const totalQuestionsAttended = ref<number | null>(null)

    const leaderboard = computed(() => {
      const list = [...leaderboardItems.value].filter((p) => Number.isFinite(Number(p.user_id)))

      // Prefer backend-provided rank if present
      if (list.length > 0 && list.every((p) => Number.isFinite(Number(p.rank)))) {
        return list.sort((a, b) => (Number(a.rank) || 0) - (Number(b.rank) || 0))
      }

      return list.sort((a, b) => {
        const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0)
        if (scoreDiff !== 0) return scoreDiff
        return String(a.name).localeCompare(String(b.name))
      })
    })

    // usePreventRefresh(() => true)

    // const progressLabel = computed(() => {
    //   const attended = Number(totalQuestionsAttended.value)
    //   if (Number.isFinite(attended) && attended >= 0) {
    //     return { current: attended, total: attended }
    //   }

    //   const total = questions.value.length
    //   const current = total === 0 ? 0 : activeIndex.value + 1
    //   return { current, total }
    // })

    const myLeaderboardRow = computed(() => {
      const myId = participantUserId.value
      if (!myId) return null
      const idx = leaderboard.value.findIndex((x) => Number(x.user_id) === myId)
      if (idx === -1) return null
      const row = leaderboard.value[idx]
      if (!row) return null
      const rank = Number.isFinite(Number(row.rank)) ? Number(row.rank) : idx + 1
      return { ...row, rank }
    })

    const parseLeaderboardItems = (rawItems: any[]): LeaderboardItem[] => {
      return rawItems
        .map((it: any) => {
          const userId = Number(it?.user_id)
          const rawName = String(it?.name ?? 'Unknown')
          const looksLikeEmail = rawName.includes('@')

          return {
            user_id: userId,
            rank: Number.isFinite(Number(it?.rank)) ? Number(it?.rank) : undefined,
            name: looksLikeEmail ? rawName.split('@')[0] || rawName : rawName,
            score: Number.isFinite(Number(it?.score)) ? Number(it?.score) : 0,
          } satisfies LeaderboardItem
        })
        .filter((p: LeaderboardItem) => Number.isFinite(Number(p.user_id)))
    }

    const questionTimeoutMsOverride = ref<number | null>(null)
    const questionTimeoutMs = computed(() => {
      if (Number.isFinite(Number(questionTimeoutMsOverride.value))) {
        return Number(questionTimeoutMsOverride.value)
      }
      return Number((liveSessionStore.session as any)?.question_timeout_ms ?? 0)
    })

    const timePercent = computed(() => {
      const total = Math.max(1, Number(questionTimeoutMs.value) || 1)
      const remaining = Math.max(0, Number(remainingMs.value ?? total) || 0)
      return Math.min(100, Math.max(0, (remaining / total) * 100))
    })

    const nowMs = ref<number>(Date.now())
    let tickHandle: number | undefined
    const hasRedirectedToLeaderboard = ref(false)

    const questionStartedAtById = ref<Record<number, number>>({})
    const finalStatusByQuestionId = ref<Record<number, AnswerStatusCode | null>>({})
    const timeTakenMsByQuestionId = ref<Record<number, number | null>>({})
    const snapshotDirty = ref(false)
    const lastSnapshotWriteMs = ref(0)

    let wsClient: ReturnType<typeof connectLiveSessionWs> | null = null

    const _getSessionStatusCode = (): string | null => {
      const raw = (liveSessionStore.session as any)?.session_status
      if (!raw) return null

      if (typeof raw === 'string') {
        const s = raw.toLowerCase().trim()
        return s || null
      }

      if (typeof raw === 'object') {
        const code = (raw as any).code
        if (typeof code === 'string') return code.toLowerCase().trim() || null
        const display = (raw as any).display_name ?? (raw as any).name
        if (typeof display === 'string') return display.toLowerCase().trim() || null
        return null
      }

      if (typeof raw === 'number') {
        return statusCodeById.value.get(raw) || null
      }

      return null
    }

    const writeParticipantQuestionSnapshot = (force = false) => {
      try {
        const sid = Number(sessionId.value)
        const token = String(liveSessionStore.participant?.participant_token ?? '').trim()
        if (!Number.isFinite(sid) || sid <= 0 || !token) return

        const now = Date.now()
        if (!force && now - lastSnapshotWriteMs.value < 2000) return

        const question = activeQuestion.value
        if (!question) return

        const questionId = Number(question.id)
        const startedAt = Number(questionStartedAtById.value[questionId] ?? 0)
        const timeoutMs = Number(questionTimeoutMs.value)
        const finalStatus = finalStatusByQuestionId.value[questionId] ?? null
        const timeTakenMs = timeTakenMsByQuestionId.value[questionId] ?? null

        const snapshot: ParticipantQuestionSnapshot = {
          version: 1,
          session_id: sid,
          participant_token: token,
          question,
          question_timeout_ms:
            Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.floor(timeoutMs) : null,
          question_started_at_ms:
            Number.isFinite(startedAt) && startedAt > 0 ? Math.floor(startedAt) : null,
          total_questions_attended: Number.isFinite(Number(totalQuestionsAttended.value))
            ? Math.floor(Number(totalQuestionsAttended.value))
            : null,
          last_answer_status: finalStatus,
          time_taken_ms: Number.isFinite(Number(timeTakenMs))
            ? Math.max(0, Math.floor(Number(timeTakenMs)))
            : null,
          saved_at_ms: now,
        }

        const key = getParticipantQuestionSnapshotKey(sid, token)
        window.sessionStorage.setItem(key, JSON.stringify(snapshot))
        snapshotDirty.value = false
        lastSnapshotWriteMs.value = now
      } catch {
        // ignore storage errors
      }
    }

    const readParticipantQuestionSnapshot = (): ParticipantQuestionSnapshot | null => {
      try {
        const sid = Number(sessionId.value)
        const token = String(liveSessionStore.participant?.participant_token ?? '').trim()
        if (!Number.isFinite(sid) || sid <= 0 || !token) return null

        const key = getParticipantQuestionSnapshotKey(sid, token)
        const raw = window.sessionStorage.getItem(key)
        if (!raw) return null

        const parsed = JSON.parse(raw) as ParticipantQuestionSnapshot
        if (!parsed || typeof parsed !== 'object') return null
        if (Number(parsed.version) !== 1) return null
        if (Number(parsed.session_id) !== sid) return null
        if (String(parsed.participant_token ?? '') !== token) return null

        const qid = Number(parsed?.question?.id)
        if (!Number.isFinite(qid) || qid <= 0) return null

        return parsed
      } catch {
        return null
      }
    }

    const clearParticipantQuestionSnapshot = () => {
      try {
        const sid = Number(sessionId.value)
        const token = String(liveSessionStore.participant?.participant_token ?? '').trim()
        if (!Number.isFinite(sid) || sid <= 0 || !token) return

        const key = getParticipantQuestionSnapshotKey(sid, token)
        window.sessionStorage.removeItem(key)
      } catch {
        // ignore storage errors
      }
    }

    const hydrateFromSnapshot = (snapshot: ParticipantQuestionSnapshot) => {
      const qid = Number(snapshot.question.id)
      if (!Number.isFinite(qid) || qid <= 0) return

      if (Number.isFinite(Number(snapshot.total_questions_attended))) {
        totalQuestionsAttended.value = Number(snapshot.total_questions_attended)
      }

      if (
        Number.isFinite(Number(snapshot.question_timeout_ms)) &&
        Number(snapshot.question_timeout_ms) > 0
      ) {
        questionTimeoutMsOverride.value = Number(snapshot.question_timeout_ms)
      }

      const startedAt = Number(snapshot.question_started_at_ms)
      if (Number.isFinite(startedAt) && startedAt > 0) {
        questionStartedAtById.value[qid] = startedAt
      }

      if (snapshot.last_answer_status) {
        finalStatusByQuestionId.value[qid] = snapshot.last_answer_status
      }

      if (Number.isFinite(Number(snapshot.time_taken_ms))) {
        timeTakenMsByQuestionId.value[qid] = Math.max(0, Number(snapshot.time_taken_ms))
      }

      upsertQuestion(snapshot.question)
      snapshotDirty.value = true
    }

    // const applyExpiredTimerGrace = (minGraceMs = 2000) => {
    //   const q = activeQuestion.value
    //   if (!q) return

    //   const timeout = Number(questionTimeoutMs.value)
    //   if (!Number.isFinite(timeout) || timeout <= 0) return

    //   const startedAt = Number(questionStartedAtById.value[q.id] ?? 0)
    //   if (!Number.isFinite(startedAt) || startedAt <= 0) return

    //   const elapsed = Math.max(0, Date.now() - startedAt)
    //   if (elapsed < timeout) return

    //   const grace = Math.max(0, Math.min(Number(minGraceMs) || 0, timeout))
    //   questionStartedAtById.value[q.id] = Date.now() - Math.max(0, timeout - grace)
    //   snapshotDirty.value = true
    // }

    const redirectToLeaderboard = async () => {
      if (hasRedirectedToLeaderboard.value) return
      if (!sessionId.value) return
      hasRedirectedToLeaderboard.value = true
      clearParticipantQuestionSnapshot()
      await router.push({
        name: 'LeaderBoard',
        params: { id: sessionId.value },
        state: { userId: participantUserId.value },
      })
    }

    const loadLeaderboard = async () => {
      if (!sessionId.value) return
      const token = liveSessionStore.participant?.participant_token ?? null

      try {
        const res = await GetSessionLeaderboardApi(sessionId.value, token)
        const data = (res as any)?.data
        const items = Array.isArray(data?.items) ? data.items : []
        leaderboardItems.value = parseLeaderboardItems(items)
      } catch (e) {
        console.log('❌ Failed to load participant leaderboard:', e)
        leaderboardItems.value = []
      }
    }

    const applySessionProgress = (data: any) => {
      if (!data) return

      const attended = Number(data?.total_questions_attended)
      if (Number.isFinite(attended)) {
        totalQuestionsAttended.value = attended
      }

      const q = data?.last_question
      if (!q) return

      const opts = Array.isArray(q.options)
        ? q.options.map((opt: any, idx: number) => ({
            id: String(opt?.id ?? idx),
            label: String(opt?.label ?? opt?.text ?? opt?.option_text ?? `Option ${idx + 1}`),

            score: 0,
          }))
        : []

      const nextQuestion: QuestionType = {
        id: Number(q.id),
        text: String(q.text ?? ''),
        type: normalizeQuestionType(q.type),
        ...(opts.length ? { options: opts } : {}),
      } as QuestionType

      // Set timer if time_limit_ms is provided
      const timeLimitMs = Number(q.time_limit_ms ?? 0)
      if (Number.isFinite(timeLimitMs) && timeLimitMs > 0) {
        questionTimeoutMsOverride.value = timeLimitMs
      }

      upsertQuestion(nextQuestion)

      const statusRaw = String(data?.last_answer_status ?? '')
        .toLowerCase()
        .trim()
      const status = ['answered', 'skipped', 'timeout'].includes(statusRaw)
        ? (statusRaw as AnswerStatusCode)
        : null

      const lastAnswer = data?.last_answer ?? null

      if (nextQuestion.type === 'radio') {
        const optId = lastAnswer?.option_id
        if (optId != null) radioAnswer.value[nextQuestion.id] = String(optId)
      }

      if (nextQuestion.type === 'checkbox') {
        const ids = Array.isArray(lastAnswer?.option_ids) ? lastAnswer.option_ids : []
        checkboxAnswer.value[nextQuestion.id] = ids.map((id: any) => String(id))
      }

      if (nextQuestion.type === 'text') {
        const text = String(lastAnswer?.answer_text ?? '')
        textAnswer.value[nextQuestion.id] = text
      }

      if (status) {
        finalStatusByQuestionId.value[nextQuestion.id] = status
        timeTakenMsByQuestionId.value[nextQuestion.id] = null
      }

      snapshotDirty.value = true
    }

    const loadSessionProgress = async (): Promise<SessionProgressData | null> => {
      if (!sessionId.value) return null
      const token = liveSessionStore.participant?.participant_token ?? null
      if (!token) return null

      try {
        const res = await GetSessionProgressApi(sessionId.value, token)
        const data = ((res as any)?.data ?? null) as SessionProgressData | null
        console.log('🚀 ~ loadSessionProgress ~ data:', data)
        return data
      } catch (e) {
        console.log('❌ Failed to load participant progress:', e)
        return null
      }
    }

    const load = async () => {
      if (!sessionId.value) {
        toast.warning('No session id found')
        return
      }

      try {
        await liveSessionStore.fetchSessionDetails(sessionId.value)
      } catch {
        // still allow dummy play screen if backend fails
      }

      if (!liveSessionStore.participant) {
        toast.info('Enter your details to join first')
        await router.push({ name: 'JoinSession', params: { id: sessionId.value } })
      }
    }

    const ensureQuestionStart = (questionId: number) => {
      if (!questionId) return
      if (!Number.isFinite(Number(questionStartedAtById.value[questionId]))) {
        questionStartedAtById.value[questionId] = Date.now()
      }
    }

    const activeQuestionId = computed(() => activeQuestion.value?.id ?? null)
    const activeFinalStatus = computed(() => {
      const qid = activeQuestionId.value
      if (!qid) return null
      return finalStatusByQuestionId.value[qid] ?? null
    })

    const isAnswerLocked = computed(() => Boolean(activeFinalStatus.value))

    const remainingMs = computed(() => {
      const question = activeQuestion.value
      if (!question) return null
      const timeout = Number(questionTimeoutMs.value)
      if (!Number.isFinite(timeout) || timeout <= 0) return null
      const startedAt = Number(questionStartedAtById.value[question.id] ?? 0)
      if (!Number.isFinite(startedAt) || startedAt <= 0) return timeout
      const elapsed = Math.max(0, nowMs.value - startedAt)
      return Math.max(0, timeout - elapsed)
    })

    const remainingLabel = computed(() => {
      if (remainingMs.value == null) return null
      const totalSeconds = Math.ceil(remainingMs.value / 1000)
      const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
      const ss = String(totalSeconds % 60).padStart(2, '0')
      return `${mm}:${ss}`
    })

    const normalizeQuestionType = (raw: unknown): QuestionType['type'] => {
      const t = String(raw || '').toLowerCase()
      if (t === 'checkbox') return 'checkbox'
      if (t === 'text' || t === 'textbox') return 'text'
      return 'radio'
    }

    const upsertQuestion = (next: QuestionType) => {
      const idx = questions.value.findIndex((q) => q.id === next.id)
      if (idx === -1) {
        questions.value = [...questions.value, next]
        activeIndex.value = questions.value.length - 1
      } else {
        // Replace instead of shallow-merge to avoid mixing union variants (e.g. adding `options` to text questions)
        questions.value = questions.value.map((q, i) => (i === idx ? next : q))
        activeIndex.value = idx
      }
      ensureQuestionStart(next.id)
    }

    const sendAnswer = (status: AnswerStatusCode) => {
      const question = activeQuestion.value
      if (!question || !wsClient || wsClient.ws.readyState !== WebSocket.OPEN) return

      if (finalStatusByQuestionId.value[question.id]) return

      ensureQuestionStart(question.id)
      const startedAt = questionStartedAtById.value[question.id] ?? Date.now()
      const timeout = Number(questionTimeoutMs.value)
      const computedElapsed = Math.max(0, Date.now() - startedAt)
      const elapsed =
        Number.isFinite(timeout) && timeout > 0
          ? Math.min(computedElapsed, timeout)
          : computedElapsed
      const timeTakenMs = timeTakenMsByQuestionId.value[question.id] ?? elapsed

      finalStatusByQuestionId.value[question.id] = status
      timeTakenMsByQuestionId.value[question.id] = timeTakenMs
      snapshotDirty.value = true

      if (Number.isFinite(Number(totalQuestionsAttended.value))) {
        totalQuestionsAttended.value = Math.max(0, Number(totalQuestionsAttended.value)) + 1
      }

      const payload: SubmitAnswerMessage = {
        type: 'submit_answer',
        question_id: question.id,
        answer_status_id: answerStatusIdMap.value[status],
        time_taken_ms: Math.max(0, timeTakenMs),
      }

      if (status === 'answered') {
        if (question.type === 'text') {
          const text = String(textAnswer.value[question.id] ?? '').trim()
          if (text) payload.answer_text = text
        } else if (question.type === 'radio') {
          const opt = radioAnswer.value[question.id]
          const optId = Number(opt)
          if (!Number.isNaN(optId)) payload.option_id = optId
        } else if (question.type === 'checkbox') {
          const opts = checkboxAnswer.value[question.id] ?? []
          const ids = opts
            .map((x) => Number(x))
            .filter((n) => Number.isFinite(n) && !Number.isNaN(n))
          if (ids.length) payload.option_ids = ids
        }
      }

      wsClient.sendJson(payload)
    }

    const toggleCheckbox = (qid: number, optionId: string) => {
      const current = checkboxAnswer.value[qid] ?? []
      if (current.includes(optionId)) {
        checkboxAnswer.value[qid] = current.filter((x) => x !== optionId)
      } else {
        checkboxAnswer.value[qid] = [...current, optionId]
      }
      snapshotDirty.value = true
    }

    const nextQuestion = () => {
      activeIndex.value = Math.min(questions.value.length - 1, activeIndex.value + 1)
    }

    const submit = () => {
      if (isAnswerLocked.value) return
      if (activeIndex.value >= questions.value.length - 1) {
        sendAnswer('answered')
        toast.success('Answer submitted')
        return
      }
      sendAnswer('answered')
      nextQuestion()
    }

    const skip = () => {
      if (isAnswerLocked.value) return
      sendAnswer('skipped')
      if (activeIndex.value < questions.value.length - 1) {
        nextQuestion()
      }
    }

    watch(
      () => activeQuestion.value?.id,
      (qid) => {
        if (!qid) return
        ensureQuestionStart(qid)
        snapshotDirty.value = true
      },
      { immediate: true },
    )

    watch(
      () => [radioAnswer.value, checkboxAnswer.value, textAnswer.value],
      () => {
        snapshotDirty.value = true
      },
      { deep: true },
    )

    onMounted(() => {
      const init = async () => {
        await load()
        if (!sessionId.value) return

        const snapshot = readParticipantQuestionSnapshot()
        if (snapshot) {
          hydrateFromSnapshot(snapshot)
        }

        const progressData = await loadSessionProgress()
        const localQuestionId = snapshot ? Number(snapshot.question.id) : null
        const serverQuestionId = getQuestionIdFromProgress(progressData)

        const serverStatusRaw = String((progressData as any)?.last_answer_status ?? '')
          .toLowerCase()
          .trim()
        const hasServerFinalStatus = ['answered', 'skipped', 'timeout'].includes(serverStatusRaw)

        if (hasServerFinalStatus) {
          // Server says this question is already attended; always trust server state.
          if (progressData) applySessionProgress(progressData)
        } else if (!snapshot) {
          if (progressData) applySessionProgress(progressData)
        } else if (!serverQuestionId || !localQuestionId || serverQuestionId !== localQuestionId) {
          if (progressData) applySessionProgress(progressData)
        } else {
          // Only here we trust local timer: same question id and no server final status yet.
          const attended = Number((progressData as any)?.total_questions_attended)
          if (Number.isFinite(attended)) totalQuestionsAttended.value = attended

          // Auto-timeout immediately if timer expired on refresh
          const q = activeQuestion.value
          if (q) {
            const timeout = Number(questionTimeoutMs.value)
            const startedAt = Number(questionStartedAtById.value[q.id] ?? 0)
            if (
              Number.isFinite(timeout) &&
              timeout > 0 &&
              Number.isFinite(startedAt) &&
              startedAt > 0
            ) {
              const elapsed = Math.max(0, Date.now() - startedAt)
              if (elapsed >= timeout) {
                // Timer expired on refresh: lock and auto-submit timeout
                timeTakenMsByQuestionId.value[q.id] = timeout
                sendAnswer('timeout')
              }
            }
          }
        }

        // Best-effort initial leaderboard load (so participant sees ranking even before WS updates)
        loadLeaderboard()

        try {
          wsClient = connectLiveSessionWs(
            sessionId.value,
            {
              onMessage: (msg: LiveSessionWsMessage) => {
                const t = String((msg as any)?.type ?? '')
                if (t === 'session_ended' || t === 'session_end') {
                  redirectToLeaderboard()
                  return
                }

                if ((msg as any)?.type === 'participant_joined') {
                  const m = msg as any

                  const rawParticipant = m?.participant
                  console.log('🚀 ~ init ~ rawParticipant:', rawParticipant)
                  const participantList = Array.isArray(rawParticipant)
                    ? rawParticipant
                    : rawParticipant
                      ? [rawParticipant]
                      : []

                  if (participantList.length) {
                    const normalized = participantList.map((p: any) => ({
                      ...p,
                      score: p?.score ?? p?.total_score,
                    }))
                    const incoming = parseLeaderboardItems(normalized)
                    if (incoming.length) {
                      const merged = new Map(
                        leaderboardItems.value.map((item) => [Number(item.user_id), item]),
                      )
                      for (const item of incoming) {
                        merged.set(Number(item.user_id), item)
                      }
                      // Sort alphabetically by name for rank assignment
                      const sorted = Array.from(merged.values()).sort((a, b) =>
                        String(a.name).localeCompare(String(b.name)),
                      )

                      // ^ IF you want joined by can use user_id[only work for new users ]
                      // const sorted = Array.from(merged.values()).sort(
                      //   (a, b) => a.user_id - b.user_id,
                      // )

                      sorted.forEach((item, idx) => {
                        item.rank = idx + 1
                      })
                      leaderboardItems.value = sorted
                    }
                  }

                  return
                }

                if ((msg as any)?.type === 'leaderboard_updated') {
                  const m = msg as any
                  const items = Array.isArray(m?.items) ? m.items : []
                  if (items.length) {
                    leaderboardItems.value = parseLeaderboardItems(items)
                    //^ incase you need to merge to the leader board - TODO
                    // const incoming = parseLeaderboardItems(items)
                    // if (incoming.length) {
                    //   const merged = new Map(
                    //     leaderboardItems.value.map((item) => [Number(item.user_id), item]),
                    //   )
                    //   for (const item of incoming) {
                    //     merged.set(Number(item.user_id), item)
                    //   }
                    //   leaderboardItems.value = Array.from(merged.values())
                    // }
                  }
                }

                if ((msg as any)?.type !== 'question_started') return
                const payload = msg as any
                const q = payload?.question
                if (!q) return

                const opts = Array.isArray(q.options)
                  ? q.options.map((opt: any, idx: number) => ({
                      id: String(opt?.id ?? idx),
                      label: String(opt?.label ?? opt?.option_text ?? `Option ${idx + 1}`),
                      score: Number(opt?.score ?? 0),
                    }))
                  : []

                const nextQuestion: QuestionType = {
                  id: Number(q.id),
                  text: String(q.text ?? ''),
                  type: normalizeQuestionType(q.type),
                  ...(opts.length ? { options: opts } : {}),
                } as QuestionType

                questionTimeoutMsOverride.value = Number(q.timeout_ms ?? 0)

                questionStartedAtById.value[nextQuestion.id] = Date.now()
                finalStatusByQuestionId.value[nextQuestion.id] = null
                timeTakenMsByQuestionId.value[nextQuestion.id] = null

                radioAnswer.value[nextQuestion.id] = ''
                checkboxAnswer.value[nextQuestion.id] = []
                textAnswer.value[nextQuestion.id] = ''

                upsertQuestion(nextQuestion)
                snapshotDirty.value = true
              },
            },
            liveSessionStore.participant?.participant_token ?? null,
          )
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Failed to connect to live session')
        }
      }

      init()

      tickHandle = window.setInterval(() => {
        nowMs.value = Date.now()
        const question = activeQuestion.value
        if (!question) return
        ensureQuestionStart(question.id)

        const timeout = Number(questionTimeoutMs.value)
        if (!Number.isFinite(timeout) || timeout <= 0) return
        if (finalStatusByQuestionId.value[question.id]) return

        if ((remainingMs.value ?? 0) <= 0) {
          // lock + send timeout once
          timeTakenMsByQuestionId.value[question.id] = timeout
          sendAnswer('timeout')
        }

        if (snapshotDirty.value) {
          writeParticipantQuestionSnapshot(false)
        }
      }, 500)
    })

    onBeforeUnmount(() => {
      writeParticipantQuestionSnapshot(true)
      if (tickHandle) window.clearInterval(tickHandle)
      wsClient?.close()
      wsClient = null
    })

    return () => {
      const question = activeQuestion.value
      const myRow = myLeaderboardRow.value
      const myScoreLabel = formatScore(Number(myRow?.score) || 0)
      const myRankLabel = myRow && Number(myRow.rank) > 0 ? `#${Number(myRow.rank)}` : '—'
      const myUserId = participantUserId.value

      return (
        <div class="w-full max-w-7xl mx-auto p-6">
          <PageHeader
            title={liveSessionStore.sessionName}
            description="Live Session"
            isBackBtn={false}
          />

          <div class="mt-6 flex flex-col lg:flex-row gap-6">
            <div class="w-full lg:w-1/3">
              <Card>
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-base font-semibold">Live Ranking</div>
                    <div class="text-sm text-gray-700">Welcome {participantName.value}</div>
                    {participantEmail.value && (
                      <div class="text-xs text-gray-500">{participantEmail.value}</div>
                    )}
                  </div>
                </div>

                <div class="mt-4 space-y-3">
                  <div class="mt-4">
                    <div class="relative overflow-hidden rounded-xl border border-neutral-700 bg-gradient-to-br from-[#0f172a] to-[#020617] px-6 py-4 shadow-lg flex items-center justify-between">
                      {/* Neon ambient glow */}
                      <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,#38bdf8,transparent_60%)]"></div>

                      {/* Stats Row */}
                      <div class="relative flex w-full items-center justify-between text-center">
                        {/* Rank */}
                        <div class="flex flex-col items-center">
                          <span class="text-xs text-gray-400">Rank</span>
                          <span class="animate-pulse text-lg font-bold text-cyan-400">
                            #{myRankLabel}
                          </span>
                        </div>

                        {/* Divider */}
                        <div class="h-8 w-px bg-neutral-700"></div>

                        {/* Score */}
                        <div class="flex flex-col items-center">
                          <span class="text-xs text-gray-400">Score</span>
                          <span class="text-lg font-bold text-white">{myScoreLabel}</span>
                        </div>

                        {/* Divider */}
                        {/* <div class="h-8 w-px bg-neutral-700"></div> */}

                        {/* Progress */}
                        {/* <div class="flex flex-col items-center">
                          <span class="text-xs text-gray-400">Progress</span>
                          <span class="text-lg font-semibold text-white">
                            Q{progressLabel.value.current}/{progressLabel.value.total}
                          </span>
                        </div>*/}
                      </div>

                      {/* subtle border glow */}
                      <div class="absolute inset-0 rounded-xl border border-cyan-400 opacity-10 pointer-events-none"></div>
                    </div>
                  </div>

                  {leaderboard.value.length === 0 ? (
                    <div class="text-sm text-gray-500">Waiting for leaderboard…</div>
                  ) : (
                    <div class="rounded-lg border border-neutral-200 overflow-hidden">
                      <div class="px-3 py-2 border-b border-neutral-200 bg-background-secondary">
                        <div class="grid grid-cols-12 gap-2 text-xs font-semibold tracking-wide text-text-secondary">
                          <div class="col-span-3">RANK</div>
                          <div class="col-span-6">PLAYER</div>
                          <div class="col-span-3 text-right">SCORE</div>
                        </div>
                      </div>

                      <div class="max-h-96 overflow-auto divide-y divide-neutral-200 bg-white">
                        {leaderboard.value.map((p, idx) => {
                          const rank = Number.isFinite(Number(p.rank)) ? Number(p.rank) : idx + 1
                          console.log('🚀 ~ rank:', rank)
                          const score = Number(p.score) || 0
                          const isMe = myUserId != null && Number(p.user_id) === myUserId

                          return (
                            <div
                              key={p.user_id}
                              class={['px-3 py-2', isMe ? 'bg-primary-50' : 'bg-white'].join(' ')}
                            >
                              <div class="grid grid-cols-12 gap-2 items-center">
                                <div class="col-span-3">
                                  <span class="text-sm font-semibold text-text-secondary">
                                    {rank}
                                  </span>
                                </div>

                                <div class="col-span-6 min-w-0">
                                  <div class="font-semibold text-text-primary truncate">
                                    {p.name}
                                    {isMe ? ' (You)' : ''}
                                  </div>
                                </div>

                                <div class="col-span-3 text-right">
                                  <div class="font-bold text-text-primary">
                                    {formatScore(score)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
            {/* Question */}
            <div class="w-full lg:w-2/3">
              <Card>
                {/* <div class="flex items-center justify-between">
                  <div class="text-base font-semibold">
                    Question {progressLabel.value.current} of {progressLabel.value.total}
                  </div>
                 </div> */}

                {question && (
                  <div class="mt-4">
                    <div class="text-lg font-semibold">{question.text}</div>
                    {activeFinalStatus.value && (
                      <div class="mt-2 text-sm text-gray-600">
                        Answer locked ({activeFinalStatus.value})
                      </div>
                    )}
                    {remainingLabel.value ? (
                      <div class="mt-2">
                        <div class="flex items-center justify-between text-sm text-text-secondary mb-2">
                          <span>Time Remaining</span>

                          <div class="text-sm text-text-secondary flex items-center gap-2">
                            <Clock class="w-4 h-4" />
                            <span class="font-semibold text-text-primary font-mono">
                              {remainingLabel.value}
                            </span>
                          </div>
                        </div>
                        <div class="h-2 rounded-full bg-neutral-200 overflow-hidden">
                          <div
                            class="h-full bg-green-500"
                            style={{ width: `${timePercent.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : null}
                    {/* Radio  */}
                    <div class="mt-4 space-y-3">
                      {question.type === 'radio' &&
                        question.options.map((opt) => (
                          <label
                            key={opt.id}
                            class="flex items-center gap-3 border border-neutral-200 rounded-lg p-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={radioAnswer.value[question.id] === opt.id}
                              disabled={isAnswerLocked.value}
                              onChange={() => (radioAnswer.value[question.id] = opt.id)}
                            />
                            <span class="break-words whitespace-normal">{opt.label}</span>
                          </label>
                        ))}
                      {/* checkbox */}
                      {question.type === 'checkbox' &&
                        question.options.map((opt) => (
                          <label
                            key={opt.id}
                            class="flex items-center gap-3 border border-neutral-200 rounded-lg p-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={(checkboxAnswer.value[question.id] ?? []).includes(opt.id)}
                              disabled={isAnswerLocked.value}
                              onChange={() => toggleCheckbox(question.id, opt.id)}
                            />
                            <span class="break-words whitespace-normal">{opt.label}</span>
                          </label>
                        ))}
                      {/* text box */}
                      {question.type === 'text' && (
                        <textarea
                          class="w-full min-h-28 rounded-lg border border-neutral-200 p-3 outline-none"
                          placeholder="Type your answer"
                          value={textAnswer.value[question.id] ?? ''}
                          disabled={isAnswerLocked.value}
                          onInput={(e) =>
                            (textAnswer.value[question.id] = (
                              e.target as HTMLTextAreaElement
                            ).value)
                          }
                        />
                      )}
                    </div>

                    <div class="mt-6 flex items-center gap-3">
                      <Button variant="primary" onClick={submit} disabled={isAnswerLocked.value}>
                        Submit Answer
                      </Button>
                      <Button variant="outline" onClick={skip} disabled={isAnswerLocked.value}>
                        Skip
                      </Button>
                    </div>
                  </div>
                )}
                {!question && (
                  <div class="mt-4 text-sm text-gray-500">Waiting for the question…</div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )
    }
  },
})
