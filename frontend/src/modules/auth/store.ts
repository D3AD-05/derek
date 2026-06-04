import { defineStore } from 'pinia'
import type { LoginPayload } from './types'
import { loginApi } from './services'
import type { User } from '../users/types'
import { api } from '@/core/api'
import { getMe } from '@/modules/users/services'
// import router from '@/router'

const MANUAL_LOGOUT_KEY = 'auth:manual-logout'

const setManualLogout = () => {
  try {
    window.localStorage.setItem(MANUAL_LOGOUT_KEY, '1')
  } catch {
    // ignore
  }
}

const clearManualLogout = () => {
  try {
    window.localStorage.removeItem(MANUAL_LOGOUT_KEY)
  } catch {
    // ignore
  }
}

const hasManualLogout = () => {
  try {
    return window.localStorage.getItem(MANUAL_LOGOUT_KEY) === '1'
  } catch {
    return false
  }
}

const clearClientSideAuthData = () => {
  try {
    const keys = ['access_token', 'refresh_token', 'token', 'auth', 'auth_token']
    keys.forEach((key) => {
      window.localStorage.removeItem(key)
      window.sessionStorage.removeItem(key)
    })
  } catch {
    // ignore
  }

  try {
    const cookies = document.cookie ? document.cookie.split(';') : []
    for (const c of cookies) {
      const cookieName = c.split('=')[0]?.trim()
      if (!cookieName) continue
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  } catch {
    // ignore
  }
}

const isRefreshAuthFailure = (responseData: any) => {
  return responseData?.status === 'error' || responseData?.code === 401
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async login(payload: LoginPayload) {
      this.loading = true
      this.error = null

      try {
        const res = await loginApi(payload)

        // store token after login
        this.token = res.data.access_token
        clearManualLogout()

        // fetch current user and store it
        try {
          const meRes = await getMe()
          this.user = meRes.data
        } catch (e) {
          console.log('❌', e)

          this.user = null
        }

        // warm up session status cache after login
        try {
          // Session statuses are now fetched in constants store on app init
        } catch (e) {
          console.log('❌', e)
        }

        return res
      } catch (error: any) {
        this.error = error?.response?.data?.detail || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    setToken(token: string) {
      this.token = token
    },

    setUser(user: User | null) {
      this.user = user
    },

    async logout(options?: { remote?: boolean; markManual?: boolean }) {
      // const shouldCallRemote = options?.remote !== false
      const shouldMarkManual = options?.markManual !== false

      this.token = null
      this.user = null
      this.error = null
      this.loading = false
      clearClientSideAuthData()

      if (shouldMarkManual) {
        setManualLogout()
      }
      // router.replace('/auth/login')
    },
    async bootstrap(): Promise<boolean> {
      if (hasManualLogout()) {
        await this.logout({ remote: false, markManual: false })
        return false
      }

      try {
        const { data } = await api.post(
          '/auth/tokens/refresh',
          {},
          {
            withCredentials: true,
          },
        )

        if (isRefreshAuthFailure(data) || !data?.data?.access_token) {
          await this.logout({ remote: false, markManual: false })
          return false
        }

        this.token = data.data.access_token
        clearManualLogout()
        // fetch current user after refresh
        try {
          const meRes = await getMe()
          this.user = meRes.data
        } catch {
          this.user = null
        }

        // warm up session status cache after refresh
        try {
          // Session statuses are now fetched in constants store on app init
        } catch {
          // ignore
        }
        return true
      } catch {
        await this.logout({ remote: false, markManual: false })
        return false
      }
    },
  },
})
