import { defineComponent } from 'vue'
import StatCard from '@/core/components/card/StatCard'

interface StatcardProps {
  title: string
  number: string | number
  icon?: string
  iconColor?: string
  fillColor?: string
  bgColor?: string
  className?: string
  borderLeftColor?: string
  useIconColorForText?: boolean
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default defineComponent({
  name: 'statCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    number: {
      type: [String, Number],
      required: true,
    },
    icon: {
      type: [String, Object],
      default: '',
    },
    iconColor: {
      type: String,
      default: '#7C3AED',
    },
    fillColor: {
      type: String,
      default: '#EDE9FE',
    },
    bgColor: {
      type: String,
      default: '',
    },
    borderLeftColor: {
      type: String,
      default: '#D1D5DB', // Tailwind gray-300
    },
    useIconColorForText: {
      type: Boolean,
      default: false,
    },
    className: {
      type: String,
      default: '',
    },
  },
  emits: ['click', 'mouseenter', 'mouseleave'],
  setup(props: StatcardProps, { emit }) {
    return () => (
      <StatCard
        className={props.className}
        title={props.title}
        value={props.number}
        icon={props.icon ?? ''}
        bgColor={props.bgColor ?? ''}
        iconBoxColor={props.fillColor ?? ''}
        iconColor={props.iconColor ?? ''}
        useIconColorForText={Boolean(props.useIconColorForText)}
        borderLeftColor={props.borderLeftColor ?? ''}
        onClick={() => emit('click')}
        onMouseEnter={() => emit('mouseenter')}
        onMouseLeave={() => emit('mouseleave')}
      />
    )
  },
})
