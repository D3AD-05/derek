export const ANSWER_TYPES = {
  RADIO: { id: 1, displayName: 'Radio', code: 'radio' },
  CHECKBOX: { id: 2, displayName: 'Checkbox', code: 'checkbox' },
  TEXTBOX: { id: 3, displayName: 'Textbox', code: 'textbox' },
} as const

export type AnswerTypeKey = keyof typeof ANSWER_TYPES
