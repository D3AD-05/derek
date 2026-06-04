import { computed, defineComponent, onMounted, ref } from 'vue'
import TextField from '@/core/components/inputFields/TextField/TextField'
import Button from '@/core/components/button/Button'
import SessionsHeader from '../components/SessionsHeader'
import ImportQuestionBankModal from '../components/ImportQuestionBankModal'
import ImportQuestionsModal from '@/core/components/modals/ImportQuestionsModal'
import { useQuestionStore } from '@/modules/question/store'
import type { Question, QuestionBank } from '@/modules/question/types'
import AddQuestionModal from '@/modules/question/components/AddQuestionModal'
import { useToast } from '@/core/composables/useToast'
import { storeToRefs } from 'pinia'
import SessionStatsCards from '../components/SessionStatsCards'
import SelectedQuestionRow from '../components/SelectedQuestionRow'
import { useRoute, useRouter } from 'vue-router'
import { CreateNewSessionAPI, UpdateSessionAPI } from '../service'
import { SessionQuestionExpand, type CreateSession as CreateSessionPayload } from '../types'
import { useSessionStore } from '../store'

export default defineComponent({
  name: 'CreateSession',
  setup() {
    const toast = useToast()
    const questionStore = useQuestionStore()
    const sessionStore = useSessionStore()
    const communityStore = useCommunityStore()
    const router = useRouter()
    const route = useRoute()

    const sessionId = computed(() => {
      const raw = route.params?.id
      if (raw === undefined || raw === null || raw === '') return null
      const n = Number(raw)
      return Number.isFinite(n) ? n : null
    })

    const isEditMode = computed(() => sessionId.value !== null)

    const sessionName = ref('')
    const venue = ref('')
    const saving = ref(false)
    const loadingSession = ref(false)

    const showAddQuestionModal = ref(false)
    const selectedBank = ref<QuestionBank | undefined>(undefined)

    // Use store state with storeToRefs for reactivity
    const { questionBanks, error } = storeToRefs(questionStore)

    const showImportModal = ref(false)
    // New modal state for importing questions
    const showImportQuestionsModal = ref(false)

    const importedQuestions = ref<Question[]>([])
    const selectedQuestionIdsByBank = ref<Record<number, number[]>>({})
    const searchQuery = ref('')

    const filteredImportedQuestions = computed(() => {
      const query = searchQuery.value.trim().toLowerCase()
      if (!query) return importedQuestions.value
      return importedQuestions.value.filter((q) => q.title.toLowerCase().includes(query))
    })

    const loadBanks = async (params?: { page?: number; pageSize?: number }) => {
      try {
        await questionStore.QBList({
          order_by: 'updated_at',
          order_type: 'desc',
          ...params,
        })
      } catch (err: any) {
        const errorMessage = error.value || err?.message || 'Failed to load banks'
        toast.error(errorMessage)
        console.error('Failed to load banks', err)
      }
    }

    const handleOnImport = () => {
      loadBanks()
      showImportModal.value = true
    }

    const handleAddQuestion = () => {
      showAddQuestionModal.value = true
    }

    const handleCancel = () => {
      router.push({ name: 'Sessions' })
    }

    const extractQuestionsFromSession = (sessionQuestions: any[]): Question[] => {
      const collected: any[] = []

      if (Array.isArray(sessionQuestions)) {
        for (const sq of sessionQuestions) {
          const q = sq?.question
          if (q) collected.push(q)
        }
      }

      //
      const byId = new Map<number, Question>()
      for (const q of collected) {
        const id = Number(q?.id)
        if (!Number.isFinite(id)) continue
        if (typeof q?.title !== 'string') continue

        //
        const transformedQuestion: Question = {
          id: q.id,
          title: q.title,
          answer_type: q.answer_type,
          question_bank: q.question_bank,
          is_scored: q.is_scored ?? true,
          time_limit_ms: q.time_limit_ms ?? 10000,
          options: q.options || [],
          created_by: q.created_by,
          created_at: q.created_at,
          updated_by: q.updated_by,
          updated_at: q.updated_at,
          total_score: q.total_score ?? 0,
        }
        byId.set(id, transformedQuestion)
      }

      return Array.from(byId.values())
    }

    const loadSessionForEdit = async () => {
      if (!isEditMode.value || sessionId.value === null) return

      loadingSession.value = true
      try {
        const response = await sessionStore.ListSessionQuestions({
          filter: { session_id: sessionId.value },
          expand: [SessionQuestionExpand.Session, SessionQuestionExpand.Question],
        })

        if (response.status !== 'success' || !response.data) {
          toast.error(response.message || 'Failed to load session')
          return
        }

        // Get session info
        if (
          response.data.items &&
          response.data.items.length > 0 &&
          response.data.items[0]?.session
        ) {
          const session = response.data.items[0].session
          if (session) {
            sessionName.value = String(session.name ?? '')
            venue.value = String(session.venue ?? '')
          }
        }

        const questions = extractQuestionsFromSession(response.data.items || [])
        importedQuestions.value = questions

        // bank selection state
        const nextSelected: Record<number, number[]> = {}
        for (const q of questions) {
          const bankId = getBankIdFromQuestion(q)
          if (!bankId) continue
          const list = nextSelected[bankId] || []
          if (!list.includes(q.id)) list.push(q.id)
          nextSelected[bankId] = list
        }
        selectedQuestionIdsByBank.value = nextSelected
      } catch (err: any) {
        const errorMessage = err?.message ?? String(err)
        toast.error(`Failed to load session: ${errorMessage}`)
        console.error('❌ Failed to load session:', err)
      } finally {
        loadingSession.value = false
      }
    }

    const handleSaveSession = async () => {
      if (!sessionName.value.trim()) {
        toast.error('Session Name is required')
        return
      }

      if (!venue.value.trim()) {
        toast.error('Venue is required')
        return
      }

      saving.value = true
      try {
        const questionIds = importedQuestions.value.map((q, index) => ({
          question_id: q.id,
          position: index + 1,
        }))

        if (isEditMode.value && sessionId.value !== null) {
          const payloadData = {
            name: sessionName.value.trim(),
            venue: venue.value.trim(),
            questions: questionIds,
          }
          const response = await UpdateSessionAPI(sessionId.value, payloadData, {
            return_data: true,
          })

          if (response.code === 200 || response.code === 201) {
            toast.success(response.message || 'Session updated successfully')
            router.push({ name: 'Sessions' })
            return
          }

          toast.error(response.message || 'Failed to update session')
          return
        }

        const payload: CreateSessionPayload = {
          name: sessionName.value.trim(),
          venue: venue.value.trim(),
          community_id: communityStore?.communityId ? communityStore.communityId : 0, //TODO : zero to be removed
          session_status_id: 1,
          questions: questionIds,
        }

        const response = await CreateNewSessionAPI(payload, { return_data: true })

        if (response.code === 200 || response.code === 201) {
          toast.success(response.message || 'Session created successfully')

          const newSessionId = response.data?.id
          if (newSessionId) {
            // Redirect to Live Session route
            router.push({
              name: '/LiveSession',
              params: { id: newSessionId },
            })
          } else {
            // Fallback if ID is missing
            router.push({ name: 'Sessions' })
          }

          return
        }

        toast.error(response.message || 'Failed to create session')
      } catch (err: any) {
        const errorMessage = err?.message ?? String(err)
        toast.error(
          `${isEditMode.value ? 'Failed to update session' : 'Failed to create session'}: ${errorMessage}`,
        )
        console.error('❌ Failed to save session:', err)
      } finally {
        saving.value = false
      }
    }

    const handleSelectBank = (bank: { id: number; name?: string }) => {
      // Toggle new import questions modal
      selectedBank.value = bank as QuestionBank
      showImportModal.value = false
      showImportQuestionsModal.value = true
    }

    const getBankIdFromQuestion = (q: Question) => {
      const qb: any = q.question_bank
      if (!qb) return undefined
      return typeof qb === 'number' ? qb : qb?.id
    }

    const handleQuestionCreated = (q: Question | null | undefined) => {
      if (!q) {
        console.error('❌ handleQuestionCreated called with null question')
        return
      }
      const existingIds = new Set(importedQuestions.value.map((x) => x.id))
      if (!existingIds.has(q.id)) {
        importedQuestions.value = [q, ...importedQuestions.value]
      }

      const bankId = getBankIdFromQuestion(q)
      if (bankId) {
        const current = new Set(selectedQuestionIdsByBank.value[bankId] || [])
        current.add(q.id)
        selectedQuestionIdsByBank.value = {
          ...selectedQuestionIdsByBank.value,
          [bankId]: Array.from(current),
        }
      }
    }

    const handleImportQuestions = (questions: Question[]) => {
      const bankId = selectedBank.value?.id

      // Merge into global imported list (dedupe by id)
      const existingIds = new Set(importedQuestions.value.map((q) => q.id))
      const merged = [...importedQuestions.value]
      for (const q of questions) {
        if (!existingIds.has(q.id)) {
          merged.push(q)
          existingIds.add(q.id)
        }
      }
      importedQuestions.value = merged

      // Persist per-bank selection for preselecting later
      if (bankId) {
        const current = new Set(selectedQuestionIdsByBank.value[bankId] || [])
        for (const q of questions) current.add(q.id)
        selectedQuestionIdsByBank.value = {
          ...selectedQuestionIdsByBank.value,
          [bankId]: Array.from(current),
        }
      }

      showImportQuestionsModal.value = false
    }

    const handleDeleteImportedQuestion = (id: number) => {
      const target = importedQuestions.value.find((q) => q.id === id)
      importedQuestions.value = importedQuestions.value.filter((q) => q.id !== id)

      const bankId = target ? getBankIdFromQuestion(target) : undefined
      if (bankId) {
        const next = (selectedQuestionIdsByBank.value[bankId] || []).filter((qid) => qid !== id)
        selectedQuestionIdsByBank.value = {
          ...selectedQuestionIdsByBank.value,
          [bankId]: next,
        }
      }
    }

    onMounted(async () => {
      await loadSessionForEdit()
    })

    return () => (
      <div class="p-8 ">
        <SessionsHeader
          title={isEditMode.value ? 'Edit session' : 'Create session'}
          description="Manage your quiz sessions"
        />
        {loadingSession.value && (
          <div class="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Loading session...</div>
        )}
        {/* name & import  */}
        <div class="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div class="flex items-center gap-4">
            <TextField
              label="Session Name"
              placeholder="Enter name"
              modelValue={sessionName.value}
              onUpdate:modelValue={(v: any) => (sessionName.value = String(v ?? ''))}
            />
            <TextField
              label="Venue"
              placeholder="Enter location"
              modelValue={venue.value}
              onUpdate:modelValue={(v: any) => (venue.value = String(v ?? ''))}
            />
            <div class="mt-5  flex gap-3">
              <Button variant="outline" size="md" onClick={() => handleOnImport()}>
                Import Questions
              </Button>
              <Button variant="primary" size="md" onClick={handleAddQuestion}>
                Add Questions
              </Button>
            </div>
          </div>
        </div>
        <SessionStatsCards questions={importedQuestions.value} />
        {/* search */}
        <div class="bg-white rounded-xl p-6 mb-2 shadow-sm">
          <div class="flex items-center justify-between gap-4 mb-4">
            <TextField
              placeholder="Search for questions ..."
              class="flex-1"
              modelValue={searchQuery.value}
              onUpdate:modelValue={(v: any) => (searchQuery.value = String(v ?? ''))}
            />
          </div>

          {/* importes question listed  */}

          <div class="space-y-3 max-h-90 overflow-y-auto">
            {filteredImportedQuestions.value.length ? (
              filteredImportedQuestions.value.map((q) => (
                <SelectedQuestionRow
                  key={q.id}
                  question={q}
                  onDelete={handleDeleteImportedQuestion}
                />
              ))
            ) : (
              <div class="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
                No questions selected.
              </div>
            )}
          </div>
        </div>

        {/* bottom button bar */}
        <div class="bg-white rounded-xl p-6 mb-6 shadow-sm flex items-center justify-end gap-3">
          <Button variant="outline" size="md" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSaveSession} disabled={saving.value}>
            {saving.value ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <ImportQuestionBankModal
          show={showImportModal.value}
          banks={questionBanks.value?.items}
          onClose={() => (showImportModal.value = false)}
          onSelect={(e) => handleSelectBank(e)}
        />

        <AddQuestionModal
          title={'Add new question'}
          show={showAddQuestionModal.value}
          fromSession={true}
          onClose={() => {
            showAddQuestionModal.value = false
          }}
          onCreate={async () => {}}
          onCreated={(q) => {
            handleQuestionCreated(q)
            showAddQuestionModal.value = false
          }}
        />

        <ImportQuestionsModal
          show={showImportQuestionsModal.value}
          questionBankId={selectedBank.value?.id}
          questionBankName={selectedBank.value?.name || ''}
          onClose={() => (showImportQuestionsModal.value = false)}
          selectedQuestionIds={
            selectedBank.value?.id
              ? selectedQuestionIdsByBank.value[selectedBank.value.id] || []
              : []
          }
          onImport={handleImportQuestions}
        />
      </div>
    )
  },
})
