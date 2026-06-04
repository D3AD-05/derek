import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'StatusChip',
  props: {
    status: {
      type: String as () => 'ongoing' | 'upcoming' | 'completed' | undefined,
      required: false,
    },
  },
  setup(props) {
    const statusStyles = computed(() => {
      // show a neutral loading placeholder when status is not provided yet
      const s = props.status
      if (!s) {
        return {
          bg: 'bg-neutral-100',
          text: 'text-neutral-600',
          label: 'Loading...',
        }
      }

      switch (s) {
        case 'ongoing':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            label: 'Ongoing',
          }
        case 'upcoming':
          return {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            label: 'Upcoming',
          }
        case 'completed':
          return {
            bg: 'bg-purple-100',
            text: 'text-purple-700',
            label: 'Completed',
          }
      }
    })

    return () => (
      <span
        class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusStyles.value.bg} ${statusStyles.value.text}`}
      >
        {/* <span
          class={`w-2 h-2 rounded-full ${statusStyles.value.text.replace('text-', 'bg-')}`}
        ></span> */}
        {statusStyles.value.label}
      </span>
    )
  },
})
