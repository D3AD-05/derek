import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import Statcard from '@/core/components/statcard/Statcard'
import SessionInfoCard from '@/core/components/sessionCard/SessionInfoCard'
import { useCommunityStore } from '@/core/store/community'
import { useSessionStore } from '@/modules/sessions/store'
import { OrderType, SessionExpand, SessionOrderBy, type SessionOut } from '@/modules/sessions/types'
import { type SessionStatus } from '@/modules/sessions/components/StatusTabs'
import { formatDurationMs } from '@/core/utils/time'
import { CalendarDays, Check, LayoutGrid, Play } from 'lucide-vue-next'

export default defineComponent((_, { slots }) => {
  const router = useRouter()
  const toast = useToast()
  const communityStore = useCommunityStore()
  const sessionStore = useSessionStore()

  const {
    sessionStatusList: statuses,
    statusCounts: counts,
    statusCountsLoading,
  } = storeToRefs(sessionStore)

  const activeStatus = ref<SessionStatus>('ongoing')

  const pageSize = ref(10)
  const currentPage = ref(1)
  const dashboardSessions = ref<SessionOut[]>([])
  const isLoadingMore = ref(false)
  const isInitialLoading = ref(true)

  let observer: IntersectionObserver | null = null

  const activeStatusTitle = computed(() => {
    switch (activeStatus.value) {
      case 'all':
        return 'All Sessions'
      case 'upcoming':
        return 'Upcoming Sessions'
      case 'ongoing':
        return 'Ongoing Sessions'
      case 'completed':
        return 'Completed Sessions'
      default:
        return 'Sessions'
    }
  })

  const hasMore = computed(() => {
    const total = sessionStore.totalCount ?? 0
    return dashboardSessions.value.length < total
  })

  const statusIdByCode = computed(() => {
    const map = new Map<string, number>()
    for (const status of statuses.value) {
      map.set(status.code, status.id)
    }
    return map
  })

  const statusCodeById = computed(() => {
    const map = new Map<number, SessionStatus>()
    for (const status of statuses.value) {
      map.set(status.id, status.code as SessionStatus)
    }
    return map
  })

  const statusCards = computed(() => {
    return [
      {
        code: 'all' as SessionStatus,
        id: undefined,
        title: 'All Sessions',
        count: statusCountsLoading.value ? '...' : (counts.value.all ?? 0),
      },

      ...statuses.value.map((status) => ({
        code: status.code as SessionStatus,
        id: status.id,
        title: status.display_name,
        count: statusCountsLoading.value
          ? '...'
          : (counts.value[status.code as SessionStatus] ?? 0),
      })),
    ]
  })

  const statusCardMeta: Record<
    SessionStatus,
    { icon: any; borderLeftColor: string; fillColor: string }
  > = {
    ongoing: {
      icon: <Play />,
      borderLeftColor: 'var(--color-secondary-200)',
      fillColor: 'var(--color-secondary-50)',
    },
    upcoming: {
      icon: <CalendarDays />,
      borderLeftColor: 'var(--color-primary-200)',
      fillColor: 'var(--color-primary-50)',
    },
    completed: {
      icon: <Check />,
      borderLeftColor: 'var(--color-success-200)',
      fillColor: 'var(--color-success-50)',
    },
    all: {
      icon: <LayoutGrid />,
      borderLeftColor: 'var(--color-error-200)',
      fillColor: 'var(--color-error-50)',
    },
  }

  const fetchDashboardSessions = async (options?: { reset?: boolean }) => {
    const reset = Boolean(options?.reset)

    if (reset) {
      currentPage.value = 1
      dashboardSessions.value = []
    }

    const statusId = statusIdByCode.value.get(activeStatus.value)

    const response = await sessionStore.ListSessions({
      filter: statusId ? { session_status_id: statusId } : {},
      pagination: {
        limit: pageSize.value,
        offset: (currentPage.value - 1) * pageSize.value,
      },
      order: {
        order_by: SessionOrderBy.Id,
        order_type: OrderType.Desc,
      },
      expand: [SessionExpand.SessionStatus, SessionExpand.CreatedBy],
    })

    if (response.status === 'success' && response.data?.items) {
      const existingIds = new Set(dashboardSessions.value.map((s) => s.id))
      const newItems = response.data.items.filter((s) => !existingIds.has(s.id))
      dashboardSessions.value = dashboardSessions.value.concat(newItems)
    }
  }

  const loadNextPage = async () => {
    if (!hasMore.value) return
    if (sessionStore.loading || isLoadingMore.value) return

    isLoadingMore.value = true
    try {
      currentPage.value += 1
      await fetchDashboardSessions()
    } finally {
      isLoadingMore.value = false
    }
  }

  const handleStatusCardClick = async (status: SessionStatus) => {
    activeStatus.value = status
    await fetchDashboardSessions({ reset: true })
  }

  const handleOpenSession = (id?: number) => {
    if (!id) return
    router.push(`/sessions/${id}`)
  }

  const handleStartSession = (id?: number) => {
    if (!id) return
    router.push(`/session/${id}/live`)
  }

  const handleRanking = (id?: number) => {
    if (!id) return
    router.push(`/session/${id}/leaderboard`)
  }

  const handleShare = async (id?: number) => {
    const url = `${window.location.origin}/#/session/${id}/join`

    try {
      await navigator.clipboard.writeText(url)
      toast.success(`Link copied:${url}`)
    } catch (error) {
      toast.error('Failed to copy' + error)
    }
  }

  const loadInitialData = async () => {
    await Promise.all([sessionStore.fetchStatusCounts(), fetchDashboardSessions({ reset: true })])
  }

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void loadNextPage()
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    )
  })

  watch(
    () => communityStore.communityId,
    async (next, prev) => {
      if (!next || next === prev) return

      currentPage.value = 1
      isInitialLoading.value = true

      try {
        await loadInitialData()
      } finally {
        isInitialLoading.value = false
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })
  return () => (
    <div>
      <div class="flex gap-4 mb-6">
        {statusCards.value.map((card) => {
          const meta = statusCardMeta[card.code]
          return (
            <Statcard
              key={card.id ?? card.code}
              title={card.title}
              number={card.count}
              icon={meta.icon}
              borderLeftColor={meta.borderLeftColor}
              fillColor={meta.fillColor}
              onClick={() => handleStatusCardClick(card.code)}
            />
          )
        })}
      </div>

      <h2 class="text-2xl font-bold text-text-primary mb-6">{activeStatusTitle.value}</h2>

      {sessionStore.loading && dashboardSessions.value.length === 0 ? (
        <div class="flex justify-center items-center py-20">
          <div class="text-gray-500">Loading sessions...</div>
        </div>
      ) : sessionStore.error && dashboardSessions.value.length === 0 ? (
        <div class="flex justify-center items-center py-20">
          <div class="text-red-500">{sessionStore.error}</div>
        </div>
      ) : dashboardSessions.value.length > 0 ? (
        <div class="flex flex-col gap-6">
          {dashboardSessions.value.map((session) => (
            <SessionInfoCard
              key={session.id}
              sessionName={session.name}
              venue={session.venue}
              date={new Date(session.created_at).toLocaleDateString('en-GB')}
              time={new Date(session.created_at).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              status={(() => {
                const statusId =
                  typeof session.session_status === 'object'
                    ? session.session_status?.id
                    : session.session_status
                return statusId ? (statusCodeById.value.get(statusId) ?? 'ongoing') : 'ongoing'
              })()}
              participants={session.participant_count ?? 0}
              questions={session.question_count ?? 0}
              totalTime={formatDurationMs(session.total_time_ms, { fallback: '-' })}
              totalScore={session.total_score ?? 0}
              onOpenSession={() => handleStartSession(session.id)}
              onEditSession={() => handleOpenSession(session.id)}
              onRanking={() => handleRanking(session.id)}
              onShare={() => handleShare(session.id)}
            />
          ))}

          {(sessionStore.loading || isLoadingMore.value) && hasMore.value && (
            <div class="flex justify-center items-center py-6">
              <div class="text-gray-500">Loading more...</div>
            </div>
          )}
        </div>
      ) : (
        <div class="flex justify-center items-center py-20">
          <div class="text-gray-500">No sessions found.</div>
        </div>
      )}

      {slots.default?.()}
    </div>
  )
})
