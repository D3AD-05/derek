// SessionStatsCard.tsx
import { defineComponent } from 'vue'

interface SessionStatsCardProps {
  participants: number
  participantsLabel?: string
  questions: number
  questionsLabel?: string
  totalTime: string
  totalTimeLabel?: string
  totalScore: number
  totalScoreLabel?: string
  onOpenSession?: () => void
  onShare?: () => void
}

export default defineComponent({
  name: 'SessionStatsCard',
  props: {
    participants: {
      type: Number,
      required: true,
    },
    participantsLabel: {
      type: String,
      default: 'Active users',
    },
    questions: {
      type: Number,
      required: true,
    },
    questionsLabel: {
      type: String,
      default: 'Total items',
    },
    totalTime: {
      type: String,
      required: true,
    },
    totalTimeLabel: {
      type: String,
      default: 'Duration',
    },
    totalScore: {
      type: Number,
      required: true,
    },
    totalScoreLabel: {
      type: String,
      default: 'Max points',
    },
  },
  emits: ['openSession', 'share'],
  setup(props: SessionStatsCardProps, { emit }) {
    return () => (
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <div class="grid grid-cols-4 gap-6 mb-6">
          {/* Participants */}
          <div class="bg-secondary-50 rounded-lg p-4">
            <h3 class="text-sm text-text-secondary mb-2">Participants</h3>
            <div class="text-3xl font-bold text-text-primary">{props.participants}</div>
            <div class="text-xs text-gray-500 mt-1">{props.participantsLabel}</div>
          </div>

          {/* Questions */}
          <div class="bg-info-50 rounded-lg p-4">
            <h3 class="text-sm text-text-secondary mb-2">Question</h3>
            <div class="text-3xl font-bold text-text-primary">{props.questions}</div>
            <div class="text-xs text-gray-500 mt-1">{props.questionsLabel}</div>
          </div>

          {/* Total Time */}
          <div class="bg-primary-50 rounded-lg p-4">
            <h3 class="text-sm text-text-secondary mb-2">Total Time</h3>
            <div class="text-3xl font-bold text-text-primary">{props.totalTime}</div>
            <div class="text-xs text-gray-500 mt-1">{props.totalTimeLabel}</div>
          </div>

          {/* Total Score */}
          <div class="bg-success-50 rounded-lg p-4">
            <h3 class="text-sm text-text-secondary mb-2">Total Score</h3>
            <div class="text-3xl font-bold text-text-primary">{props.totalScore}</div>
            <div class="text-xs text-gray-500 mt-1">{props.totalScoreLabel}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div class="flex gap-3 justify-end">
          <button
            class="px-6 py-2.5 bg-secondary-600 text-white rounded-lg font-medium hover:bg-secondary-700 transition-colors"
            onClick={() => emit('openSession')}
          >
            Open Session
          </button>
          <button
            class="px-6 py-2.5 bg-secondary-600 text-white rounded-lg font-medium hover:bg-secondary-700 transition-colors"
            onClick={() => emit('share')}
          >
            Share
          </button>
        </div>
      </div>
    )
  },
})
