import { defineComponent, type PropType } from 'vue'
import { ArrowRight, X } from 'lucide-vue-next'

type QuestionBankOption = {
  id: number
  name: string
  description?: string | null
  questionsCount?: number
  questions_count?: number
}

export default defineComponent({
  name: 'ImportQuestionBankModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    banks: {
      type: Array as PropType<QuestionBankOption[]>,
      default: () => [],
    },
    onSelect: {
      type: Function as PropType<(bank: QuestionBankOption) => void>,
      required: true,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      if (!props.show) return null

      return (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div class="mb-4 flex items-start justify-between">
              <div>
                <p class="text-base font-semibold text-gray-900">Select Question Bank</p>
                <p class="text-sm text-gray-500">Pick a bank to import its questions.</p>
              </div>
              <button
                class="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                onClick={props.onClose}
                aria-label="Close"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <div class="max-h-80 space-y-3 overflow-y-auto pr-1">
              {props.banks.length ? (
                props.banks.map((bank) => (
                  <button
                    key={bank.id}
                    class="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
                    onClick={() => props.onSelect(bank)}
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div class="min-w-0">
                        <p class="truncate text-base font-semibold text-gray-900">{bank.name}</p>
                        {bank.description && (
                          <p class="mt-1 truncate text-sm text-gray-600">{bank.description}</p>
                        )}
                        <p class="mt-1 text-xs text-gray-500">
                          {bank.questionsCount ?? bank.questions_count ?? 0} questions
                        </p>
                      </div>
                      <ArrowRight class="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))
              ) : (
                <div class="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                  No question banks available.
                </div>
              )}
            </div>

            <div class="mt-6 flex justify-end">
              <button
                class="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                onClick={props.onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )
    }
  },
})
