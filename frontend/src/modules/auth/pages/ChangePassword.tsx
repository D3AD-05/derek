import { computed, defineComponent, ref } from 'vue'
import Button from '@/core/components/button/Button'
import PageHeader from '@/core/components/header/PageHeader'
import { changePasswordApi } from '../services'
import { useAuthStore } from '../store'
import router from '@/router'
import { Eye, EyeClosed } from 'lucide-vue-next'

export default defineComponent({
  name: 'ResetPassword',

  setup() {
    const toast = useToast()
    const auth = useAuthStore()
    const currentPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')

    const showCurrentPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

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
    const isPasswordMatched = computed(
      () =>
        newPassword.value.trim().length > 0 &&
        confirmPassword.value.trim().length > 0 &&
        newPassword.value === confirmPassword.value,
    )

    const message = ref('')
    const error = ref('')
    const loading = ref(false)

    const handleReset = async () => {
      error.value = ''
      message.value = ''

      if (!isPasswordValid.value) {
        error.value =
          'Password must be at least 6 characters and include letters, numbers, and a special character.'
        return
      }

      if (newPassword.value !== confirmPassword.value) {
        error.value = 'New passwords do not match'
        return
      }
      if (currentPassword.value == newPassword.value) {
        error.value = "Nice try 😄 New password can't be the same as the old one."
        return
      }

      loading.value = true

      try {
        await changePasswordApi({
          current_password: currentPassword.value,
          new_password: newPassword.value,
        })

        message.value = 'Password updated successfully ✅'

        toast.success(
          'Password updated successfully. You will now be redirected to the login page.',
        )

        // reset fields
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''

        setTimeout(async () => {
          await auth.logout()
          router.push('/auth/login')
        }, 2000)
      } catch (e: any) {
        error.value =
          e?.message ||
          e?.response?.data?.message ||
          e?.response?.data?.detail ||
          'Failed to update password'

        toast.error(error.value)
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div class="p-8 max-w-7xl mx-auto">
        <PageHeader title="Reset Password" description="Update to new password" />
        <div class="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 class="text-2xl font-bold mb-2 text-center">Reset Password</h2>
            <p class="text-gray-600 mb-6 text-center">
              Enter your current password and choose a new one.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleReset()
              }}
              class="flex flex-col gap-4"
            >
              {/* Current Password */}
              <div>
                {/* <label class="text-xs font-semibold text-gray-700 mb-2 block">
                  CURRENT PASSWORD
                </label> */}
                <div class="relative">
                  <input
                    type={showCurrentPassword.value ? 'text' : 'password'}
                    required
                    placeholder="Enter current password"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    v-model={currentPassword.value}
                  />
                  <button
                    type="button"
                    onClick={() => (showCurrentPassword.value = !showCurrentPassword.value)}
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword.value ? <EyeClosed /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                {/* <label class="text-xs font-semibold text-gray-700 mb-2 block">NEW PASSWORD</label> */}
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
              <div class="grid grid-cols-2 gap-3 text-xs text-gray-600">
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

              {/* Confirm Password */}
              <div>
                {/* <label class="text-xs font-semibold text-gray-700 mb-2 block">
                  CONFIRM PASSWORD
                </label> */}
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
                disabled={!isPasswordMatched.value}
              >
                Update Password
              </Button>
            </form>

            {/* Error */}
            {error.value && <div class="mt-4 text-red-500 text-center text-sm">{error.value}</div>}

            {/* Success */}
            {message.value && (
              <div class="mt-4 text-green-600 text-center text-sm">{message.value}</div>
            )}
          </div>
        </div>
      </div>
    )
  },
})
