import type { User } from '../users/types'

//^ for Question Bank
export type QBCreateResponse = {
  id: number
  name: string
  description: string
  community_id: number
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
}
export interface QuestionBank {
  id: number
  name: string
  description?: string
  communityId: number
  createdBy: number
  createdAt: Date
  updatedBy: number
  updatedAt: Date
}

export interface QBListResponse {
  count: number
  totalCount: number
  items: QuestionBank[]
}

export interface CreateQB {
  name: string
  community_id: number
  description?: string | null
}
export interface UpdateQB {
  name?: string
  community_id?: number
  description?: string | null
}

export interface QBListParams {
  page?: number
  pageSize?: number
  order_by?: string
  order_type?: 'asc' | 'desc'
}

//^
export interface AnswerTypeOut {
  id: number
  display_name: string
  code: string
}

export interface OptionsOut {
  id: number
  option_text: string
  score: number
}
export interface Option {
  option_text: string
  score: number
}

//^  Question

export type QuestionExpand = 'question_bank' | 'answer_type' | 'created_by' | 'updated_by'

export type QuestionOrderBy = 'id' | 'created_at' | 'updated_at'

export interface QuestionFilterParams {
  answer_type_id?: number
  question_bank_id?: number
  created_by?: number
  updated_by?: number
}

export interface QuestionPaginationParams {
  limit?: number
  offset?: number
}

export interface QuestionOrderParams {
  order_by?: QuestionOrderBy
  order_type?: 'asc' | 'desc'
}

export interface QuestionListParams {
  filter?: QuestionFilterParams
  pagination?: QuestionPaginationParams
  order?: QuestionOrderParams
  expand?: QuestionExpand[]
  search?: string
}

export interface Question {
  id: number
  title: string
  answer_type: number | AnswerTypeOut
  question_bank: number | QuestionBank
  is_scored: boolean
  time_limit_ms: number
  total_score: number
  options: OptionsOut[]
  created_by?: number | User
  created_at: string
  updated_by?: number | User
  updated_at: string
}

export interface QuestionListResponse {
  total_count: number
  count: number
  items: Question[]
}

export interface CreateQuestion {
  question_bank_id?: number | null
  title: string
  time_limit_ms: number
  answer_type_id: number
  options: Option[]
}
