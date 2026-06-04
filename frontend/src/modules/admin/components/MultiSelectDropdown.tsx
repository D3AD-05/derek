import { ChevronDown, X } from 'lucide-vue-next'
import {
  defineComponent,
  type PropType,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from 'vue'

export type MultiSelectOption<TId extends string = string> = {
  id: TId
  label: string
}

export default defineComponent({
  name: 'MultiSelectDropdown',

  props: {
    modelValue: { type: Array as PropType<string[]>, default: () => [] },
    options: { type: Array as PropType<Array<MultiSelectOption<string>>>, default: () => [] },
    label: { type: String, default: '' },
    placeholder: { type: String, default: 'Select...' },
    disabled: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const rootRef = ref<HTMLElement | null>(null)
    const isOpen = ref(false)
    const searchQuery = ref('')

    const selectedSet = computed(() => new Set(props.modelValue))

    const selectedLabels = computed(() => {
      const map = new Map(props.options.map((o) => [o.id, o.label]))
      return props.modelValue.map((id) => map.get(id) ?? String(id))
    })

    const filteredOptions = computed(() => {
      if (!searchQuery.value.trim()) return props.options
      const query = searchQuery.value.toLowerCase().trim()
      return props.options.filter((o) => o.label.toLowerCase().includes(query))
    })

    const close = () => {
      isOpen.value = false
    }

    const toggleOpen = () => {
      if (props.disabled) return
      isOpen.value = !isOpen.value
    }

    const setNext = (next: string[]) => {
      emit('update:modelValue', next)
    }

    const toggleId = (id: string) => {
      if (props.disabled) return
      const next = selectedSet.value.has(id)
        ? props.modelValue.filter((x) => x !== id)
        : [...props.modelValue, id]
      setNext(next)
    }

    const removeId = (id: string) => {
      if (props.disabled) return
      setNext(props.modelValue.filter((x) => x !== id))
    }

    const onDocMouseDown = (e: MouseEvent) => {
      if (!isOpen.value) return
      const el = rootRef.value
      if (!el) return
      if (el.contains(e.target as Node)) return
      close()
    }

    onMounted(() => {
      document.addEventListener('mousedown', onDocMouseDown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onDocMouseDown)
    })

    watch(
      () => props.disabled,
      (disabled) => {
        if (disabled) close()
      },
    )

    watch(
      () => isOpen.value,
      (open) => {
        if (!open) searchQuery.value = ''
      },
    )

    return () => (
      <div class="flex flex-col gap-1" ref={rootRef}>
        {props.label && <label class="text-sm font-medium">{props.label}</label>}

        <button
          type="button"
          disabled={props.disabled}
          onClick={toggleOpen}
          class={[
            'w-full rounded border py-2 px-3 text-left bg-white',
            'flex items-center justify-between gap-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            props.error ? 'border-red-500' : 'border-gray-300',
          ].join(' ')}
        >
          <div class="flex flex-wrap gap-2 min-h-[24px]">
            {props.modelValue.length === 0 ? (
              <span class="text-sm text-gray-400">{props.placeholder}</span>
            ) : (
              props.modelValue.map((id, idx) => (
                <span class="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs">
                  <span class="truncate max-w-[220px]">{selectedLabels.value[idx]}</span>
                  <button
                    type="button"
                    class="rounded hover:bg-gray-200 p-0.5"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeId(id)
                    }}
                  >
                    <X class="h-3 w-3 text-gray-600" />
                  </button>
                </span>
              ))
            )}
          </div>

          <ChevronDown
            class={[
              'h-4 w-4 text-gray-500 transition-transform',
              isOpen.value ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>

        {props.error && <span class="text-xs text-red-500">{props.error}</span>}

        {isOpen.value && !props.disabled && (
          <div class="mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 flex flex-col">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery.value}
              onInput={(e) => (searchQuery.value = (e.target as HTMLInputElement).value)}
              class="sticky top-0 px-3 py-2 border-b border-gray-200 text-sm focus:outline-none"
              autofocus
            />
            <div class="overflow-auto flex-1">
              {filteredOptions.value.length === 0 ? (
                <div class="p-3 text-sm text-gray-500">No options available.</div>
              ) : (
                filteredOptions.value.map((o) => (
                  <button
                    type="button"
                    class="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 text-sm"
                    onClick={() => toggleId(o.id)}
                  >
                    <span class="text-gray-800">{o.label}</span>
                    <input
                      type="checkbox"
                      class="h-4 w-4"
                      checked={selectedSet.value.has(o.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleId(o.id)}
                    />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )
  },
})
