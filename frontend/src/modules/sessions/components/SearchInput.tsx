import { defineComponent } from 'vue'
import { Search } from 'lucide-vue-next'
import Button from '@/core/components/button/Button'

export default defineComponent({
  name: 'SearchInput',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'Search sessions...',
    },
  },
  emits: ['update:modelValue', 'search'],
  setup(props, { emit }) {
    const handleSearch = () => emit('search')

    return () => (
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

        <input
          type="text"
          value={props.modelValue}
          onInput={(e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)}
          onKeyup={(e: KeyboardEvent) => e.key === 'Enter' && handleSearch()}
          placeholder={props.placeholder}
          class="w-full pl-11 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
        />

        <Button
          variant="primary"
          size="sm"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg"
          onClick={handleSearch}
          icon={() => <Search class="h-4 w-4" />}
          iconPosition="right"
        >
          Search
        </Button>
      </div>
    )
  },
})
