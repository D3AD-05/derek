import { computed, defineComponent, type PropType } from 'vue'
import type { Question } from '@/modules/question/types'
import { formatDurationMs } from '@/core/utils/time'

export default defineComponent({
  name: 'SessionStatsCards',
  props: {
    questions: {
      type: Array as PropType<Question[]>,
      default: () => [],
    },
  },
  setup(props) {
    const selectedCount = computed(() => props.questions.length)
    const totalTime = computed(() => {
      const totalMs = props.questions.reduce((sum, q) => sum + (q.time_limit_ms || 0), 0)
      return formatDurationMs(totalMs, { fallback: '00:00', hours: 'never' })
    })
    const totalScore = computed(() => {
      return props.questions.reduce((sum, q) => sum + (q.total_score || 0), 0)
    })

    return () => (
      <div class="grid grid-cols-3 gap-4">
        <div class="rounded-xl p-4 mb-4 shadow-sm bg-white/90">
          <p class="text-sm text-gray-500">Selected Questions</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{selectedCount.value}</p>
        </div>
        <div class="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <p class="text-sm text-gray-500">Total Time</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{totalTime.value}</p>
        </div>
        <div class="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <p class="text-sm text-gray-500">Total Score</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{totalScore.value} pts</p>
        </div>
      </div>
    )
  },
})
