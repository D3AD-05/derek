import { defineComponent, type PropType, type VNode } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'
type IconPosition = 'left' | 'right'

export default defineComponent({
  name: 'Button',
  props: {
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'primary',
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md',
    },
    type: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: [Object, Function] as PropType<VNode | (() => VNode)>,
      default: null,
    },
    iconPosition: {
      type: String as PropType<IconPosition>,
      default: 'left',
    },
    onClick: {
      type: Function as PropType<(event: MouseEvent) => void>,
    },
    class: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const getVariantClasses = () => {
      const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-transparent',
        danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
        success: 'bg-green-600 text-white hover:bg-green-700 border-transparent',
        outline: 'bg-transparent border-gray-300 text-blue-700 hover:bg-gray-50',
        ghost: 'bg-transparent text-gray-700 hover:bg-blue-100 border-transparent',
      }
      return variants[props.variant] || variants.primary
    }

    const getSizeClasses = () => {
      const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      }
      return sizes[props.size] || sizes.md
    }

    const handleClick = (event: MouseEvent) => {
      if (!props.disabled && !props.loading && props.onClick) {
        props.onClick(event)
      }
    }

    const renderIcon = () => {
      if (!props.icon) return null
      const iconNode = typeof props.icon === 'function' ? props.icon() : props.icon

      return <span class="inline-flex items-center">{iconNode}</span>
    }

    return () => (
      <button
        type={props.type}
        disabled={props.disabled || props.loading}
        onClick={handleClick}
        class={[
          'rounded-lg border font-medium transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          getVariantClasses(),
          getSizeClasses(),
          props.class,
        ].join(' ')}
      >
        <span class="inline-flex items-center gap-2">
          {props.loading && (
            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          )}
          {!props.loading && props.iconPosition === 'left' && renderIcon()}
          <span>{slots.default?.()}</span>
          {!props.loading && props.iconPosition === 'right' && renderIcon()}
        </span>
      </button>
    )
  },
})
