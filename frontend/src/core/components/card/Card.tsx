import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'Card',
  props: {
    className: { type: String, default: '' },
    onClick: { type: Function as PropType<(event: MouseEvent) => void> },
    onMouseEnter: { type: Function as PropType<(event: MouseEvent) => void> },
    onMouseLeave: { type: Function as PropType<(event: MouseEvent) => void> },
  },
  setup(props, { slots }) {
    return () => (
      <div
        class={`card bg-white rounded-lg shadow-sm border border-neutral-200 p-4 ${props.className}`}
        onClick={props.onClick}
        onMouseenter={props.onMouseEnter}
        onMouseleave={props.onMouseLeave}
      >
        {slots.default?.()}
      </div>
    )
  },
})
