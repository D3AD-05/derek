import { Pencil, SlidersHorizontal, Trash } from 'lucide-vue-next'
import {
  defineComponent,
  type PropType,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue'

type Column = {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

type FilterChip = {
  key: string
  label: string
}

export default defineComponent({
  name: 'DataTable',

  props: {
    /* ===== Header ===== */
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },

    /* ===== Table ===== */
    columns: {
      type: Array as PropType<Column[]>,
      required: true,
    },
    data: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    rowKey: {
      type: String,
      default: 'id',
    },

    /* ===== Server-side ===== */
    total: {
      type: Number,
      default: 0,
    },
    page: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    loading: {
      type: Boolean,
      default: false,
    },

    /* ===== Actions ===== */
    showActions: {
      type: Boolean,
      default: true,
    },

    /* ===== Search / Filter ===== */
    showSearch: {
      type: Boolean,
      default: false,
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...',
    },
    showFilter: {
      type: Boolean,
      default: false,
    },

    filterOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onFilterOpenChange: Function as PropType<(open: boolean) => void>,
    onFilterClick: Function as PropType<() => void>,

    filterChips: {
      type: Array as PropType<FilterChip[]>,
      default: () => [],
    },
    maxVisibleFilterChips: {
      type: Number,
      default: 3,
    },
    onRemoveFilterChip: Function as PropType<(key: string) => void>,

    onEdit: Function as PropType<(row: any) => void>,
    onDelete: Function as PropType<(row: any) => void>,
    onChange: Function as PropType<
      (params: { page: number; pageSize: number; search: string }) => void
    >,
  },

  setup(props, { slots }) {
    const search = ref('')

    const toolbarRef = ref<HTMLElement | null>(null)
    const popoverRef = ref<HTMLElement | null>(null)

    const internalFilterOpen = ref(false)
    const isFilterOpen = computed(
      () => (props.filterOpen ?? internalFilterOpen.value) && props.showFilter,
    )

    const setFilterOpen = (open: boolean) => {
      if (props.filterOpen === undefined) internalFilterOpen.value = open
      props.onFilterOpenChange?.(open)
    }

    const toggleFilterOpen = () => {
      const next = !isFilterOpen.value
      setFilterOpen(next)
      props.onFilterClick?.()
    }

    const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
    const paginationStart = computed(() => {
      if (props.total === 0) return 0
      return (props.page - 1) * props.pageSize + 1
    })
    const paginationEnd = computed(() => {
      return Math.min(props.page * props.pageSize, props.total)
    })

    const visibleFilterChips = computed(() =>
      props.filterChips.slice(0, props.maxVisibleFilterChips),
    )
    const overflowFilterChipCount = computed(() =>
      Math.max(0, props.filterChips.length - visibleFilterChips.value.length),
    )

    const onDocMouseDown = (e: MouseEvent) => {
      if (!isFilterOpen.value) return
      const toolbarEl = toolbarRef.value
      const popoverEl = popoverRef.value
      const target = e.target as Node
      if (popoverEl?.contains(target)) return
      if (toolbarEl?.contains(target)) return
      setFilterOpen(false)
    }

    onMounted(() => {
      document.addEventListener('mousedown', onDocMouseDown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onDocMouseDown)
    })

    watch(search, () => {
      props.onChange?.({
        page: 1,
        pageSize: props.pageSize,
        search: search.value,
      })
    })

    const changePage = (page: number) => {
      props.onChange?.({
        page,
        pageSize: props.pageSize,
        search: search.value,
      })
    }

    return () => (
      <div class="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* HEADER */}
        {(props.title || props.subtitle) && (
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0 flex-1">
              {props.title && (
                <h2 class="text-2xl font-semibold tracking-tight text-slate-900">{props.title}</h2>
              )}

              {props.subtitle && (
                <p class="mt-1 text-sm text-slate-500 break-all">{props.subtitle}</p>
              )}
            </div>

            {slots.headerAction && <div class="shrink-0">{slots.headerAction?.()}</div>}
          </div>
        )}

        {/* SEARCH / FILTER */}
        {(props.showSearch || props.showFilter || props.filterChips.length > 0) && (
          <div
            ref={toolbarRef}
            class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
          >
            {props.showSearch && (
              <input
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                placeholder={props.searchPlaceholder}
                value={search.value}
                onInput={(e: Event) => (search.value = (e.target as HTMLInputElement).value)}
              />
            )}

            {(props.showFilter || props.filterChips.length > 0) && (
              <div class="relative shrink-0">
                <div class="flex flex-wrap items-center gap-2">
                  {visibleFilterChips.value.map((chip) => (
                    <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                      <span class="max-w-[220px] truncate">{chip.label}</span>

                      <button
                        type="button"
                        class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          props.onRemoveFilterChip?.(chip.key)
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {overflowFilterChipCount.value > 0 && (
                    <span class="inline-flex items-center rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
                      +{overflowFilterChipCount.value}
                    </span>
                  )}

                  {props.showFilter && (
                    <button
                      type="button"
                      class={[
                        'rounded-xl border p-2.5 transition-all',
                        isFilterOpen.value || props.filterChips.length > 0
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50',
                      ].join(' ')}
                      aria-haspopup="dialog"
                      aria-expanded={isFilterOpen.value}
                      onClick={toggleFilterOpen}
                    >
                      <SlidersHorizontal class="h-4 w-4 text-slate-600" />
                    </button>
                  )}
                </div>

                {props.showFilter && isFilterOpen.value && (
                  <div
                    ref={popoverRef}
                    class="absolute right-0 mt-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-xl"
                    style={{ zIndex: 60 }}
                  >
                    <div class="max-h-[70vh] space-y-4 overflow-auto p-5">
                      {slots.filterPopover?.()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TABLE */}
        <div class="overflow-hidden rounded-2xl border border-slate-200">
          <div class="max-w-full overflow-x-auto">
            <table class="min-w-full text-left">
              <thead class="bg-slate-50">
                <tr>
                  {props.columns.map((col) => (
                    <th
                      key={col.key}
                      class="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      style={{
                        textAlign: col.align ?? 'left',
                        width: col.width ?? 'auto',
                      }}
                    >
                      {col.label}
                    </th>
                  ))}

                  {props.showActions && (
                    <th
                      class="sticky right-0 z-20 bg-slate-50 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                      style={{ width: '120px' }}
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-100">
                {!props.loading &&
                  props.data.map((row: any) => (
                    <tr key={row[props.rowKey]} class="transition-colors hover:bg-slate-50">
                      {props.columns.map((col) => {
                        const cellValue = row[col.key]
                        const isString = typeof cellValue === 'string'

                        return (
                          <td
                            class={
                              isString
                                ? 'px-6 py-4 text-slate-700 whitespace-normal break-words'
                                : 'px-6 py-4 text-slate-700 whitespace-nowrap'
                            }
                            style={{
                              textAlign: col.align ?? 'left',
                              width: col.width ?? undefined,
                            }}
                          >
                            {cellValue}
                          </td>
                        )
                      })}

                      {props.showActions && (
                        <td class="sticky right-0 bg-white px-6 py-4 text-right">
                          <div class="flex justify-end gap-2">
                            <button
                              class="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                              onClick={() => props.onEdit?.(row)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              class="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              onClick={() => props.onDelete?.(row)}
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}

                {!props.loading && props.data.length === 0 && (
                  <tr>
                    <td
                      colspan={props.columns.length + (props.showActions ? 1 : 0)}
                      class="py-12 text-center text-slate-500"
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {props.loading && <div class="py-10 text-center text-slate-500">Loading...</div>}
        </div>

        {/* PAGINATION */}
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="flex flex-col gap-1 text-sm text-slate-500">
            <span>
              Showing {paginationStart.value}-{paginationEnd.value} of {props.total} total
            </span>
            <span>
              Page {props.page} of {totalPages.value}
            </span>
          </div>

          <div class="flex gap-2">
            <button
              disabled={props.page === 1}
              class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              onClick={() => changePage(props.page - 1)}
            >
              Prev
            </button>

            <button
              disabled={props.page === totalPages.value}
              class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              onClick={() => changePage(props.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  },
})
