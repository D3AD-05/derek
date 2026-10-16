import { defineComponent, type PropType } from 'vue'
import { MapPin, Calendar, Clock, HelpCircle, Copy, QrCode } from 'lucide-vue-next'
import QRCode from 'qrcode'
import StatusChip from '../../../core/components/statusChip/StatusChip'

export interface Session {
  id: string
  title: string
  status: 'ongoing' | 'upcoming' | 'completed'
  location: string
  date: string
  time: string
  questionsCount: number
}

export default defineComponent({
  name: 'SessionCard',
  components: {
    StatusChip,
    MapPin,
    Calendar,
    Clock,
    HelpCircle,
  },
  props: {
    session: {
      type: Object as PropType<Session>,
      required: true,
    },
  },
  emits: ['open-session', 'start-session', 'ranking-session', 'share'],
  setup(props, { emit }) {
    const downloadQrSvg = async () => {
      const url = `${window.location.origin}/#/session/${props.session.id}/join`
      const svg = await QRCode.toString(url, {
        type: 'svg',
      })

      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const objectUrl = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `session-${props.session.title}.svg`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    }

    return () => (
      <div class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusChip status={props.session.status} />

            <h3 class="min-w-0 text-lg font-semibold leading-6 text-slate-900 break-words">
              {props.session.title}
            </h3>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <div class="flex items-center gap-2">
              <MapPin size={18} class="shrink-0 text-rose-500" />
              <span>{props.session.location}</span>
            </div>

            <div class="flex items-center gap-2">
              <Calendar size={18} class="shrink-0 text-blue-500" />
              <span>{props.session.date}</span>
            </div>

            <div class="flex items-center gap-2">
              <Clock size={18} class="shrink-0 text-amber-500" />
              <span>{props.session.time}</span>
            </div>

            <div class="flex items-center gap-2">
              <HelpCircle size={18} class="shrink-0 text-violet-500" />
              <span>{props.session.questionsCount} questions</span>
            </div>
          </div>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-2">
          {(props.session.status === 'ongoing' || props.session.status === 'upcoming') && (
            <button
              type="button"
              onClick={() => emit('start-session', props.session.id)}
              class="rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Open Session
            </button>
          )}

          {props.session.status === 'upcoming' && (
            <button
              type="button"
              onClick={() => emit('open-session', props.session.id)}
              class="rounded-xl border border-slate-200 px-5 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              Edit
            </button>
          )}

          {props.session.status === 'completed' && (
            <button
              type="button"
              onClick={() => emit('ranking-session', props.session.id)}
              class="rounded-xl border border-slate-200 px-5 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              Ranking
            </button>
          )}

          {props.session.status !== 'completed' && (
            <button
              type="button"
              onClick={() => emit('share', props.session.id)}
              aria-label="Copy session link"
              title="Copy session link"
              class="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              <Copy size={20} />
            </button>
          )}

          {props.session.status !== 'completed' && (
            <button
              type="button"
              onClick={downloadQrSvg}
              aria-label="Download session QR code"
              title="Download QR code"
              class="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              <QrCode size={20} />
            </button>
          )}
        </div>
      </div>
    )
  },
})
