import { defineStore } from 'pinia'
import { ListQuestionsApi, QBListApi, RetrievQuestionAPI } from './service'
import type {
  QBListResponse,
  QBListParams,
  QuestionListParams,
  QuestionListResponse,
  Question,
} from './types'

export const useQuestionStore = defineStore('question', {
  state: () => ({
    question: null as null | Question,
    questionById: {} as Record<number, Question>,
    questions: null as null | QuestionListResponse,
    questionBanks: null as null | QBListResponse,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async QBList(params?: QBListParams) {
      this.loading = true
      this.error = null

      try {
        const response = await QBListApi({
          order_by: 'updated_at',
          order_type: 'desc',
          ...params,
        })

        //& Store data
        this.questionBanks = response.data

        //^ Return full response or just data based on need
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.detail || 'Listing Failed'
        throw error
      } finally {
        this.loading = false
      }
    },
    async QuestionList(params?: QuestionListParams) {
      this.loading = true
      this.error = null

      try {
        const response = await ListQuestionsApi({
          ...params,
        })

        //& Store data
        this.questions = response.data

        //^ Return full response or just data based on need
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.detail || '!Question Listing Failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async GetQuestion(id: number, options?: { force?: boolean }) {
      const cached = this.questionById[id]
      if (cached && !options?.force) {
        this.question = cached
        return cached
      }

      this.loading = true
      this.error = null
      try {
        const response = await RetrievQuestionAPI(id)
        this.question = response.data
        this.questionById[id] = response.data
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.detail || '!Failed to Fetch Question...'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
