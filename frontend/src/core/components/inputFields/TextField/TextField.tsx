import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TextField',
  props: {
    modelValue: [String, Number],
    label: String,
    placeholder: String,
    type: { type: String, default: 'text' },
    disabled: Boolean,
    readonly: Boolean,
    error: String,
    required: Boolean,
  },
  emits: ['update:modelValue', 'blur', 'focus', 'input'],

  setup(props, { emit, slots, attrs }) {
    const onInput = (e: Event) => {
      emit('update:modelValue', (e.target as HTMLInputElement).value)
      emit('input', e)
    }

    return () => (
      <div class="flex flex-col gap-1">
        {props.label && <label class="text-sm font-medium">{props.label}</label>}

        <div class="relative">
          {slots.prefix?.()}

          <input
            {...attrs}
            required={props.required}
            class={[
              'w-full rounded border py-2 outline-none',
              slots.prefix ? 'pl-10' : 'pl-3',
              slots.suffix ? 'pr-10' : 'pr-3',
              props.error ? 'border-red-500' : 'border-gray-300',
            ]}
            type={props.type}
            placeholder={props.placeholder}
            value={props.modelValue}
            disabled={props.disabled}
            readonly={props.readonly}
            onInput={onInput}
            onBlur={(e) => emit('blur', e)}
            onFocus={(e) => emit('focus', e)}
          />

          {slots.suffix?.()}
        </div>

        {props.error && <span class="text-xs text-red-500">{props.error}</span>}
      </div>
    )
  },
})
