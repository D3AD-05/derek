import { defineComponent, type PropType } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import Button from '../button/Button'

export default defineComponent({
  name: 'DeleteConfirmModal',

  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Delete Confirmation',
    },
    message: {
      type: String,
      required: true,
    },
    confirmText: {
      type: String,
      default: 'Delete',
    },
    cancelText: {
      type: String,
      default: 'Cancel',
    },
    onConfirm: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onCancel: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },

  setup(props) {
    return () => {
      if (!props.show) return null

      return (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* Icon */}
            <div class="mb-4 flex justify-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle class="h-6 w-6 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h2 class="mb-2 text-center text-xl font-semibold text-gray-900">{props.title}</h2>

            {/* Message */}
            <p class="mb-6 text-center text-sm text-gray-600">{props.message}</p>

            {/* Actions */}
            <div class="flex justify-end gap-3">
              <Button variant="outline" size="md" onClick={props.onCancel} class="px-5">
                {props.cancelText}
              </Button>

              <Button variant="danger" size="md" onClick={props.onConfirm} class="px-5">
                {props.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )
    }
  },
})
