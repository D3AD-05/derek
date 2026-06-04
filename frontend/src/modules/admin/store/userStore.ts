import { defineStore } from 'pinia'
import type { User, UserList, UserListParams, UserExpand } from '../types'
import { ListUserApi, RetrieveUserApi,} from '../services/userService'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as null | User,
    userList: null as null | UserList,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchUserList(params?: UserListParams) {
      this.loading = true
      this.error = null

      try {
        const response = await ListUserApi(params)
        this.userList = response.data
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.detail || 'Listing Failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUser(userId: number, expand?: UserExpand[]) {
      this.loading = true
      this.error = null

      try {
        const response = await RetrieveUserApi(userId, { expand })
        this.user = response.data
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.detail || 'Fetching user failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    // async createUser(data: UserCreateInput) {
    //   this.loading = true
    //   this.error = null

    //   try {
    //     const response = await CreateUserApi(data, { return_data: true })
    //     if (this.userList && response.data) {
    //       this.userList.items.push(response.data)
    //       this.userList.count += 1
    //       this.userList.total_count += 1
    //     }
    //     return response.data
    //   } catch (error: any) {
    //     this.error = error?.response?.data?.detail || 'Creating user failed'
    //     throw error
    //   } finally {
    //     this.loading = false
    //   }
    // },

    // async updateUser(id: string, data: Partial<Omit<UserUpdateInput, 'id'>>) {
    //   this.loading = true
    //   this.error = null

    //   try {
    //     const response = await UpdateUserAPI(id, data as UserCreateInput, { return_data: true })
    //     if (response.data && this.userList) {
    //       const index = this.userList.items.findIndex(u => u.id === id)
    //       if (index !== -1) {
    //         this.userList.items[index] = response.data
    //       }
    //     }
    //     return response.data
    //   } catch (error: any) {
    //     this.error = error?.response?.data?.detail || 'Updating user failed'
    //     throw error
    //   } finally {
    //     this.loading = false
    //   }
    // },

    // async deleteUser(id: string | number) {
    //   this.loading = true
    //   this.error = null

    //   try {
    //     await DeleteUserApi(typeof id === 'string' ? parseInt(id) : id)
    //     if (this.userList) {
    //       this.userList.items = this.userList.items.filter(u => u.id !== id)
    //       this.userList.count -= 1
    //       this.userList.total_count -= 1
    //     }
    //   } catch (error: any) {
    //     this.error = error?.response?.data?.detail || 'Deleting user failed'
    //     throw error
    //   } finally {
    //     this.loading = false
    //   }
    // },
  },
})
