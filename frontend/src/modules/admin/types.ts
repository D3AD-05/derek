export type EntityId = string

export type UserStatus = 'Active' | 'Inactive' | 'Suspended'

export interface UserStatusDetail {
  id: EntityId
  code: string
  display_name: string
}

export interface User {
  id: EntityId
  name: string
  email: string
  isPlatformAdmin: boolean
  status: UserStatus
  communityIds: EntityId[]
  communities?: Community[]
  user_status?: UserStatusDetail
}

export interface CommunityUser {
  id: EntityId
  name: string
  email: string
  is_platform_admin: boolean
}

export interface Community {
  id: EntityId
  name: string
  created_by?: number
  created_at?: string
  updated_by?: number
  updated_at?: string
  users?: CommunityUser[]
}

export type UserCreateInput = Omit<User, 'id'>
export type UserUpdateInput = Pick<User, 'id'> & Partial<Omit<User, 'id'>>

// User Pageination

export interface UserFilterParams {
  user_id?: number
  is_platform_admin?: boolean
  status?: string
}

export enum OrderType {
  Asc = 'asc',
  Desc = 'desc',
}

export enum UserOrderBy {
  Id = 'id',
  Name = 'name',
  CreatedAt = 'created_at',
  UpdatedAt = 'updated_at',
}

export interface UserOrderParams {
  order_by?: UserOrderBy
  order_type?: OrderType
}

export interface UserPaginationParams {
  limit?: number
  offset?: number
}

export enum UserExpand {
  communities = 'communities',
  user_status = 'user_status',
}
export interface UserListParams {
  filter?: UserFilterParams
  pagination?: UserPaginationParams
  search?: string
  order?: UserOrderParams
  expand?: UserExpand[]
}

export interface UserList {
  items: User[]
  total_count: number
  count: number
}

//! COMUNITY

export type CommunityCreateInput = {
  name: string
  user_ids?: number[]
}

export type CommunityUpdateInput = Pick<Community, 'id'> & {
  name?: string
  user_ids?: number[]
}

export enum CommunityExpand {
  users = 'users',
}

export enum CommunityOrderBy {
  Id = 'id',
  Name = 'name',
  CreatedAt = 'created_at',
  UpdatedAt = 'updated_at',
}

export interface CommunityOrderParams {
  order_by?: CommunityOrderBy
  order_type?: OrderType
}

export interface CommunityFilterParams {
  community_id?: number
}

export interface CommunityPaginationParams {
  limit?: number
  offset?: number
}

export interface CommunityListParams {
  filter?: CommunityFilterParams
  pagination?: CommunityPaginationParams
  search?: string
  order?: CommunityOrderParams
}

export interface CommunityList {
  items: Community[]
  total_count: number
  count: number
}

export type EntityType = 'user' | 'community'
export type EntityFormMode = 'add' | 'edit'
