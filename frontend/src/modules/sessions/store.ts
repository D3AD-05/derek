// ! Composition API trial

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  SessionListApi,
  SessionQuestionListApi,
  SessionStatusCountsApi,
} from './service'
import type {
  SessionOut,
  SessionListParams,
  SessionListResponse,
  SessionFilterParams,
  SessionPaginationParams,
  SessionOrderParams,
  SessionExpand,
  SessionQuestionOut,
  SessionQuestionListParams,
  SessionQuestionListResponse,
  SessionStatusCount,
} from './types'
import type { ApiResponse } from '@/core/types/api.types'
export const useSessionStore = defineStore('session', () => {
  const { sessionStatuses } = storeToRefs(useConstantsStore())
  // State
  const sessions = ref<SessionOut[]>([])
  const totalCount = ref(0)
  const count = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Status counts for tabs
  const statusCounts = ref<SessionStatusCount>({
    all: 0,
    ongoing: 0,
    upcoming: 0,
    completed: 0,
  })
  const statusCountsLoading = ref(false)
  const statusCountsError = ref<string | null>(null)

  // Current params
  const currentParams = ref<SessionListParams>({
    filter: {},
    pagination: { limit: 10, offset: 0 },
    order: {},
    expand: [],
  })

  // SessionQuestion state
  const sessionQuestions = ref<SessionQuestionOut[]>([])
  const sessionQuestionsTotalCount = ref(0)
  const sessionQuestionsCount = ref(0)
  const sessionQuestionsLoading = ref(false)
  const sessionQuestionsError = ref<string | null>(null)

  // Getters
  const sessionList = computed(() => sessions.value)
  const total = computed(() => totalCount.value)
  const itemCount = computed(() => count.value)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value)
  const sessionStatusList = computed(() => sessionStatuses.value)

  // Actions
  async function ListSessions(params?: SessionListParams) {
    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<SessionListResponse> = await SessionListApi(
        params || currentParams.value,
      )

      if (response.status == 'success' && response.data) {
        sessions.value = response.data.items
        totalCount.value = response.data.total_count
        count.value = response.data.count
        if (params) {
          currentParams.value = params
        }
      } else {
        error.value = response.message || 'Failed to fetch sessions'
      }

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchStatusCounts() {
    statusCountsLoading.value = true
    statusCountsError.value = null
    try {
      const response = await SessionStatusCountsApi()

      if (response.status === 'success' && response.data) {
        statusCounts.value = response.data
      } else {
        statusCountsError.value = response.message || 'Failed to fetch status counts'
      }
    } catch (err) {
      statusCountsError.value = err instanceof Error ? err.message : 'Failed to fetch status counts'
    } finally {
      statusCountsLoading.value = false
    }
  }

  function updateFilter(filter: Partial<SessionFilterParams>) {
    currentParams.value.filter = {
      ...currentParams.value.filter,
      ...filter,
    }
  }

  function updatePagination(pagination: Partial<SessionPaginationParams>) {
    currentParams.value.pagination = {
      ...currentParams.value.pagination,
      ...pagination,
    }
  }

  function updateOrder(order: Partial<SessionOrderParams>) {
    currentParams.value.order = {
      ...currentParams.value.order,
      ...order,
    }
  }

  function updateExpand(expand: SessionExpand[]) {
    currentParams.value.expand = expand
  }

  function resetParams() {
    currentParams.value = {
      filter: {},
      pagination: { limit: 10, offset: 0 },
      order: {},
      expand: [],
    }
  }

  function clearError() {
    error.value = null
  }

  // SessionQuestion Actions
  async function ListSessionQuestions(params?: SessionQuestionListParams) {
    sessionQuestionsLoading.value = true
    sessionQuestionsError.value = null

    try {
      const response: ApiResponse<SessionQuestionListResponse> =
        await SessionQuestionListApi(params)

      if (response.status == 'success' && response.data) {
        sessionQuestions.value = response.data.items
        sessionQuestionsTotalCount.value = response.data.total_count
        sessionQuestionsCount.value = response.data.count
      } else {
        sessionQuestionsError.value = response.message || 'Failed to fetch session questions'
      }

      return response
    } catch (err) {
      sessionQuestionsError.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      sessionQuestionsLoading.value = false
    }
  }

  function clearSessionQuestionsError() {
    sessionQuestionsError.value = null
  }

  return {
    // State
    sessions,
    totalCount,
    count,
    loading,
    error,
    currentParams,
    statusCounts,
    statusCountsLoading,
    statusCountsError,
    // SessionQuestion State
    sessionQuestions,
    sessionQuestionsTotalCount,
    sessionQuestionsCount,
    sessionQuestionsLoading,
    sessionQuestionsError,
    // Getters
    sessionList,
    total,
    itemCount,
    isLoading,
    hasError,
    // Actions
    ListSessions,
    fetchStatusCounts,
    updateFilter,
    updatePagination,
    updateOrder,
    updateExpand,
    resetParams,
    clearError,
    // SessionQuestion Actions
    ListSessionQuestions,
    clearSessionQuestionsError,
    sessionStatusList,
  }
})
