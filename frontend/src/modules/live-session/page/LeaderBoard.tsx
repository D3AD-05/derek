import { defineComponent, onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Card from '@/core/components/card/Card'
import PageHeader from '@/core/components/header/PageHeader'
import { useLiveSessionStore } from '../store'
import { GetSessionLeaderboardApi } from '../service'

interface Participant {
  id: number
  user_id?: number
  name: string
  email?: string
  score?: number
  answeredCount?: number
  ready?: boolean
  rank?: number
}

function initials(name: string) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const first = parts[0]?.[0] ?? 'U'
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase()
}

function formatScore(score: number) {
  const n = Number(score) || 0
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
}

export default defineComponent({
  name: 'LeaderBoard',
  setup() {
    const route = useRoute()
    const liveSessionStore = useLiveSessionStore()

    const sessionId = computed(() => Number(route.params.id))

    const userId = history.state.userId

    const participants = ref<Participant[]>([])

    const hasRankingData = computed(() =>
      participants.value.some(
        (p) => (Number(p.score) || 0) > 0 || (Number(p.answeredCount) || 0) > 0,
      ),
    )

    const leaderboard = computed(() => {
      const list = [...participants.value].filter((p) => Number.isFinite(Number(p.id)))

      // Prefer backend-provided rank if present
      if (list.every((p) => Number.isFinite(Number(p.rank)))) {
        return list.sort((a, b) => (Number(a.rank) || 0) - (Number(b.rank) || 0))
      }

      return list.sort((a, b) => {
        const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0)
        if (scoreDiff !== 0) return scoreDiff

        const answeredDiff = (Number(b.answeredCount) || 0) - (Number(a.answeredCount) || 0)
        if (answeredDiff !== 0) return answeredDiff

        return String(a.name).localeCompare(String(b.name))
      })
    })
    const myRow = computed(() => {
      const uid = Number(userId)
      if (!Number.isFinite(uid)) return null
      const idx = leaderboard.value.findIndex((p) => Number(p.user_id) === uid)
      if (idx === -1) return null
      const row = leaderboard.value[idx]
      if (!row) return null
      const rank = Number.isFinite(Number(row.rank)) ? Number(row.rank) : idx + 1
      return { ...row, rank }
    })

    const topThree = computed(() => leaderboard.value.slice(0, 3))

    const podiumOrder = computed(() => {
      // display as 2nd, 1st, 3rd (center highlight)
      const one = topThree.value[0]
      const two = topThree.value[1]
      const three = topThree.value[2]
      return [
        two ? { participant: two, rank: 2 } : null,
        one ? { participant: one, rank: 1 } : null,
        three ? { participant: three, rank: 3 } : null,
      ].filter(Boolean) as Array<{ participant: Participant; rank: 1 | 2 | 3 }>
    })

    const rowList = computed(() => leaderboard.value)

    const podiumHeightClass = (rank: 1 | 2 | 3) => {
      if (rank === 1) return 'h-28 sm:h-32'
      if (rank === 2) return 'h-22 sm:h-28'
      return 'h-20 sm:h-24'
    }

    const podiumAccentClass = (rank: 1 | 2 | 3) => {
      if (rank === 1) return 'border-warning-500/40 bg-warning-500/10'
      if (rank === 2) return 'border-neutral-500/40 bg-neutral-500/10'
      return 'border-secondary-500/40 bg-secondary-500/10'
    }

    const podiumAvatarClass = (rank: 1 | 2 | 3) => {
      if (rank === 1) return 'bg-warning-400 text-neutral-900'
      if (rank === 2) return 'bg-neutral-200 text-neutral-900'
      return 'bg-secondary-400 text-neutral-900'
    }

    const podiumScoreClass = (rank: 1 | 2 | 3) => {
      if (rank === 1) return 'text-warning-700'
      if (rank === 2) return 'text-neutral-700'
      return 'text-secondary-700'
    }

    const loadLeaderboard = async () => {
      if (!sessionId.value) return

      const token = liveSessionStore.participant?.participant_token ?? null

      try {
        const res = await GetSessionLeaderboardApi(sessionId.value, token)
        const data = (res as any)?.data
        const items = Array.isArray(data?.items) ? data.items : []

        participants.value = items
          .map((it: any) => {
            const userId = Number(it?.user_id)
            const rawName = String(it?.name ?? 'Unknown')
            const looksLikeEmail = rawName.includes('@')

            return {
              id: userId,
              user_id: userId,
              rank: Number.isFinite(Number(it?.rank)) ? Number(it?.rank) : undefined,
              name: looksLikeEmail ? rawName.split('@')[0] || rawName : rawName,
              email: looksLikeEmail ? rawName : undefined,
              score: Number.isFinite(Number(it?.score)) ? Number(it?.score) : 0,
            } satisfies Participant
          })
          .filter((p: Participant) => Number.isFinite(Number(p.id)))
      } catch (e) {
        console.log('Failed to load leaderboard:', e)
        participants.value = []
      }
    }

    onMounted(() => {
      loadLeaderboard()
    })

    return () => (
      <div class="p-8 max-w-6xl mx-auto">
        <PageHeader
          title="Leaderboard"
          description="Final standings"
          isBackBtn={userId ? false : true}
        />

        {participants.value.length === 0 ? (
          <Card className="text-center py-12">
            <div class="text-text-secondary">No participants yet</div>
          </Card>
        ) : (
          <>
            {/* Top 3 (Podium) */}
            <div class="mb-8">
              <Card className="bg-background-secondary border-neutral-200 overflow-hidden p-0">
                <div class="px-4 sm:px-8 py-10">
                  <div class="flex items-end justify-center gap-4 sm:gap-8">
                    {podiumOrder.value.map(({ participant, rank }) => {
                      const score = Number(participant.score) || 0
                      const isFirst = rank === 1
                      return (
                        <div
                          key={`${participant.id}-${rank}`}
                          class={[
                            'flex flex-col items-center',
                            isFirst ? 'w-32 sm:w-44' : 'w-28 sm:w-40',
                          ].join(' ')}
                        >
                          <div
                            class={[
                              'rounded-full flex items-center justify-center font-extrabold',
                              'border border-neutral-200',
                              isFirst ? 'w-16 h-16 text-lg' : 'w-14 h-14 text-base',
                              podiumAvatarClass(rank),
                            ].join(' ')}
                          >
                            {initials(participant.name)}
                          </div>

                          <div class={[isFirst ? 'mt-3' : 'mt-2', 'w-full text-center'].join(' ')}>
                            <div class="text-sm sm:text-base font-semibold text-text-primary truncate">
                              {participant.name}
                            </div>
                            {hasRankingData.value ? (
                              <div
                                class={[
                                  podiumScoreClass(rank),
                                  'text-xs sm:text-sm font-medium',
                                ].join(' ')}
                              >
                                {formatScore(score)} pts
                              </div>
                            ) : (
                              <div class="text-xs sm:text-sm text-text-secondary">
                                Waiting for scores
                              </div>
                            )}
                          </div>

                          <div
                            class={[
                              'mt-4 w-full rounded-t-2xl border',
                              'flex items-center justify-center',
                              podiumHeightClass(rank),
                              podiumAccentClass(rank),
                            ].join(' ')}
                          >
                            <div
                              class={[
                                isFirst ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl',
                                'font-extrabold text-text-primary',
                              ].join(' ')}
                            >
                              #{rank}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {myRow.value && (
              <div class="mb-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 shadow-sm border border-blue-100">
                <div class="text-sm text-gray-700">
                  <span class="font-medium text-gray-900">You</span>
                  <span class="mx-1">•</span>
                  {myRow.value.name}
                </div>

                <div class="flex items-center gap-4 text-sm">
                  <div class="text-gray-600">
                    Score:
                    <span class="ml-1 font-semibold text-indigo-600">
                      {formatScore(myRow.value.score ?? 0)}
                    </span>
                  </div>

                  <div class="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
                    #{myRow.value.rank}
                  </div>
                </div>
              </div>
            )}

            {/* Full list */}
            <Card className="p-0 overflow-hidden">
              <div class="px-5 py-4 border-b border-neutral-200 bg-background-secondary">
                <div class="grid grid-cols-12 gap-4 text-xs font-semibold tracking-wide text-text-secondary">
                  <div class="col-span-2">RANK</div>
                  <div class="col-span-7">PLAYER</div>
                  <div class="col-span-3 text-right">SCORE</div>
                </div>
              </div>

              <div class="divide-y divide-neutral-200">
                {rowList.value.map((p, idx) => {
                  const rank = Number.isFinite(Number(p.rank)) ? Number(p.rank) : idx + 1
                  const score = Number(p.score) || 0

                  return (
                    <div key={p.id} class="px-5 py-4 bg-white">
                      <div class="grid grid-cols-12 gap-4 items-center">
                        <div class="col-span-2">
                          <span class="text-sm font-semibold text-text-secondary">{rank}</span>
                        </div>

                        <div class="col-span-7 min-w-0 flex items-center gap-3">
                          <div class="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                            <span class="text-primary-700 font-semibold text-xs">
                              {initials(p.name)}
                            </span>
                          </div>
                          <div class="min-w-0">
                            <div class="font-semibold text-text-primary truncate">{p.name}</div>
                          </div>
                        </div>

                        <div class="col-span-3 text-right">
                          {hasRankingData.value ? (
                            <div class="font-bold text-text-primary">{formatScore(score)}</div>
                          ) : (
                            <div class="text-sm text-text-secondary">—</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </>
        )}
      </div>
    )
  },
})
