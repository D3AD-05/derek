import { defineComponent, type PropType } from 'vue'
import { Plus } from 'lucide-vue-next'

export default defineComponent({
  name: 'SessionsHeader',
  props: {
    title: {
      type: String as PropType<string>,
      required: true,
    },
    description: {
      type: String as PropType<string>,
      required: true,
    },
    showCreateButton: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: ['create-session'],
  setup(props, { emit }) {
    return () => (
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {props.title}
          </h1>

          <p class="mt-2 text-slate-500 text-base md:text-lg max-w-2xl">{props.description}</p>
        </div>

        {props.showCreateButton && (
          <button
            onClick={() => emit('create-session')}
            class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 shrink-0"
          >
            <Plus size={18} />
            Create Session
          </button>
        )}
      </div>
    )
  },
})
