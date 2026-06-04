export interface Community {
  id: number
  name: string
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string // Use string, or a branded type if you have EmailStr
  is_platform_admin: boolean
  user_status_id: number | UserStatusOut
  password_updated_at?: string // ISO date string or Date if you prefer
  created_by?: number | User
  created_at: string // ISO date string or Date
  updated_by?: number | User
  updated_at: string // ISO date string or Date
  communities?: Community[] | null
}

export interface UserStatusOut {
  id: number
  status: string
  display_name: string
}

export interface PaginatedUsers {
  total_count: number
  count: number
  items: User[]
}
