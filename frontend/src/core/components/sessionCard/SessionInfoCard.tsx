// SessionInfoCard.tsx
import { defineComponent } from 'vue'
import Button from '../button/Button'
import { Users, HelpCircle, Clock3, Target, MapPin, Copy, Circle } from 'lucide-vue-next'

interface SessionInfoCardProps {
  sessionName: string
  venue: string
  date: string
  time: string
  participants: number
  participantsLabel?: string
  questions: number
  questionsLabel?: string
  totalTime: string
  totalTimeLabel?: string
  totalScore: number
  totalScoreLabel?: string
  status: 'all' | 'upcoming' | 'ongoing' | 'completed'
}

export default defineComponent({
  name: 'SessionInfoCard',
  props: {
    sessionName: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
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
    status: {
      type: String as () => 'upcoming' | 'ongoing' | 'completed',
      required: true,
    },
  },
  emits: ['openSession', 'editSession', 'share', 'ranking'],
  setup(props: SessionInfoCardProps, { emit }) {
    const statusBorderClass =
      {
        all: 'border-l-slate-400',
        upcoming: 'border-l-amber-400',
        completed: 'border-l-emerald-500',
        ongoing: 'border-l-blue-500',
      }[props.status] || 'border-l-slate-300'
    return () => (
      <div
        class={`bg-white border border-slate-200 border-l-4 ${statusBorderClass} rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all duration-200`}
      >
        {/* Header */}
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 leading-tight">{props.sessionName}</h2>

            <div class="flex items-center gap-2 mt-1.5 text-sm text-slate-500">
              <MapPin size={14} class="text-rose-400" />
              <span>
                {props.venue} • {props.date} • {props.time}
              </span>
            </div>
          </div>

          {props.status === 'ongoing' && (
            <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <Circle size={8} fill="currentColor" class="text-emerald-500" />
              <span class="text-xs font-medium text-emerald-700">LIVE</span>
            </div>
          )}
        </div>

        {/* Stats */}
        {/* Stats */}
        <div class="grid grid-cols-4 gap-4 mb-4">
          {/* Participants */}
          <div class="flex items-center gap-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users size={22} class="text-blue-600" />
            </div>

            <div>
              <div class="text-sm font-medium text-slate-500">Participants</div>
              <div class="text-3xl font-bold tracking-tight text-slate-900">
                {props.participants}
              </div>
            </div>
          </div>

          {/* Questions */}
          <div class="flex items-center gap-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-4">
            <div class="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <HelpCircle size={22} class="text-violet-600" />
            </div>

            <div>
              <div class="text-sm font-medium text-slate-500">Questions</div>
              <div class="text-3xl font-bold tracking-tight text-slate-900">{props.questions}</div>
            </div>
          </div>

          {/* Duration */}
          <div class="flex items-center gap-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock3 size={22} class="text-amber-600" />
            </div>

            <div>
              <div class="text-sm font-medium text-slate-500">Duration</div>
              <div class="text-3xl font-bold tracking-tight text-slate-900">{props.totalTime}</div>
            </div>
          </div>

          {/* Score */}
          <div class="flex items-center gap-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Target size={22} class="text-emerald-600" />
            </div>

            <div>
              <div class="text-sm font-medium text-slate-500">Score</div>
              <div class="text-3xl font-bold tracking-tight text-slate-900">{props.totalScore}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div class="flex justify-end gap-2">
          {props.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => emit('share')}
              icon={<Copy size={15} />}
            >
              Copy Link
            </Button>
          )}

          {(props.status === 'ongoing' || props.status === 'upcoming') && (
            <Button variant="primary" size="sm" onClick={() => emit('openSession')}>
              Open Session
            </Button>
          )}

          {props.status === 'upcoming' && (
            <Button variant="outline" size="sm" onClick={() => emit('editSession')}>
              Edit
            </Button>
          )}

          {props.status === 'completed' && (
            <Button variant="outline" size="sm" onClick={() => emit('ranking')}>
              Ranking
            </Button>
          )}
        </div>
      </div>
    )
  },
})
