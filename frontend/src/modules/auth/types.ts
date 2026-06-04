export interface LoginPayload {
  username: string
  password: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export interface ResetPasswordPayload {
  token: string
  new_password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface AuthUser {
  id: number
  email: string
}
