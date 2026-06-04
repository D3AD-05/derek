import { defineComponent, ref, watch } from 'vue'
import Button from '../button/Button'
import Card from '../card/Card'
import { useQuestionStore } from '@/modules/question/store'
import type { Question } from '@/modules/question/types'

export default defineComponent({
  name: 'ImportQuestionsModal',
  props: {
    show: { type: Boolean, required: true },
    onClose: { type: Function, required: true },
    onImport: { type: Function, required: true },
    questionBankId: { type: Number },
    selectedQuestionIds: { type: Array as () => number[], default: () => [] },
    questionBankName: { type: String, default: '' },
  },
  setup(props) {
    const questionStore = useQuestionStore()
    const toast = useToast()
    const questions = ref<Question[]>([])
    const selectedCount = ref(0)
    const totalTime = ref('00:00')
    const totalScore = ref(0)
    const searchQuery = ref('')

    const loadQuestions = async () => {
      if (!props.questionBankId) {
        toast.error('No question bank ID provided')
        return
      }

      try {
        const result = await questionStore.QuestionList({
          filter: { question_bank_id: props.questionBankId },
          order: {
            order_by: 'id',
            order_type: 'asc',
          },
        })
        questions.value = (result?.items || []).map((q: any) => ({
          ...q,
          checked: props.selectedQuestionIds.includes(q.id),
          locked: props.selectedQuestionIds.includes(q.id),
        }))
        calculateTotals()
      } catch (error) {
        console.error('Failed to load questions:', error)
      }
    }

    // Watch for modal opening and questionBankId changes
    watch(
      () => [props.show, props.questionBankId],
      ([newShow, newBankId]) => {
        if (newShow && newBankId) {
          loadQuestions()
        }
      },
      { immediate: true },
    )

    const calculateTotals = () => {
      selectedCount.value = questions.value.filter((q: any) => q.checked).length

      const totalMs = questions.value
        .filter((q: any) => q.checked)
        .reduce((sum, q) => sum + q.time_limit_ms, 0)

      const minutes = Math.floor(totalMs / 60000)
      const seconds = Math.floor((totalMs % 60000) / 1000)
      totalTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

      totalScore.value = questions.value
        .filter((q: any) => q.checked)
        .reduce((sum, q) => sum + q.total_score, 0)
    }

    const getSelectedQuestions = () => {
      return questions.value.filter((q: any) => q.checked)
    }

    return () =>
      props.show && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
          <div class="fixed inset-0 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-lg p-8 w-175 max-h-[80vh] overflow-y-auto">
              <div class="mb-6">
                <h2 class="text-xl font-semibold text-neutral-800">Import Questions</h2>
                {props.questionBankName ? (
                  <p class="text-sm text-neutral-500 mt-1">From {props.questionBankName}</p>
                ) : null}
              </div>

              {/* Stats Cards */}
              <div class="grid grid-cols-3 gap-4 mb-6">
                <Card className="bg-linear-to-br from-primary-50 to-primary-100 border-primary-200">
                  <div class="text-center">
                    <div class="text-sm text-neutral-600 mb-1">Selected</div>
                    <div class="text-2xl font-bold text-primary-700">{selectedCount.value}</div>
                  </div>
                </Card>
                <Card className="bg-linear-to-br from-secondary-50 to-secondary-100 border-secondary-200">
                  <div class="text-center">
                    <div class="text-sm text-neutral-600 mb-1">Total Time</div>
                    <div class="text-2xl font-bold text-secondary-700">{totalTime.value}</div>
                  </div>
                </Card>
                <Card className="bg-linear-to-br from-success-50 to-success-100 border-success-200">
                  <div class="text-center">
                    <div class="text-sm text-neutral-600 mb-1">Total Score</div>
                    <div class="text-2xl font-bold text-success-700">{totalScore.value} pts</div>
                  </div>
                </Card>
              </div>

              <div class="mb-4">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery.value}
                  onInput={(e: any) => (searchQuery.value = e.target.value)}
                  class="w-full border border-neutral-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />

                {/* Select/Unselect All */}
                <div class="flex justify-between items-center mb-4">
                  <span class="text-sm text-neutral-600">
                    {questions.value.length} questions available
                  </span>
                  <div class="flex gap-2">
                    <button
                      onClick={() => {
                        questions.value.forEach((q: any) => (q.checked = true))
                        calculateTotals()
                      }}
                      class="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Select All
                    </button>
                    <span class="text-neutral-300">|</span>
                    <button
                      onClick={() => {
                        questions.value.forEach((q: any) => (q.checked = false))
                        calculateTotals()
                      }}
                      class="text-sm text-neutral-600 hover:text-neutral-700 font-medium"
                    >
                      Unselect All
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                <div class="space-y-3 max-h-75 overflow-y-auto">
                  {questions.value
                    .filter((q) =>
                      searchQuery.value
                        ? q.title.toLowerCase().includes(searchQuery.value.toLowerCase())
                        : true,
                    )
                    .map((q: any) => {
                      const timeInSeconds = Math.floor(q.time_limit_ms / 1000)
                      const minutes = Math.floor(timeInSeconds / 60)
                      const seconds = timeInSeconds % 60
                      const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

                      return (
                        <Card
                          key={q.id}
                          className="hover:shadow-md transition-shadow cursor-pointer bg-neutral-50"
                          onClick={() => {
                            if (!q.locked) {
                              q.checked = !q.checked
                              calculateTotals()
                            }
                          }}
                        >
                          <div class="flex items-start justify-between">
                            <div class="flex-1">
                              <div class="flex items-start">
                                <input
                                  type="checkbox"
                                  checked={q.checked}
                                  disabled={q.locked}
                                  class={[
                                    'mr-3 mt-1',
                                    q.locked ? 'opacity-60 cursor-not-allowed' : '',
                                  ]}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e: any) => {
                                    e.stopPropagation()
                                    if (!q.locked) {
                                      q.checked = !!e.target.checked
                                      calculateTotals()
                                    }
                                  }}
                                />
                                <div class="flex-1">
                                  <div class="flex items-center justify-between gap-3">
                                    <p class="text-neutral-800 font-medium">{q.title}</p>
                                    {q.locked && (
                                      <span class="text-xs font-medium text-neutral-500">
                                        Selected
                                      </span>
                                    )}
                                  </div>
                                  <div class="mt-2 flex items-center gap-4 text-sm text-neutral-500">
                                    <span class="flex items-center gap-1">⏱ {timeDisplay}</span>
                                    <span class="flex items-center gap-1">
                                      🏆 {q.total_score} points
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                </div>
              </div>

              {/* Action Buttons */}
              <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200">
                <Button variant="secondary" size="md" onClick={() => props.onClose()}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => props.onImport(getSelectedQuestions())}
                  class="bg-secondary-600 hover:bg-secondary-700 text-white"
                  disabled={selectedCount.value === 0}
                >
                  Import {selectedCount.value} Question{selectedCount.value !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
  },
})
