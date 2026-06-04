export enum SessionExpand {
  SessionStatus = 'session_status',
  Community = 'community',
  SessionQuestion = 'session_question',
  CreatedBy = 'created_by',
  UpdatedBy = 'updated_by',
}

export enum SessionOrderBy {
  Id = 'id',
  Name = 'name',
  CreatedAt = 'created_at',
  UpdatedAt = 'updated_at',
}

export enum OrderType {
  Asc = 'asc',
  Desc = 'desc',
}

export interface SessionPaginationParams {
  limit?: number
  offset?: number
}

export interface SessionOrderParams {
  order_by?: SessionOrderBy
  order_type?: OrderType
}

export interface SessionFilterParams {
  session_id?: number
  session_status_id?: number
  community_id?: number
  created_by?: number
  updated_by?: number
}

export interface SessionListParams {
  filter?: SessionFilterParams
  pagination?: SessionPaginationParams
  search?: string
  order?: SessionOrderParams
  expand?: SessionExpand[]
}

export interface SessionStatusOut {
  id: number
  display_name: string
  code: string
}

export interface User {
  id: number
  name: string
  email: string
}

export interface SessionOut {
  id: number
  name: string
  venue: string
  community_id: number | any // Keep it any for now as per requirement
  session_status?: number | SessionStatusOut
  created_by?: number | User
  created_at: string
  updated_by?: number | User
  updated_at: string

  participant_count?: number
  question_count?: number
  total_score?: number
  total_time_ms?: number

  // session_question?: any[]
  questions?: QuestionOut[]
}

export interface SessionListResponse {
  items: SessionOut[]
  total_count: number
  count: number
}

export interface CreateSessionQuestion {
  question_id: number
  position: number
}

export interface CreateSession {
  name: string
  venue: string
  community_id: number
  session_status_id: number
  questions?: CreateSessionQuestion[]
}

export interface UpdateSession {
  name?: string
  venue?: string
  community_id?: number
  session_status_id?: number
  questions?: CreateSessionQuestion[]
}

// SessionQuestion types
export enum SessionQuestionExpand {
  Session = 'session',
  Question = 'question',
}

export enum SessionQuestionOrderBy {
  Id = 'id',
  Position = 'position',
}

export interface SessionQuestionFilterParams {
  session_id?: number
  question_id?: number
}

export interface SessionQuestionPaginationParams {
  limit?: number
  offset?: number
}

export interface SessionQuestionOrderParams {
  order_by?: SessionQuestionOrderBy
  order_type?: OrderType
}

export interface SessionQuestionListParams {
  filter?: SessionQuestionFilterParams
  pagination?: SessionQuestionPaginationParams
  order?: SessionQuestionOrderParams
  expand?: SessionQuestionExpand[]
}

export interface QuestionOption {
  id: number
  option_text: string
  score: number
}

export interface QuestionOut {
  id: number
  title: string
  answer_type: number
  question_bank: number | null
  is_scored: boolean
  time_limit_ms: number
  options: QuestionOption[]
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
  total_score: number
}

export interface SessionQuestionOut {
  id: number
  session_id: number
  question_id: number
  position: number
  session?: SessionOut
  question?: QuestionOut
}

export interface SessionQuestionListResponse {
  items: SessionQuestionOut[]
  total_count: number
  count: number
}

export interface SessionStatusType {
  id: number
  display_name: string
  code: string
}

export interface SessionStatusCount {
  all: number
  upcoming: number
  ongoing: number
  completed: number
}
