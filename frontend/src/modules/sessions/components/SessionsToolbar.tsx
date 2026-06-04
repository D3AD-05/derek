import { defineComponent } from 'vue'
import SearchInput from './SearchInput'
import StatusTabs, { type SessionStatus } from './StatusTabs'

export default defineComponent({
  name: 'SessionsToolbar',
  components: {
    SearchInput,
    StatusTabs,
  },
  props: {
    searchValue: {
      type: String,
      required: true,
    },
    activeStatus: {
      type: String as () => SessionStatus,
      required: true,
    },
    counts: {
      type: Object as () => Record<SessionStatus, number>,
      default: () => ({ all: 0, ongoing: 0, upcoming: 0, completed: 0 }),
    },
  },
  emits: ['update:searchValue', 'update:activeStatus', 'search'],
  setup(props, { emit }) {
    return () => (
      <div class="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center gap-4">
          <SearchInput
            modelValue={props.searchValue}
            onUpdate:modelValue={(val: string) => emit('update:searchValue', val)}
            onSearch={() => emit('search')}
          />

          <StatusTabs
            activeStatus={props.activeStatus}
            counts={props.counts}
            onUpdate:activeStatus={(val: SessionStatus) => emit('update:activeStatus', val)}
          />
        </div>
      </div>
    )
  },
})
