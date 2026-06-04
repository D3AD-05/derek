// src/core/store/constants.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAnswerStatuses, getAnswerTypes, getSessionStatuses, getUserStatuses, type AnswerStatus, type AnswerType, type SessionStatus } from '@/core/api/constantsApi'

const STORAGE_KEY_ANSWER_STATUSES = 'answerStatuses'
const STORAGE_KEY_ANSWER_TYPES = 'answerTypes'
const STORAGE_KEY_SESSION_STATUSES = 'sessionStatuses'
const STORAGE_KEY_USER_STATUSES = 'userStatuses'

export const useConstantsStore = defineStore('constants', () => {
  const answerStatuses = ref<AnswerStatus[]>([])
  const answerTypes = ref<AnswerType[]>([])
  const sessionStatuses = ref<SessionStatus[]>([])
  const userStatuses = ref<SessionStatus[]>([])

  const loadFromStorage = () => {
    const storedStatuses = localStorage.getItem(STORAGE_KEY_ANSWER_STATUSES)
    if (storedStatuses) {
      answerStatuses.value = JSON.parse(storedStatuses)
    }
    const storedTypes = localStorage.getItem(STORAGE_KEY_ANSWER_TYPES)
    if (storedTypes) {
      answerTypes.value = JSON.parse(storedTypes)
    }
    const storedSessionStatuses = localStorage.getItem(STORAGE_KEY_SESSION_STATUSES)
    if (storedSessionStatuses) {
      sessionStatuses.value = JSON.parse(storedSessionStatuses)
    }
    const storedUserStatuses = localStorage.getItem(STORAGE_KEY_USER_STATUSES)
    if (storedUserStatuses) {
      userStatuses.value = JSON.parse(storedUserStatuses)
    }
  }

  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY_ANSWER_STATUSES, JSON.stringify(answerStatuses.value))
    localStorage.setItem(STORAGE_KEY_ANSWER_TYPES, JSON.stringify(answerTypes.value))
    localStorage.setItem(STORAGE_KEY_SESSION_STATUSES, JSON.stringify(sessionStatuses.value))
    localStorage.setItem(STORAGE_KEY_USER_STATUSES, JSON.stringify(userStatuses.value))
  }

  const fetchAnswerStatuses = async () => {
    try {
      const data = await getAnswerStatuses()
      answerStatuses.value = data
      saveToStorage()
    } catch (error) {
      console.error('Failed to fetch answer statuses:', error)
    }
  }

  const fetchAnswerTypes = async () => {
    try {
      const data = await getAnswerTypes()
      answerTypes.value = data
      saveToStorage()
    } catch (error) {
      console.error('Failed to fetch answer types:', error)
    }
  }

  const fetchSessionStatuses = async () => {
    try {
      const data = await getSessionStatuses()
      sessionStatuses.value = data
      saveToStorage()
    } catch (error) {
      console.error('Failed to fetch session statuses:', error)
    }
  }

  const fetchUserStatuses = async () => {
    try {
      const data = await getUserStatuses()
      userStatuses.value = data
      saveToStorage()
    } catch (error) {
      console.error('Failed to fetch user statuses:', error)
    }
  }

  const fetchAll = async () => {
    await Promise.all([fetchAnswerStatuses(), fetchAnswerTypes(), fetchSessionStatuses(), fetchUserStatuses()])
  }

  // Computed maps
  const answerTypeMap = computed<Record<number, 'RADIO' | 'CHECKBOX' | 'TEXTBOX'>>(() => {
    const map: Record<number, 'RADIO' | 'CHECKBOX' | 'TEXTBOX'> = {}
    answerTypes.value.forEach(type => {
      const upperCode = type.code.toUpperCase() as 'RADIO' | 'CHECKBOX' | 'TEXTBOX'
      map[type.id] = upperCode
    })
    return map
  })

  const answerStatusIdMap = computed<Record<'answered' | 'skipped' | 'timeout', number>>(() => {
    const map: Record<'answered' | 'skipped' | 'timeout', number> = {} as any
    answerStatuses.value.forEach(status => {
      map[status.code as 'answered' | 'skipped' | 'timeout'] = status.id
    })
    return map
  })

  // Load from storage on init
  loadFromStorage()

  return {
    answerStatuses,
    answerTypes,
    sessionStatuses,
    userStatuses,
    fetchAll,
    fetchUserStatuses,
    answerTypeMap,
    answerStatusIdMap,
  }
})