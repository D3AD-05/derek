// src/api/authApi.ts
import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

import { pinia } from '@/core/store/pinia'
import { useAuthStore } from '@/modules/auth/store'
import router from '@/router'

const API_URL = import.meta.env.VITE_API_URL
console.log('🚀 ~ API_URL:', API_URL)

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})
console.log('🚀 ~ authApi:', authApi)

/* -------------------------------------------------------------------------- */
/*                                Token utils                                 */
/* -------------------------------------------------------------------------- */

const authStore = () => useAuthStore(pinia)

const getAccessToken = (): string | null => {
  return authStore().token // ✅ correct field
}

const setAccessToken = (token: string) => {
  authStore().setToken(token) // ✅ correct action
}

const isPublicPath = (path: string): boolean => {
  if (!path) return false
  return path.startsWith('/auth') || /^\/session\/[^/]+\/(join|play|leaderboard)$/.test(path)
}

const forceLogout = async () => {
  await authStore().logout({ remote: false, markManual: false })
  const currentPath = router.currentRoute.value.path
  if (!isPublicPath(currentPath)) {
    router.replace('/auth/login')
  }
}

/* -------------------------------------------------------------------------- */
/*                          Refresh queue (critical)                           */
/* -------------------------------------------------------------------------- */

let isRefreshing = false

let failedQueue: {
  resolve: (token: string) => void
  reject: (error: any) => void
}[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  failedQueue = []
}

/* -------------------------------------------------------------------------- */
/*                          Request interceptor                                */
/* -------------------------------------------------------------------------- */

authApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization
  }

  return config
})

/* -------------------------------------------------------------------------- */
/*                         Response interceptor                                */
/* -------------------------------------------------------------------------- */

authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as RetryAxiosRequestConfig
    const currentToken = getAccessToken()
    const requestUrl = String(originalRequest?.url || '')
    const isChangePasswordRequest = /\/auth\/password\/?$/.test(requestUrl)

    // Extract backend error message for better error handling
    if (error.response?.data) {
      const backendMessage = error.response.data.message || error.response.data.detail
      if (backendMessage) {
        error.message = backendMessage
      }
    }

    // Business 401 from change-password should be handled by page-level catch/toast.
    if (error.response?.status === 401 && isChangePasswordRequest) {
      return Promise.reject(error)
    }

    // TODO : if 401 reject or refresh
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    if (!currentToken) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      await forceLogout()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(authApi(originalRequest))
          },
          reject,
        })
      })
    }

    isRefreshing = true

    try {
      const response = await axios.post(
        `${API_URL}/auth/tokens/refresh`,
        {},
        { withCredentials: true },
      )

      const refreshData = response.data
      const refreshToken = refreshData?.data?.access_token

      if (refreshData?.status === 'error' || refreshData?.code === 401 || !refreshToken) {
        throw new Error(refreshData?.message || 'Refresh failed')
      }

      const newToken = refreshToken

      setAccessToken(newToken)
      authApi.defaults.headers.common.Authorization = `Bearer ${newToken}`

      processQueue(null, newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return authApi(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      await forceLogout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default authApi
