import { defineStore } from 'pinia'
import type { Community, CommunityExpand, CommunityList, CommunityListParams } from '../types'
import { ListCommunityApi, RetrieveCommunityApi } from '../services/communityService'

export const useCommunityStore = defineStore('communities', {
  state: () => ({
    community: null as null | Community,
    communityList: null as null | CommunityList,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCommunityList(params?: CommunityListParams) {
      this.loading = true
      this.error = null

      try {
        const response = await ListCommunityApi(params)
        this.communityList = response.data
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.detail || 'Listing Failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCommunity(communityId: number ,expand?: CommunityExpand[]) {
      this.loading = true
      this.error = null

      try {
        const response = await RetrieveCommunityApi(communityId,{expand})
        this.community = response.data
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.detail || 'Fetching community failed'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
