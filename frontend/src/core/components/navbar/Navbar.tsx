import { computed, defineComponent, watch, ref } from 'vue'
import { Menu, ListCollapse } from 'lucide-vue-next'
import { useAuthStore } from '@/modules/auth/store'
import { useCommunityStore } from '@/core/store/community'
import router from '@/router'

export default defineComponent({
  name: 'NavbarPage',
  props: {
    isCollapsed: Boolean,
    onToggle: Function,
  },

  setup(props) {
    const auth = useAuthStore()
    const communityStore = useCommunityStore()

    const user = computed(() => auth.user)
    const onLogout = async () => {
      showProfile.value = false
      await auth.logout()
      router.push('/auth/login')
    }

    const displayName = computed(() => {
      const u = user.value
      return u ? u.name || u.email || 'User' : 'User'
    })

    const initial = computed(() => {
      const name = displayName.value
      return name ? name.charAt(0).toUpperCase() : 'U'
    })

    const communities = computed(() => user.value?.communities ?? [])
    const selectedCommunityId = computed({
      get: () => communityStore.selectedCommunityId,
      set: (val: number | null) => communityStore.setCommunityId(val),
    })

    const handleCommunityChange = (e: Event) => {
      const target = e.target as HTMLSelectElement | null
      const rawValue = target?.value
      const next = rawValue != null ? Number(rawValue) : NaN
      selectedCommunityId.value = Number.isFinite(next) ? next : null
    }
    const isAdminPage = window.location.hash.includes('/admin')

    watch(
      communities,
      (list) => {
        const ids = (list ?? []).map((c) => c.id)
        communityStore.ensureValidSelection(ids)
      },
      { immediate: true },
    )

    const showProfile = ref(false)
    const onResetPassword = () => {
      showProfile.value = false
      router.push('/change-password')
    }

    const onAdminSwitch = () => {
      showProfile.value = false

      if (isAdminPage) {
        router.push('/')
      } else {
        router.push('/admin/communities')
      }
    }
    // Handle outside click to close profile dropdown
    if (typeof window !== 'undefined') {
      watch(showProfile, (open) => {
        if (!open) return
        const handler = (e: MouseEvent) => {
          const dropdown = document.getElementById('profile-dropdown-box')
          if (dropdown && !dropdown.contains(e.target as Node)) {
            showProfile.value = false
            window.removeEventListener('mousedown', handler)
          }
        }
        window.addEventListener('mousedown', handler)
      })
    }

    return () => (
      <header class="fixed top-0 left-0 right-0 h-16 bg-linear-to-r from-secondary-100 to-secondary-200 border-b border-secondary-300 flex items-center justify-between px-6 z-50 shadow-md">
        {/* Left: Toggle + Logo + App Name */}
        <div class="flex items-center gap-4">
          <button
            class="text-secondary-700 hover:bg-secondary-300 p-2 rounded-lg transition-colors"
            onClick={() => props.onToggle?.()}
          >
            {props.isCollapsed ? <Menu size={20} /> : <ListCollapse size={20} />}
          </button>
          <img src="/sampleLogo.png" alt="Logo" class="h-20" />
          <span class="text-lg font-semibold text-primary-800">Derek</span>
          {communities.value.length > 0 ? (
            <select
              class="h-9 rounded-lg border border-secondary-300 bg-secondary-100 px-3 text-sm text-secondary-800 focus:outline-none focus:ring-2 focus:ring-secondary-300"
              value={selectedCommunityId.value ?? undefined}
              onChange={handleCommunityChange}
            >
              {communities.value.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <span class="text-sm text-secondary-700">No communities</span>
          )}
        </div>

        {/* Right: Profile + Logout */}
        <div class="flex items-center gap-4 relative">
          {/* Profile Dropdown Trigger */}
          <div
            class="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => (showProfile.value = !showProfile.value)}
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initial.value}
            </div>
            <span class="text-sm font-medium text-secondary-800">{displayName.value}</span>
          </div>

          {/* Dropdown Card */}
          {showProfile.value && (
            <div
              id="profile-dropdown-box"
              class="absolute right-0 top-12 min-w-56 z-50 rounded-2xl bg-white border border-gray-100 shadow-lg py-5 px-5 flex flex-col items-center animate-fade-in"
            >
              {/* Avatar */}
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white mb-3">
                {initial.value}
              </div>

              {/* Name */}
              <div class="text-sm font-semibold text-gray-900 mb-4">{displayName.value}</div>

              {/* Buttons */}
              <div class="w-full flex flex-col gap-2">
                {user.value?.is_platform_admin ? (
                  <button
                    class="w-full text-sm border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                    onClick={onAdminSwitch}
                  >
                    {isAdminPage ? 'Dashboard' : 'Admin Panel'}
                  </button>
                ) : null}

                <button
                  class="w-full text-sm border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                  onClick={onResetPassword}
                >
                  Reset Password
                </button>

                <button
                  class="w-full text-sm text-red-600 px-4 py-2.5 rounded-lg font-medium hover:bg-red-50 transition"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    )
  },
})
