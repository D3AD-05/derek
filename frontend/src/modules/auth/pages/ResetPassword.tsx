import { defineComponent, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/core/components/button/Button'
import { usePreventRefresh } from '@/core/composables/usePreventRefresh'
import { resetPasswordApi } from '../services'
import { Eye, EyeClosed } from 'lucide-vue-next'

export default defineComponent({
  name: 'ResetPassword',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const newPassword = ref('')
    const confirmPassword = ref('')
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)
    const error = ref('')
    const message = ref('')
    const loading = ref(false)

    const token = String(route.query.token || '').trim()

    // Password validation rules
    const hasMinLength = computed(() => newPassword.value.length >= 6)
    const hasNumber = computed(() => /\d/.test(newPassword.value))
    const hasLetter = computed(() => /[a-zA-Z]/.test(newPassword.value))
    const hasSpecialChar = computed(() =>
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword.value),
    )

    const isPasswordValid = computed(
      () => hasMinLength.value && hasNumber.value && hasLetter.value && hasSpecialChar.value,
    )

    usePreventRefresh(
      () =>
        !message.value &&
        !loading.value &&
        (newPassword.value.trim().length > 0 || confirmPassword.value.trim().length > 0),
    )

    const handleSubmit = async () => {
      error.value = ''
      message.value = ''

      if (!token) {
        error.value = 'Reset token is missing'
        return
      }

      if (newPassword.value !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        return
      }

      if (!isPasswordValid.value) {
        error.value = 'Password does not meet all requirements'
        return
      }

      loading.value = true
      try {
        await resetPasswordApi({
          token,
          new_password: newPassword.value,
        })

        message.value = 'Password reset successful. Redirecting to login...'
        setTimeout(() => {
          router.push('/auth/login')
        }, 1200)
      } catch (e: any) {
        error.value =
          e?.response?.data?.message || e?.response?.data?.detail || 'Failed to reset password'
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div class="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-primary-50 via-secondary-50 to-primary-100 px-4 py-8">
        <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div class="flex justify-center mb-6">
            <div class="bg-black rounded-lg p-3">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </div>
          </div>

          <h1 class="text-2xl font-bold text-center mb-2">New password.</h1>
          <p class="text-gray-500 text-center mb-6 text-sm">
            Choose something strong and memorable.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            class="flex flex-col gap-4"
          >
            <div>
              <label class="text-xs font-semibold text-gray-700 mb-2 block">NEW PASSWORD</label>
              <div class="relative">
                <input
                  type={showNewPassword.value ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  v-model={newPassword.value}
                />
                <button
                  type="button"
                  onClick={() => (showNewPassword.value = !showNewPassword.value)}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword.value ? <EyeClosed /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div class="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-2">
              <div class="flex items-center gap-2">
                <span
                  class={`w-2 h-2 rounded-full ${hasMinLength.value ? 'bg-green-500' : 'bg-gray-300'}`}
                ></span>
                <span>6+ characters</span>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class={`w-2 h-2 rounded-full ${hasNumber.value ? 'bg-green-500' : 'bg-gray-300'}`}
                ></span>
                <span>Number</span>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class={`w-2 h-2 rounded-full ${hasLetter.value ? 'bg-green-500' : 'bg-gray-300'}`}
                ></span>
                <span>Letter</span>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class={`w-2 h-2 rounded-full ${hasSpecialChar.value ? 'bg-green-500' : 'bg-gray-300'}`}
                ></span>
                <span>Special character</span>
              </div>
            </div>

            <div>
              <label class="text-xs font-semibold text-gray-700 mb-2 block">CONFIRM PASSWORD</label>
              <div class="relative">
                <input
                  type={showConfirmPassword.value ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  v-model={confirmPassword.value}
                />
                <button
                  type="button"
                  onClick={() => (showConfirmPassword.value = !showConfirmPassword.value)}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword.value ? <EyeClosed /> : <Eye />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading.value}
              disabled={!isPasswordValid.value || confirmPassword.value === ''}
            >
              Reset Password
            </Button>
          </form>

          {error.value && <div class="mt-4 text-red-500 text-center text-sm">{error.value}</div>}
          {message.value && (
            <div class="mt-4 text-green-600 text-center text-sm">{message.value}</div>
          )}
        </div>
      </div>
    )
  },
})
