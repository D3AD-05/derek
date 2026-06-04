import { defineComponent, ref } from 'vue'
import { useAuthStore } from '../store'
import router from '@/router'
import TextField from '@/core/components/inputFields/TextField/TextField'
import { Eye, EyeOff, Mail, Lock } from 'lucide-vue-next'
import { forgotPasswordApi } from '../services'

export default defineComponent(() => {
  const auth = useAuthStore()
  const toast = useToast()
  const email = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const forgotLoading = ref(false)

  const handleSubmit = async () => {
    try {
      await auth.login({
        username: email.value,
        password: password.value,
      })

      router.push('/')
    } catch (error: any) {
      const message = error?.response?.data?.message
        ? error.response.data.message
        : 'Failed to login'

      toast.error(message)
      console.error(message)
    }
  }

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
  }

  const handleForgotPassword = async () => {
    if (!email.value) {
      toast.error('Please enter your email first')
      return
    }

    forgotLoading.value = true
    try {
      await forgotPasswordApi({ email: email.value })
      toast.success('Password reset link sent to your email')
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        'Failed to send reset link'
      toast.error(message)
    } finally {
      forgotLoading.value = false
    }
  }

  return () => (
    <div class="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-primary-50 via-secondary-50 to-primary-100 relative overflow-hidden py-8 px-4">
      {/* Decorative background elements */}
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -left-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div class="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md backdrop-blur-sm bg-opacity-95 my-auto">
        {/* Logo */}
        <div class="flex justify-center mb-4">
          <img src="/sampleLogo.png" alt="Logo" class="h-16 sm:h-20 w-auto object-contain" />
        </div>

        {/* Header */}
        <div class="text-center mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p class="text-neutral-600 text-sm sm:text-base">Please sign in to your account</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          class="space-y-5"
        >
          {/* Email Field */}
          <TextField
            label="Email"
            placeholder="Enter your email"
            type="email"
            required
            modelValue={email.value}
            onUpdate:modelValue={(val: string) => (email.value = val)}
          >
            {{
              prefix: () => <Mail class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />,
            }}
          </TextField>

          {/* Password Field */}
          <TextField
            label="Password"
            placeholder="Enter your password"
            type={showPassword.value ? 'text' : 'password'}
            required
            modelValue={password.value}
            onUpdate:modelValue={(val: string) => (password.value = val)}
          >
            {{
              prefix: () => <Lock class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />,
              suffix: () => (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword.value ? <EyeOff class="h-5 w-5" /> : <Eye class="h-5 w-5" />}
                </button>
              ),
            }}
          </TextField>

          {/* Remember Me & Forgot Password */}
          <div class="flex items-center justify-between">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotLoading.value}
              class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              {forgotLoading.value ? 'Sending...' : 'Forgot password?'}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            class="w-full bg-linear-to-r from-primary-600 to-secondary-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            Sign In
          </button>
        </form>

        {/* Sign Up Link */}
        {/* <div class="mt-6 text-center">
          <p class="text-sm text-neutral-600">
            Don't have an account?{' '}
            <a
              href="/auth/signup"
              class="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Sign up
            </a>
          </p>
        </div> */}
      </div>
    </div>
  )
})
