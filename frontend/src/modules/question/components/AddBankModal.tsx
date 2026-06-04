import { defineComponent, ref, watch, type PropType } from 'vue'
import { useToast } from '@/core/composables/useToast'
import type { QuestionBank } from '../types'

export default defineComponent({
  name: 'AddBankModal',

  props: {
    show: {
      type: Boolean,
      default: false,
    },
    bank: {
      type: Object as PropType<QuestionBank | null>,
      default: null,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onCreate: {
      type: Function as PropType<(data: { name: string; description: string }) => void>,
      required: true,
    },
    onUpdate: {
      type: Function as PropType<(id: number, data: { name: string; description: string }) => void>,
      required: false,
    },
  },

  setup(props) {
    const toast = useToast()
    const name = ref('')
    const description = ref('')

    // Watch for bank prop changes to populate form for editing
    watch(
      () => props.bank,
      (newBank) => {
        if (newBank) {
          name.value = newBank.name
          description.value = newBank.description || ''
        } else {
          name.value = ''
          description.value = ''
        }
      },
      { immediate: true },
    )

    const isEditMode = computed(() => props.bank !== null)

    const handleSubmit = () => {
      if (!name.value.trim()) {
        toast.warning('Name is required')
        return
      }

      if (isEditMode.value && props.bank) {
        // Edit mode
        props.onUpdate?.(props.bank.id, {
          name: name.value,
          description: description.value,
        })
      } else {
        // Create mode
        props.onCreate({
          name: name.value,
          description: description.value,
        })
      }

      // Reset form
      name.value = ''
      description.value = ''
    }

    const handleCancel = () => {
      // Reset form
      name.value = ''
      description.value = ''
      props.onClose()
    }

    return () => {
      if (!props.show) return null

      return (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20">
          <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 class="mb-6 text-2xl font-semibold text-gray-900">
              {isEditMode.value ? 'Edit Question Bank' : 'New Question Bank'}
            </h2>

            <div class="space-y-4">
              {/* Name Field */}
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  Name<span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. JavaScript"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                  value={name.value}
                  onInput={(e: any) => (name.value = e.target.value)}
                />
              </div>

              {/* Description Field */}
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Optional description"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                  rows={3}
                  value={description.value}
                  onInput={(e: any) => (description.value = e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div class="mt-6 flex justify-end gap-3">
              <button
                class="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 hover:bg-gray-50"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                class="rounded-lg bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700"
                onClick={handleSubmit}
              >
                {isEditMode.value ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )
    }
  },
})
