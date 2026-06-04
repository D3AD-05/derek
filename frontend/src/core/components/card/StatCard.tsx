import { computed, defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'StatCard',
  props: {
    className: { type: String, default: '' },
    title: { type: String, required: true },
    value: { type: [String, Number], required: true },

    // Optional icon (prefer using the `icon` slot for SVG/VNodes)
    icon: {
      type: [String, Object] as unknown as PropType<any>,
      default: undefined,
    },

    // Colors can be Tailwind-driven (via className) or overridden via theme CSS vars here.
    // Examples: `var(--color-primary-50)`, `var(--color-primary-600)`.
    bgColor: { type: String, default: '' },
    iconBoxColor: { type: String, default: '' },
    iconColor: { type: String, default: '' },

    // When true, title + value use the same color as the icon.
    useIconColorForText: { type: Boolean, default: false },

    // Optional legacy styling hook (used by the existing dashboard cards)
    borderLeftColor: { type: String, default: '' },

    onClick: { type: Function as PropType<(event: MouseEvent) => void> },
    onMouseEnter: { type: Function as PropType<(event: MouseEvent) => void> },
    onMouseLeave: { type: Function as PropType<(event: MouseEvent) => void> },
  },
  setup(props, { slots }) {
    const hasIcon = computed(
      () => Boolean(slots.icon) || (props.icon !== undefined && props.icon !== null),
    )
    const clickable = computed(() => typeof props.onClick === 'function')

    const accentColor = computed(() => props.iconColor || props.iconBoxColor || '')

    const textStyle = computed(() => {
      if (!props.useIconColorForText || !accentColor.value) return undefined
      return { color: accentColor.value }
    })

    return () => (
      <div
        class={[
          'w-full rounded-lg shadow-sm border border-neutral-200',
          'p-4 sm:p-5',
          'flex items-center gap-4',
          'bg-white',
          clickable.value ? 'cursor-pointer' : '',
          props.className,
        ].join(' ')}
        style={{
          backgroundColor: props.bgColor || undefined,
          borderLeft: props.borderLeftColor ? `4px solid ${props.borderLeftColor}` : undefined,
        }}
        onClick={props.onClick}
        onMouseenter={props.onMouseEnter}
        onMouseleave={props.onMouseLeave}
      >
        {hasIcon.value ? (
          <div
            class="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: props.iconBoxColor || undefined,
              color: accentColor.value || undefined,
            }}
          >
            {slots.icon?.() ?? props.icon}
          </div>
        ) : null}

        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-text-secondary truncate" style={textStyle.value}>
            {props.title}
          </div>
          <div class="text-2xl font-semibold text-text-primary truncate" style={textStyle.value}>
            {props.value}
          </div>
        </div>
      </div>
    )
  },
})
