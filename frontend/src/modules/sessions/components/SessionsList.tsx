import { defineComponent, type PropType } from 'vue'
import SessionCard, { type Session } from './SessionCard'

export default defineComponent({
  name: 'SessionsList',
  components: {
    SessionCard,
  },
  props: {
    sessions: {
      type: Array as PropType<Session[]>,
      required: true,
    },
  },
  emits: ['open-session', 'start-session', 'ranking-session', 'share'],
  setup(props, { emit }) {
    return () => {
      if (props.sessions.length === 0) {
        return (
          <div class="bg-white rounded-xl p-12 text-center">
            <p class="text-gray-500 text-lg">No sessions found</p>
          </div>
        )
      }

      return (
        <div class="space-y-4">
          {props.sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onOpen-session={(id: string) => emit('open-session', id)}
              onStart-session={(id: string) => emit('start-session', id)}
              onRanking-session={(id: string) => emit('ranking-session', id)}
              onShare={(id: string) => emit('share', id)}
            />
          ))}
        </div>
      )
    }
  },
})
