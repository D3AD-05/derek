import { ArrowLeft } from 'lucide-vue-next'
import { defineComponent, type ExtractPropTypes } from 'vue'
import Button from '../button/Button'

const propsDef = {
  title: { type: String, required: true },
  description: { type: String, required: true },
  isBackBtn: { type: Boolean, default: true },
} as const

type Props = ExtractPropTypes<typeof propsDef>

export default defineComponent({
  name: 'PageHeader',
  props: propsDef,
  setup(props: Props) {
    return () => (
      <div class="flex justify-between items-start mb-8 ">
        <div>
          <div class="flex items-center gap-3">
            {props.isBackBtn && (
              <Button variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft />
              </Button>
            )}
            <h1 class="text-4xl font-bold text-gray-900 mb-2">{props.title}</h1>
          </div>
          <p class="text-gray-500 text-lg ml-6">{props.description}</p>
        </div>
      </div>
    )
  },
})
