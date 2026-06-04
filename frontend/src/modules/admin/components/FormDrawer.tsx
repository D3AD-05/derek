import { X } from 'lucide-vue-next'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'FormDrawer',

  props: {
    isOpen: { type: Boolean, required: true },
    onClose: { type: Function as PropType<() => void>, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },

  setup(props, { slots }) {
    const onOverlayClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).dataset?.overlay === 'true') props.onClose()
    }

    return () => {
      if (!props.isOpen) return null

      return (
        <div class="fixed inset-0 z-50" onClick={onOverlayClick} data-overlay="true">
          <div class="absolute inset-0 bg-black/30" data-overlay="true" />

          <div class="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl" data-overlay="false">
            <div class="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{props.title}</h2>
                {props.description && <p class="text-sm text-gray-500">{props.description}</p>}
              </div>

              <button class="rounded p-2 hover:bg-gray-100" onClick={props.onClose}>
                <X class="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <div class="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
              {slots.default?.()}
            </div>

            <div class=" px-6 py-4 flex justify-end gap-3">{slots.footer?.()}</div>
          </div>
        </div>
      )
    }
  },
})
