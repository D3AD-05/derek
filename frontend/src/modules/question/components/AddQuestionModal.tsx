import { computed, defineComponent, ref, watch, type PropType } from 'vue'
import TextField from '@/core/components/inputFields/TextField/TextField'
import { Check, FilePen } from 'lucide-vue-next'
import { ANSWER_TYPES, type AnswerTypeKey } from '../constants'
import { useQuestionStore } from '@/modules/question/store'
import { storeToRefs } from 'pinia'
import { useToast } from '@/core/composables/useToast'
import { CreateNewQuestionAPI } from '@/modules/question/service'
import type { CreateQuestion, Question, QuestionBank } from '@/modules/question/types'
import { useConstantsStore } from '@/core/store/constants'

export default defineComponent({
  name: 'AddQuestionModal',

  props: {
    title: {
      type: String,
      required: false,
    },
    show: {
      type: Boolean,
      default: false,
    },
    question: {
      type: Object as PropType<any>,
      default: null,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onCreate: {
      type: Function as PropType<
        (data: {
          question: string
          timeLimit: number
          answerType: AnswerTypeKey
          isScored: boolean
          options: Array<{ text: string; isCorrect: boolean; score: number }>
        }) => Promise<void>
      >,
      required: true,
    },
    onUpdate: {
      type: Function as PropType<
        (
          id: number,
          data: {
            question: string
            timeLimit: number
            answerType: AnswerTypeKey
            isScored: boolean
            options: Array<{
               id?: number;
               text: string;
               isCorrect: boolean; 
               score: number 
            }>
          },
        ) => Promise<void>
      >,
      required: false,
    },

    // When opened from sessions flow
    fromSession: {
      type: Boolean,
      default: false,
    },
    onCreated: {
      type: Function as PropType<(question: Question) => void>,
      required: false,
    },
  },

  setup(props) {
    const toast = useToast()
    const questionStore = useQuestionStore()
    const { questionBanks, error } = storeToRefs(questionStore)
    const { answerTypeMap } = storeToRefs(useConstantsStore())

    const question = ref('')
    const time = ref(30)
    // Total points for the question (max achievable score)
    const points = ref(10)
    const isScored = ref(true)
    const answerType = ref<'RADIO' | 'CHECKBOX' | 'TEXTBOX'>('RADIO')
    const checkboxScoresManual = ref(false)
    const lastRadioCorrectIndex = ref<number | null>(null)
    const lastRadioCorrectAutoTotal = ref(0)
    const options = ref([
      { text: '', isCorrect: false, score: 0 },
      { text: '', isCorrect: false, score: 0 },
      { text: '', isCorrect: false, score: 0 },
      { text: '', isCorrect: false, score: 0 },
    ])

    const toNumber = (val: unknown, fallback = 0) => {
      const n = typeof val === 'number' ? val : Number(val)
      return Number.isFinite(n) ? n : fallback
    }

    const distributeCheckboxScores = () => {
      if (!isScored.value) return
      if (answerType.value !== 'CHECKBOX') return
      if (checkboxScoresManual.value) return

      const selectedIndices = options.value.reduce<number[]>((acc, opt, idx) => {
        if (opt.isCorrect) acc.push(idx)
        return acc
      }, [])

      if (selectedIndices.length === 0) return

      const total = toNumber(points.value, 0)
      const base = total / selectedIndices.length

      let allocated = 0
      for (const [i, idx] of selectedIndices.entries()) {
        const opt = options.value[idx]
        if (!opt) continue

        if (i < selectedIndices.length - 1) {
          const v = Number(base.toFixed(2))
          opt.score = v
          allocated += v
        } else {
          opt.score = Number((total - allocated).toFixed(2))
        }
      }
    }

    const syncRadioCorrectScore = () => {
      if (!isScored.value) return
      if (answerType.value !== 'RADIO') return

      const correctIdx = options.value.findIndex((o) => o.isCorrect)
      if (correctIdx < 0) return

      const correctOpt = options.value[correctIdx]
      if (!correctOpt) return

      const total = toNumber(points.value, 0)
      correctOpt.score = total
      lastRadioCorrectIndex.value = correctIdx
      lastRadioCorrectAutoTotal.value = total
    }

    const addToBank = ref(false)
    const selectedBankId = ref<number | null>(null)
    const banks = computed(() => (questionBanks.value?.items || []) as any as QuestionBank[])

    const ensureBanksLoaded = async () => {
      if (banks.value.length) return
      try {
        await questionStore.QBList({
          order_by: 'updated_at',
          order_type: 'desc',
        })
      } catch (err: any) {
        const errorMessage = error.value || err?.message || 'Failed to load banks'
        toast.error(errorMessage)
        console.error('Failed to load banks', err)
      }
    }

    const resetForm = (closeModal = true) => {
      // Reset form
      question.value = ''
      time.value = 30
      points.value = 10
      isScored.value = true
      answerType.value = 'RADIO'
      checkboxScoresManual.value = false
      options.value = [
        { text: '', isCorrect: false, score: 0 },
        { text: '', isCorrect: false, score: 0 },
        { text: '', isCorrect: false, score: 0 },
        { text: '', isCorrect: false, score: 0 },
      ]

      addToBank.value = false
      selectedBankId.value = null

      if (closeModal) {
        props.onClose()
      }
    }

    // Populate form when editing
    watch(
      () => props.question,
      (newQuestion) => {
        if (newQuestion) {
          question.value = newQuestion.title
          time.value = newQuestion.time_limit_ms / 1000 // Convert ms to seconds
          isScored.value = newQuestion.is_scored

          // Prefer backend-provided total score when present
          const backendTotal = toNumber(newQuestion.total_score, 0)
          if (backendTotal > 0) points.value = backendTotal

          // Map answer_type id to key

          answerType.value = answerTypeMap.value[newQuestion.answer_type] || 'RADIO'

          // Map options
          if (newQuestion.options && newQuestion.options.length > 0) {
            options.value = newQuestion.options.map((opt: any) => ({
              id: opt.id,
              text: opt.option_text,
              // NOTE: backend only stores score; we infer selection from score for CHECKBOX.
              // For RADIO, we pick the highest-score option as the "answer".
              isCorrect: opt.score > 0,
              score: toNumber(opt.score, 0),
            }))

            if (answerType.value === 'RADIO') {
              let maxScore = -Infinity
              let maxIdx = -1
              options.value.forEach((o, idx) => {
                if (o.score > maxScore) {
                  maxScore = o.score
                  maxIdx = idx
                }
              })
              options.value.forEach((o, idx) => {
                o.isCorrect = idx === maxIdx && maxScore > 0
              })

              if (backendTotal <= 0 && maxScore > 0) points.value = maxScore
            }

            if (answerType.value === 'CHECKBOX') {
              const sumSelected = options.value
                .filter((o) => o.isCorrect)
                .reduce((acc, o) => acc + toNumber(o.score, 0), 0)
              if (backendTotal <= 0 && sumSelected > 0) points.value = sumSelected
            }

            checkboxScoresManual.value = false
            distributeCheckboxScores()
            syncRadioCorrectScore()
          }
        } else {
          // Reset form when question is null
          resetForm(false)
        }
      },
      { immediate: true },
    )

    watch(
      points,
      () => {
        syncRadioCorrectScore()
        distributeCheckboxScores()
      },
      { immediate: false },
    )

    watch(
      answerType,
      () => {
        checkboxScoresManual.value = false
        // If switching to CHECKBOX and user hasn't manually set scores, distribute.
        distributeCheckboxScores()
        // If switching to RADIO, keep correct answer at total points.
        syncRadioCorrectScore()
      },
      { immediate: false },
    )

    watch(
      () => props.show,
      async (show) => {
        if (show && props.fromSession && addToBank.value) {
          await ensureBanksLoaded()
          if (!selectedBankId.value && banks.value.length) {
            const firstBank = banks.value[0]
            if (firstBank) selectedBankId.value = firstBank.id
          }
        }
      },
      { immediate: true },
    )

    watch(
      addToBank,
      async (enabled) => {
        if (enabled && props.fromSession && props.show) {
          await ensureBanksLoaded()
          if (!selectedBankId.value && banks.value.length) {
            const firstBank = banks.value[0]
            if (firstBank) selectedBankId.value = firstBank.id
          }
        }
      },
      { immediate: false },
    )

    const addOption = () => {
      options.value.push({ text: '', isCorrect: false, score: 0 })
    }

    const removeOption = (index: number) => {
      if (options.value.length > 2) {
        const wasCorrect = !!options.value[index]?.isCorrect
        options.value.splice(index, 1)

        if (answerType.value === 'RADIO' && wasCorrect) {
          // Ensure there's still a selected answer in RADIO
          options.value.forEach((o) => (o.isCorrect = false))
          if (options.value[0]) {
            options.value[0].isCorrect = true
            syncRadioCorrectScore()
          }
        }

        if (answerType.value === 'CHECKBOX' && !checkboxScoresManual.value) {
          distributeCheckboxScores()
        }
      }
    }

    const toggleCorrect = (index: number) => {
      if (answerType.value === 'RADIO') {
        const prevCorrectIdx = options.value.findIndex((o) => o.isCorrect)

        // If switching selection, clear the previous "auto" total score so it doesn't stick.
        if (prevCorrectIdx !== -1 && prevCorrectIdx !== index) {
          const prev = options.value[prevCorrectIdx]
          if (
            prev &&
            lastRadioCorrectIndex.value === prevCorrectIdx &&
            Math.abs(toNumber(prev.score, 0) - toNumber(lastRadioCorrectAutoTotal.value, 0)) < 0.001
          ) {
            prev.score = 0
          }
        }

        // For radio, only one can be correct
        options.value.forEach((opt, i) => {
          opt.isCorrect = i === index
        })
        // Selected answer always gets the total points
        if (isScored.value) {
          const total = toNumber(points.value, 0)
          const opt = options.value[index]
          if (opt) opt.score = total
          lastRadioCorrectIndex.value = index
          lastRadioCorrectAutoTotal.value = total
        }
      } else {
        // For checkbox, multiple can be correct
        const opt = options.value[index]
        if (!opt) return
        opt.isCorrect = !opt.isCorrect

        // If unselecting, zero-out by default
        if (!opt.isCorrect) {
          opt.score = 0
        }

        // If still in auto mode, divide total points equally
        distributeCheckboxScores()
      }
    }

    const toggleScored = () => {
      isScored.value = !isScored.value
      // If turning on scoring while TEXTBOX is selected, switch to RADIO
      if (isScored.value && answerType.value === 'TEXTBOX') {
        answerType.value = 'RADIO'
      }

      if (!isScored.value) {
        checkboxScoresManual.value = false
        // Clear any existing scores since scoring is disabled
        options.value.forEach((o) => {
          o.score = 0
        })
        return
      }

      // Turning scoring on: ensure scores are aligned with rules
      syncRadioCorrectScore()
      distributeCheckboxScores()
    }

    const selectAnswerType = (type: 'RADIO' | 'CHECKBOX' | 'TEXTBOX') => {
      answerType.value = type
      // Reset correct selections when changing answer type
      if (type === 'RADIO') {
        options.value.forEach((opt, i) => {
          opt.isCorrect = i === 0
        })
        syncRadioCorrectScore()
      }

      if (type === 'CHECKBOX') {
        checkboxScoresManual.value = false
        distributeCheckboxScores()
      }
    }

    const handleCreate = async () => {
      if (!question.value.trim()) {
        toast.error('Question is required')
        return
      }
      if (!Number.isInteger(time.value) || time.value <= 0) {
        toast.error('Time must be a positive integer')
        return
      }

      if (
        isScored.value &&
        (!Number.isInteger(points.value) || points.value < 0)
      ) {
        toast.error('Total points must be a valid integer')
        return
      }
      if (props.fromSession && addToBank.value && !selectedBankId.value) {
        toast.error('Please select a question bank')
        return
      }

      // Validation for RADIO and CHECKBOX types
      if (answerType.value !== 'TEXTBOX') {
        const filledOptions = options.value.filter((opt) => opt.text.trim())
        if (filledOptions.length < 2) {
          toast.error('At least 2 options are required')
          return
        }
        // Check for max length violation
        const hasMaxLengthExceeded = filledOptions.some((opt) => opt.text.length > 255)
        if (hasMaxLengthExceeded) {
          toast.error('Option text cannot exceed 255 characters')
          return
        }

        if (isScored.value) {
          const hasCorrect = filledOptions.some((opt) => opt.isCorrect)
          if (!hasCorrect) {
            toast.error('At least one correct answer is required')
            return
          }

          if (answerType.value === 'RADIO') {
            syncRadioCorrectScore()
          }

          if (answerType.value === 'CHECKBOX') {
            // If still in auto mode, make sure equal division is applied.
            distributeCheckboxScores()

            const selected = filledOptions.filter((opt) => opt.isCorrect)
            const sum = selected.reduce((acc, opt) => acc + toNumber(opt.score, 0), 0)
            if (selected.length > 0 && Math.abs(sum - toNumber(points.value, 0)) > 0.01) {
              toast.error(`Selected option scores must sum to total points (${points.value}).`)
              return
            }
          }
        }
      }

      const data = {
        question: question.value,
        timeLimit: time.value,
        answerType: answerType.value,
        isScored: isScored.value,
        options:
          answerType.value !== 'TEXTBOX' ? options.value.filter((opt) => opt.text.trim()) : [],
      }

      if (props.fromSession) {
        const createData: CreateQuestion = {
          question_bank_id: addToBank.value ? selectedBankId.value : null,
          title: data.question,
          time_limit_ms: data.timeLimit * 1000,
          answer_type_id: ANSWER_TYPES[data.answerType].id,
          options: data.options.map((opt) => ({
            option_text: opt.text,
            // RADIO: allow partial credit on any option.
            // CHECKBOX: only selected options contribute to score (total must remain points).
            score: !data.isScored
              ? 0
              : data.answerType === 'CHECKBOX'
                ? opt.isCorrect
                  ? toNumber(opt.score, 0)
                  : 0
                : toNumber(opt.score, 0),
          })),
        }

        try {
          const response = await CreateNewQuestionAPI(createData, { return_data: true })

          if (response.code === 200 || response.code === 201) {
            if (!response.data) {
              toast.error(
                'Server returned success but no data. Ensure backend supports `return_data=true`.',
              )
              console.error('❌ Create question returned null data:', response)
              return
            }

            toast.success(response.message || 'Question created successfully')
            props.onCreated?.(response.data)
            resetForm()
          } else {
            toast.error(response.message || 'Failed to create question')
          }
        } catch (err: any) {
          const errorMessage = err?.message ?? String(err)
          toast.error(`Failed to create question: ${errorMessage}`)
          console.error('❌ Failed to create question:', err)
        }

        return
      }

      // if (props.question && props.onUpdate) {
      //   // Update mode
      //   props.onUpdate(props.question.id, data)
      // } else {
      //   // Create mode
      //   props.onCreate(data)
      // }

      // // Reset form
      // resetForm()
      try {
        if (props.question && props.onUpdate) {
          await props.onUpdate(props.question.id, data)
        } else {
          await props.onCreate(data)
        }

        // Only close on success
        resetForm()
      } catch (err) {
        // Parent already handles toast
        console.error(err)
      }
    }

    return () => {
      if (!props.show) return null

      return (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20">
          <div class="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 class="mb-6 text-2xl font-semibold text-gray-900">
              {props.question ? 'Edit' : 'Add'} Question ({props.title})
            </h2>

            <div class="space-y-6">
              {/* Question Field */}
              <TextField
                label="Question"
                placeholder="Enter question"
                modelValue={question.value}
                onUpdate:modelValue={(val: string) => (question.value = val)}
              />

              {/* Scored Toggle */}
              <div class="flex items-center space-x-2 ">
                <button
                  type="button"
                  onClick={toggleScored}
                  class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isScored.value ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    class={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isScored.value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <label class="text-sm font-medium text-gray-700">Scored</label>
              </div>

              {/* Answer Type Selection */}
              <div>
                <label class="mb-3 block text-sm font-medium text-gray-700">Answer Type</label>
                <div class="flex gap-3">
                  <button
                    type="button"
                    onClick={() => selectAnswerType('RADIO')}
                    class={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                      answerType.value === 'RADIO'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Radio
                  </button>
                  <button
                    type="button"
                    onClick={() => selectAnswerType('CHECKBOX')}
                    class={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                      answerType.value === 'CHECKBOX'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Checkbox
                  </button>
                  {!isScored.value ? (
                    <button
                      type="button"
                      onClick={() => selectAnswerType('TEXTBOX')}
                      disabled={isScored.value}
                      class={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                        answerType.value === 'TEXTBOX'
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : isScored.value
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Textbox
                    </button>
                  ) : (
                    <div
                      class={
                        'flex-1 rounded-lg border-2 border-background px-4 py-3 text-sm font-medium transition-colors'
                      }
                    ></div>
                  )}
                </div>
              </div>

              {/* Textbox Info Message */}
              {answerType.value === 'TEXTBOX' && (
                <div class="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-center gap-2">
                  <FilePen color="blue" />
                  <p class="text-sm text-blue-800">
                    Text box answer type selected. Users will provide free-text responses.
                  </p>
                </div>
              )}

              {/* Time and Points Row */}
              <div class={`grid gap-4 ${isScored.value ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <TextField
                  label="Time (sec)"
                  type="number"
                  modelValue={time.value}
                  onUpdate:modelValue={(val: string | number) => (time.value = Number(val))}
                />
                {isScored.value && (
                  <TextField                  
                    label="Total Point"
                    type="number"
                    modelValue={points.value}
                    onUpdate:modelValue={(val: string | number) => (points.value = Number(val))}
                  />
                )}
              </div>

              {/* Options */}
              {answerType.value !== 'TEXTBOX' && (
                <div>
                  <label class="mb-3 block text-sm font-medium text-gray-700">
                    Options<span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-3">
                    {options.value.map((option, index) => (
                      <div key={index} class="flex items-center gap-3">
                        {/* Correct Answer Indicator (Radio or Checkbox) */}
                        <button
                          type="button"
                          class={`shrink-0 w-5 h-5 border-2 ${
                            answerType.value === 'RADIO' ? 'rounded-full' : 'rounded'
                          } ${
                            option.isCorrect ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                          } flex items-center justify-center transition-colors`}
                          onClick={() => toggleCorrect(index)}
                        >
                          {option.isCorrect && answerType.value === 'CHECKBOX' && (
                            // Tick for checkbox
                            <Check color="white" />
                          )}
                          {option.isCorrect && answerType.value === 'RADIO' && (
                            // Dot for radio
                            <div class="w-2 h-2 rounded-full bg-white" />
                          )}
                        </button>

                        {/* Option text input */}
                        <div class="flex-1">
                          <input
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            class={`w-full rounded-lg border px-4 py-2 focus:outline-none ${
                              option.text.length >= 255
                                ? 'border-amber-500 focus:border-amber-500'
                                : 'border-gray-300 focus:border-blue-500'
                            }`}
                            value={option.text}
                            onInput={(e: any) => {
                              const opt = options.value[index]
                              if (opt) opt.text = e.target.value
                            }}
                          />
                          {option.text.length >= 255 && (
                            <div class="mt-1 text-xs text-amber-600 flex items-center gap-1">
                              <span>⚠️ Max length (255 characters) reached</span>
                            </div>
                          )}
                        </div>

                        {/* Score Field (only when scored is enabled) */}

                        {isScored.value &&
                          (answerType.value !== 'CHECKBOX' || option.isCorrect) && (
                            <div class="w-20">
                              <input
                                type="number"
                                min={0}
                                step={1}
                                inputmode="numeric"
                                placeholder="Score"
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                value={option.score}
                                onInput={(e: any) => {
                                  const opt = options.value[index]
                                  if (!opt) return

                                  const newScore = toNumber(e.target.value, 0)
                                  opt.score = newScore

                                  if (answerType.value === 'RADIO' && opt.isCorrect) {
                                    points.value = newScore
                                  }

                                  if (answerType.value === 'CHECKBOX') {
                                    checkboxScoresManual.value = true
                                  }
                                }}
                              />
                            </div>
                          )}

                        {/* Remove button */}
                        {options.value.length > 2 && (
                          <button
                            type="button"
                            class="shrink-0 text-red-500 hover:text-red-700"
                            onClick={() => removeOption(index)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Option Button */}
                  <button
                    type="button"
                    class="mt-4 w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600"
                    onClick={addOption}
                  >
                    + Add option
                  </button>
                </div>
              )}
            </div>

            {/* Add to Bank (sessions only) */}
            {props.fromSession && (
              <div class="space-y-3 mt-2">
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 ">
                  <input
                    type="checkbox"
                    checked={addToBank.value}
                    onChange={(e: any) => (addToBank.value = !!e.target.checked)}
                  />
                  Do you want to add this question to a bank?
                </label>

                {addToBank.value && (
                  <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">
                      Select Question Bank
                    </label>
                    <select
                      class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                      value={selectedBankId.value ?? ''}
                      onChange={(e: any) => (selectedBankId.value = Number(e.target.value))}
                    >
                      <option value="" disabled>
                        Select bank...
                      </option>
                      {banks.value.map((b: any) => (
                        <option value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div class="mt-8 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg px-6 py-2.5 text-blue-600 hover:bg-blue-50"
                onClick={() => resetForm()}
              >
                Cancel
              </button>
              <button
                type="button"
                class="rounded-lg bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700"
                onClick={handleCreate}
              >
                 {props.question ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )
    }
  },
})
