import { defineComponent, ref, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import SessionsHeader from '../components/SessionsHeader'
import SessionsToolbar from '../components/SessionsToolbar'
import SessionsList from '../components/SessionsList'
import Button from '@/core/components/button/Button'
import { type Session } from '../components/SessionCard'
import { type SessionStatus } from '../components/StatusTabs'
import { useSessionStore } from '../store'
import { SessionExpand, SessionOrderBy, OrderType, type SessionOut } from '../types'
import { useCommunityStore } from '@/core/store/community'

export default defineComponent({
  name: 'SessionsPage',
  components: {
    Button,
    SessionsHeader,
    SessionsToolbar,
    SessionsList,
  },
  setup() {
    const router = useRouter()
    const toast = useToast()
    const sessionStore = useSessionStore()
    const {
      statusCounts: counts,
      statusCountsLoading,
      sessionStatusList,
    } = storeToRefs(sessionStore)
    const communityStore = useCommunityStore()
    const searchValue = ref('')
    const activeStatus = ref<SessionStatus>('all')
    const currentPage = ref(1)
    const pageSize = ref(10)

    const statusIdByCode = computed(() => {
      const map = new Map<string, number>()
      for (const status of sessionStatusList.value) {
        map.set(status.code, status.id)
      }
      return map
    })

    const statusCodeById = computed(() => {
      const map = new Map<number, string>()
      for (const status of sessionStatusList.value) {
        map.set(status.id, status.code)
      }
      return map
    })

    function transformSession(session: SessionOut): Session {
      const statusId =
        typeof session.session_status === 'object'
          ? session.session_status?.id
          : session.session_status

      const mappedStatus = statusId ? statusCodeById.value.get(statusId) : undefined
      const status: Session['status'] =
        mappedStatus === 'upcoming' || mappedStatus === 'ongoing' || mappedStatus === 'completed'
          ? mappedStatus
          : 'ongoing'

      return {
        id: session.id.toString(),
        title: session.name,
        status,
        location: session.venue,
        date: new Date(session.created_at).toLocaleDateString('en-GB'),
        time: new Date(session.created_at).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        questionsCount: session.question_count ?? 0,
      }
    }

    const handleCreateSession = () => {
      router.push('/sessions/create')
    }

    const handleOpenSession = (id: string) => {
      router.push(`/sessions/${id}`)
    }
    const handleStartSession = (id: string) => {
      router.push(`/session/${id}/live`)
    }

    const handleRanking = (id: string) => {
      router.push(`/session/${id}/leaderboard`)
    }

    const handleShare = async (id: string) => {
      const url = `${window.location.origin}/#/session/${id}/join`

      try {
        await navigator.clipboard.writeText(url)
        toast.success(`Link copied:${url}`)
      } catch (error) {
        toast.error('Failed to copy' + error)
      }
    }

    // Fetch sessions based on current filters
    const fetchSessions = async () => {
      const statusId =
        activeStatus.value === 'all' ? undefined : statusIdByCode.value.get(activeStatus.value)

      const trimmedSearch = searchValue.value.trim()

      await sessionStore.ListSessions({
        filter: statusId ? { session_status_id: statusId } : {},
        pagination: {
          limit: pageSize.value,
          offset: (currentPage.value - 1) * pageSize.value,
        },
        search: trimmedSearch || undefined,
        order: {
          order_by: SessionOrderBy.Id,
          order_type: OrderType.Desc,
        },
        expand: [SessionExpand.SessionStatus, SessionExpand.CreatedBy],
      })
    }

    const handleSearch = async () => {
      currentPage.value = 1
      await fetchSessions()
    }

    // Watch for status changes
    const handleStatusChange = async (status: SessionStatus) => {
      activeStatus.value = status
      currentPage.value = 1 // Reset to first page
      await fetchSessions()
    }

    // Handle pagination
    const handlePageChange = async (page: number) => {
      currentPage.value = page
      await fetchSessions()
    }

    // Transform sessions for display
    const displaySessions = computed(() => {
      return sessionStore.sessions.map(transformSession)
    })

    // Initialize
    onMounted(async () => {
      await Promise.all([fetchSessions(), sessionStore.fetchStatusCounts()])
    })

    watch(
      () => communityStore.communityId,
      async (next, prev) => {
        if (next === prev) return
        currentPage.value = 1
        await Promise.all([fetchSessions(), sessionStore.fetchStatusCounts()])
      },
    )

    return () => (
      <div class="p-8">
        <SessionsHeader
          title="Sessions"
          description="Manage your quiz sessions"
          showCreateButton={true}
          onCreate-session={handleCreateSession}
        />
        <SessionsToolbar
          searchValue={searchValue.value}
          onUpdate:searchValue={(val: string) => (searchValue.value = val)}
          onSearch={handleSearch}
          activeStatus={activeStatus.value}
          onUpdate:activeStatus={handleStatusChange}
          counts={
            statusCountsLoading.value
              ? { all: 0, ongoing: 0, upcoming: 0, completed: 0 }
              : counts.value
          }
        />
        {/* TODO add loader  */}
        {sessionStore.loading ? (
          <div class="flex justify-center items-center py-20">
            <div class="text-gray-500">Loading sessions...</div>
          </div>
        ) : sessionStore.error ? (
          <div class="flex justify-center items-center py-20">
            <div class="text-red-500">{sessionStore.error}</div>
          </div>
        ) : (
          <>
            <SessionsList
              sessions={displaySessions.value}
              onOpen-session={handleOpenSession}
              onStart-session={handleStartSession}
              onRanking-session={handleRanking}
              onShare={handleShare}
            />

            {/* Pagination */}
            {sessionStore.totalCount > pageSize.value && (
              <div class="flex justify-center items-center gap-4 mt-8">
                <Button
                  onClick={() => handlePageChange(currentPage.value - 1)}
                  disabled={currentPage.value === 1}
                  variant="outline"
                  size="md"
                  icon={() => <ChevronLeft class="h-4 w-4" />}
                  iconPosition="left"
                  class="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </Button>

                <span class="text-gray-600">
                  Page {currentPage.value} of {Math.ceil(sessionStore.totalCount / pageSize.value)}
                </span>

                <Button
                  onClick={() => handlePageChange(currentPage.value + 1)}
                  disabled={
                    currentPage.value >= Math.ceil(sessionStore.totalCount / pageSize.value)
                  }
                  variant="outline"
                  size="md"
                  icon={() => <ChevronRight class="h-4 w-4" />}
                  iconPosition="right"
                  class="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    )
  },
})
