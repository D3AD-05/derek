import { defineComponent } from 'vue'

export type SessionStatus = 'all' | 'ongoing' | 'upcoming' | 'completed'

export default defineComponent({
  name: 'StatusTabs',
  props: {
    activeStatus: {
      type: String as () => SessionStatus,
      required: true,
    },
    counts: {
      type: Object as () => Record<SessionStatus, number>,
      default: () => ({ all: 0, ongoing: 0, upcoming: 0, completed: 0 }),
    },
  },
  emits: ['update:activeStatus'],
  setup(props, { emit }) {
    const tabs: { value: SessionStatus; label: string }[] = [
      { value: 'all', label: 'All' },
      { value: 'ongoing', label: 'Ongoing' },
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'completed', label: 'Completed' },
    ]

    return () => (
      <div class="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = props.activeStatus === tab.value

          return (
            <button
              key={tab.value}
              onClick={() => emit('update:activeStatus', tab.value)}
              class={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                active
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>

              {props.counts[tab.value] > 0 && (
                <span
                  class={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {props.counts[tab.value]}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  },
})
