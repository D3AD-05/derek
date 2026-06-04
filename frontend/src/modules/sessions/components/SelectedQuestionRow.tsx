import { defineComponent, type PropType } from 'vue'
import type { Question } from '@/modules/question/types'
import { formatDurationMs } from '@/core/utils/time'

export default defineComponent({
  name: 'SelectedQuestionRow',
  props: {
    question: {
      type: Object as PropType<Question>,
      required: true,
    },
    onDelete: {
      type: Function as PropType<(id: number) => void>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class="flex items-start justify-between rounded-lg bg-gray-50 p-4">
        <div>
          <p class="font-medium text-gray-900">{props.question.title}</p>

          <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              ⏱ {formatDurationMs(props.question.time_limit_ms, { fallback: '00:00', hours: 'never' })}
            </span>
            <span class="flex items-center gap-1">🏆 {props.question.total_score} points</span>
          </div>
        </div>

        <button
          class="ml-4 rounded-md p-2 text-red-500 hover:bg-red-50 hover:text-red-600"
          title="Delete question"
          onClick={() => props.onDelete(props.question.id)}
        >
          🗑
        </button>
      </div>
    )
  },
})
