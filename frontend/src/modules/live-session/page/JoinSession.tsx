import { defineComponent, onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Card from '@/core/components/card/Card'
import PageHeader from '@/core/components/header/PageHeader'
import Button from '@/core/components/button/Button'
import TextField from '@/core/components/inputFields/TextField/TextField'
import { useToast } from '@/core/composables/useToast'
import { useLiveSessionStore } from '../store'

export default defineComponent({
  name: 'JoinSession',
  setup() {
    const route = useRoute()
    const toast = useToast()
    const liveSessionStore = useLiveSessionStore()

    const sessionId = computed(() => Number(route.params.id))

    const name = ref(String(liveSessionStore.participant?.name ?? ''))
    const email = ref(String(liveSessionStore.participant?.email ?? ''))

    const nameError = ref<string | null>(null)
    const emailError = ref<string | null>(null)

    const validate = () => {
      nameError.value = null
      emailError.value = null

      const n = String(name.value || '').trim()
      const e = String(email.value || '').trim()

      if (!n) nameError.value = 'Name is required'
      if (!e) emailError.value = 'Email is required'
      else if (!/^\S+@\S+\.\S+$/.test(e)) emailError.value = 'Enter a valid email'

      return !nameError.value && !emailError.value
    }

    const load = async () => {
      if (!sessionId.value) {
        toast.warning('No session id found')
        return
      }
      try {
        await liveSessionStore.fetchSessionDetails(sessionId.value)
      } catch {
        toast.error(liveSessionStore.error || 'Failed to load session')
      }
    }

    const join = async () => {
      if (!sessionId.value) return
      if (!validate()) return

      try {
        const res = await liveSessionStore.joinSession(sessionId.value, {
          name: String(name.value).trim(),
          email: String(email.value).trim(),
        })

        if (res.status === 'success') {
          toast.success('Joined live session successfully')
        } else {
          toast.error(res.message || 'Failed to join')
        }
      } catch {
        toast.error(liveSessionStore.error || 'Failed to join')
      }
    }

    onMounted(load)

    return () => (
      <div class="w-full max-w-2xl">
        <PageHeader title="Join Session" description="Enter your name and email to join" />

        <Card className="mt-6">
          <div class="flex flex-col gap-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex flex-col">
                <div class="text-sm text-gray-600">Session</div>
                <div class="text-lg font-semibold">{liveSessionStore.sessionName}</div>
              </div>
              {liveSessionStore.loading && <div class="text-sm text-gray-500">Loading…</div>}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Name"
                placeholder="Your name"
                modelValue={name.value}
                error={nameError.value ?? undefined}
                onUpdate:modelValue={(v: string) => (name.value = v)}
              />
              <TextField
                label="Email"
                placeholder="you@example.com"
                type="email"
                modelValue={email.value}
                error={emailError.value ?? undefined}
                onUpdate:modelValue={(v: string) => (email.value = v)}
              />
            </div>

            <div class="flex justify-end">
              <Button variant="primary" loading={liveSessionStore.loading} onClick={join}>
                Join
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  },
})
