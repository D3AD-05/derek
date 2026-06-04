// src/core/api/constantsApi.ts
import { get } from './helper'

export interface AnswerStatus {
  id: number
  code: string
  display_name: string
}

export interface AnswerType {
  id: number
  display_name: string
  code: string
}

export interface SessionStatus {
  id: number
  display_name: string
  code: string
}

export async function getAnswerStatuses(): Promise<AnswerStatus[]> {
  const response = await get<AnswerStatus[]>('/session/answer-status')
  return response.data
}

export async function getAnswerTypes(): Promise<AnswerType[]> {
  const response = await get<AnswerType[]>('/question/answer-type')
  return response.data
}

export async function getSessionStatuses(): Promise<SessionStatus[]> {
  const response = await get<SessionStatus[]>('session/status')
  return response.data
}

export async function getUserStatuses(): Promise<SessionStatus[]> {
  const response = await get<SessionStatus[]>('user/status')
  return response.data
}