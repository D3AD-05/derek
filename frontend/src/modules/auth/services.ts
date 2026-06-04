// src/modules/auth/services.ts
import { api } from '@/core/api'
import authApi from '@/core/api/authApi'

import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
} from './types'

export async function loginApi(payload: LoginPayload) {
  const form = new URLSearchParams()
  form.append('username', payload.username)
  form.append('password', payload.password)

  const { data } = await api.post('/auth/tokens', form, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  return data
}

export async function logoutApi() {
  const logoutPath = String(import.meta.env.VITE_AUTH_LOGOUT_PATH || '/auth/logout').trim()
  await api.post(logoutPath, {}, { withCredentials: true })
}

export async function changePasswordApi(payload: ChangePasswordPayload) {
  try {
    const { data } = await authApi.patch('/auth/password', payload)
    return data
  } catch (e: any) {
    const message =
      e?.response?.data?.message ||
      e?.response?.data?.detail ||
      e?.message ||
      'Failed to update password'
    throw new Error(message)
  }
}

export async function resetPasswordApi(payload: ResetPasswordPayload) {
  const { data } = await api.post('/auth/password/reset_password', null, {
    params: {
      token: payload.token,
      new_password: payload.new_password,
    },
  })
  return data
}

export async function forgotPasswordApi(payload: ForgotPasswordPayload) {
  const { data } = await api.post('/auth/password/forgot-password', null, {
    params: {
      email: payload.email,
    },
  })
  return data
}
