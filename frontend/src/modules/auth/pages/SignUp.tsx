import { defineComponent, ref } from 'vue'
// import { useAuthStore } from '../store'
import router from '@/router'
import TextField from '@/core/components/inputFields/TextField/TextField'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-vue-next'

export default defineComponent(() => {
  // const auth = useAuthStore()
  const fullName = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const agreeToTerms = ref(false)

  const handleSubmit = async () => {
    if (password.value !== confirmPassword.value) {
      alert('Passwords do not match!')
      return
    }

    if (!agreeToTerms.value) {
      alert('Please agree to the terms and conditions')
      return
    }

    try {
      // TODO: Implement signup API call
      console.log('Sign up payload:', {
        fullName: fullName.value,
        email: email.value,
        password: password.value,
      })

      // After successful signup, redirect to login or dashboard
      router.push('/login')
    } catch (error) {
      console.error('Signup error:', error)
    }
  }

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
  }

  const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value
  }

  return () => (
    <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 relative overflow-hidden py-8 px-4">
      {/* Decorative background elements */}
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -left-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* SignUp Card */}
      <div class="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md backdrop-blur-sm bg-opacity-95 my-auto">
        {/* Logo */}
        <div class="flex justify-center mb-4">
          <img src="/sampleLogo.png" alt="Logo" class="h-16 sm:h-20 w-auto object-contain" />
        </div>

        {/* Header */}
        <div class="text-center mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p class="text-neutral-600 text-sm sm:text-base">Join us today and get started</p>
        </div>

        {/* SignUp Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          class="space-y-4"
        >
          {/* Full Name Field */}
          <TextField
            label="Full Name"
            placeholder="Enter your full name"
            type="text"
            modelValue={fullName.value}
            onUpdate:modelValue={(val: string) => (fullName.value = val)}
          >
            {{
              prefix: () => <User class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />,
            }}
          </TextField>

          {/* Email Field */}
          <TextField
            label="Email"
            placeholder="Enter your email"
            type="email"
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
            placeholder="Create a password"
            type={showPassword.value ? 'text' : 'password'}
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

          {/* Confirm Password Field */}
          <TextField
            label="Confirm Password"
            placeholder="Confirm your password"
            type={showConfirmPassword.value ? 'text' : 'password'}
            modelValue={confirmPassword.value}
            onUpdate:modelValue={(val: string) => (confirmPassword.value = val)}
          >
            {{
              prefix: () => <Lock class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />,
              suffix: () => (
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword.value ? <EyeOff class="h-5 w-5" /> : <Eye class="h-5 w-5" />}
                </button>
              ),
            }}
          </TextField>

          {/* Terms & Conditions */}
          <div class="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms.value}
              onChange={(e) => (agreeToTerms.value = (e.target as HTMLInputElement).checked)}
              class="w-4 h-4 mt-1 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 cursor-pointer"
            />
            <label for="terms" class="ml-2 text-sm text-neutral-600 cursor-pointer">
              I agree to the{' '}
              <a
                href="#"
                class="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a
                href="#"
                class="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* SignUp Button */}
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform transition-all duration-200 hover:scale-[1.02] shadow-lg mt-6"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <div class="mt-6 text-center">
          <p class="text-sm text-neutral-600">
            Already have an account?{' '}
            <a
              href="/auth/login"
              class="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
})
