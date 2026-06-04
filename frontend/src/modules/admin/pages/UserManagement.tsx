import { defineComponent, computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import DataTable from '@/core/components/dataTable/DataTable'
import Button from '@/core/components/button/Button'
import DeleteConfirmModal from '@/core/components/modals/DeleteConfirmModal'
import TextField from '@/core/components/inputFields/TextField/TextField'
import MultiSelectDropdown from '@/modules/admin/components/MultiSelectDropdown'
import { useToast } from '@/core/composables/useToast'
import FormDrawer from '@/modules/admin/components/FormDrawer'
import type { Community, EntityId, UserListParams } from '@/modules/admin/types'
import { OrderType, UserExpand, UserOrderBy } from '@/modules/admin/types'
import { useUserStore } from '../store/userStore'
import { useCommunityStore } from '../store/communityStore'
import { useConstantsStore } from '@/core/store/constants'
import { CreateUserApi, UpdateUserAPI, DeleteUserApi } from '@/modules/admin/services/userService'

export default defineComponent({
  name: 'UserManagement',

  setup() {
    const toast = useToast()
    const userStore = useUserStore()
    const communityStore = useCommunityStore()
    const constantsStore = useConstantsStore()

    const editingUserCommunities = ref<Community[]>([])

    const drawerOpen = ref(false)
    const drawerMode = ref<'add' | 'edit'>('add')
    const drawerLoading = ref(false)
    const drawerSaving = ref(false)
    const editingUserId = ref<EntityId | null>(null)

    // Form state
    const formState = ref({
      name: '',
      email: '',
      isPlatformAdmin: false,
      status: '',
      communityIds: [] as EntityId[],
    })
    const formErrors = ref<Record<string, string>>({})

    const deleteModalOpen = ref(false)
    const deletingUserId = ref<EntityId | null>(null)
    const deletingUserName = ref('')

    const { userList, loading, error } = storeToRefs(userStore)
    console.log('🚀 ~ error:', error)
    const { userStatuses } = storeToRefs(constantsStore)
    const { communityList } = storeToRefs(communityStore)

    const page = ref(1)
    const pageSize = ref(10)
    const search = ref('')

    const filterOpen = ref(false)
    const appliedFilters = ref<{ isPlatformAdmin: boolean | null; status: string }>({
      isPlatformAdmin: null,
      status: '',
    })
    const filterDraft = ref<{ isPlatformAdmin: 'all' | 'true' | 'false'; status: string }>({
      isPlatformAdmin: 'all',
      status: '',
    })

    const defaultStatusCode = computed(() => {
      const byCode = userStatuses.value?.find(
        (s: any) => String(s?.code ?? '').toLowerCase() === 'active',
      )
      if (byCode?.code) return String(byCode.code)
      return userStatuses.value?.[0]?.code ?? ''
    })

    const resolveUserStatusId = (statusCode: string): number | null => {
      const normalizedCode = String(statusCode ?? '')
        .trim()
        .toLowerCase()
      if (!normalizedCode) return null

      const matched = userStatuses.value?.find(
        (s: any) =>
          String(s?.code ?? '')
            .trim()
            .toLowerCase() === normalizedCode,
      )

      const id = Number(matched?.id)
      return Number.isFinite(id) && id > 0 ? id : null
    }

    const resolveUserStatusLabel = (raw: any): string => {
      if (!raw) return ''

      // Expanded object (common in retrieve endpoint)
      if (typeof raw === 'object') {
        if (raw.display_name) return String(raw.display_name)
        if (raw.code) {
          const match = userStatuses.value?.find((s: any) => s.code === raw.code)
          return match?.display_name ?? String(raw.code)
        }
        if (raw.id != null) {
          const match = userStatuses.value?.find((s: any) => s.id === raw.id)
          return match?.display_name ?? String(raw.id)
        }
      }

      // Non-expanded scalar: backend list often returns `user_status: <id>`
      if (typeof raw === 'number') {
        const match = userStatuses.value?.find((s: any) => s.id === raw)
        return match?.display_name ?? String(raw)
      }

      if (typeof raw === 'string') {
        const match = userStatuses.value?.find((s: any) => s.code === raw)
        return match?.display_name ?? raw
      }

      return ''
    }

    const users = computed(() => {
      const items = userList.value?.items || []
      return items.map((u: any) => {
        const isPlatformAdminBool = u.is_platform_admin ?? u.isPlatformAdmin ?? false

        return {
          ...u,
          // DataTable renders booleans as empty in JSX; use a display string.
          isPlatformAdmin: isPlatformAdminBool ? 'Yes' : 'No',
          status: resolveUserStatusLabel(u.user_status ?? u.status),
        }
      })
    })

    const communityOptions = computed(() => {
      const base = communityList.value?.items ?? []
      const merged = new Map<EntityId, Community>()
      for (const c of base) merged.set(c.id, c)
      for (const c of editingUserCommunities.value) merged.set(c.id, c)

      return Array.from(merged.values()).map((c) => ({ id: c.id, label: c.name }))
    })

    onMounted(async () => {
      await constantsStore.fetchUserStatuses()
      try {
        await communityStore.fetchCommunityList()
      } catch (e) {
        // Non-blocking: user management should still load even if communities fail.
        console.error(e)
      }
      await loadUser(buildListParams())
    })

    const loadUser = async (params?: UserListParams) => {
      try {
        await userStore.fetchUserList(params)
      } catch (error) {
        console.error(error)
      }
    }

    const columns = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'isPlatformAdmin', label: 'Is Platform Admin', width: '180px' },
      { key: 'status', label: 'User Status', width: '140px' },
    ]

    const buildListParams = (next?: {
      page?: number
      pageSize?: number
      search?: string
    }): UserListParams => {
      const nextPage = next?.page ?? page.value
      const nextPageSize = next?.pageSize ?? pageSize.value
      const nextSearch = next?.search ?? search.value

      const filter: any = {}
      if (appliedFilters.value.isPlatformAdmin !== null) {
        filter.is_platform_admin = appliedFilters.value.isPlatformAdmin
      }
      if (appliedFilters.value.status) {
        filter.status = appliedFilters.value.status
      }

      return {
        pagination: {
          limit: nextPageSize,
          offset: (nextPage - 1) * nextPageSize,
        },
        search: nextSearch?.trim() ? nextSearch : undefined,
        filter: Object.keys(filter).length ? filter : undefined,
        order: {
          order_by: UserOrderBy.CreatedAt,
          order_type: OrderType.Desc,
        },
        expand: [UserExpand.user_status],
      }
    }

    const filterChips = computed(() => {
      const chips: Array<{ key: string; label: string }> = []
      if (appliedFilters.value.isPlatformAdmin !== null) {
        chips.push({
          key: 'isPlatformAdmin',
          label: `Platform Admin: ${appliedFilters.value.isPlatformAdmin ? 'Yes' : 'No'}`,
        })
      }
      if (appliedFilters.value.status) {
        chips.push({
          key: 'status',
          label: `Status: ${resolveUserStatusLabel(appliedFilters.value.status)}`,
        })
      }
      return chips
    })

    const syncDraftFromApplied = () => {
      filterDraft.value = {
        isPlatformAdmin:
          appliedFilters.value.isPlatformAdmin === null
            ? 'all'
            : appliedFilters.value.isPlatformAdmin
              ? 'true'
              : 'false',
        status: appliedFilters.value.status,
      }
    }

    syncDraftFromApplied()

    const clearFilters = async () => {
      appliedFilters.value = { isPlatformAdmin: null, status: '' }
      syncDraftFromApplied()
      page.value = 1
      filterOpen.value = false
      await loadUser(buildListParams({ page: 1 }))
    }

    const removeFilterChip = async (key: string) => {
      if (key === 'isPlatformAdmin') appliedFilters.value.isPlatformAdmin = null
      if (key === 'status') appliedFilters.value.status = ''
      syncDraftFromApplied()
      page.value = 1
      await loadUser(buildListParams({ page: 1 }))
    }

    // Normalize backend user data to form format
    const normalizeUserData = (backendData: any) => {
      const isPlatformAdmin = backendData.is_platform_admin ?? backendData.isPlatformAdmin ?? false

      return {
        id: backendData.id,
        name: backendData.name,
        email: backendData.email,
        isPlatformAdmin,
        status: backendData.user_status?.code ?? backendData.status ?? '',
        communityIds: isPlatformAdmin
          ? (backendData.communities?.map((c: any) => c.id) ?? [])
          : ([] as EntityId[]),
        communities: backendData.communities,
        user_status: backendData.user_status,
      }
    }

    const resetFormState = () => {
      formState.value = {
        name: '',
        email: '',
        isPlatformAdmin: false,
        status: defaultStatusCode.value,
        communityIds: [],
      }
      formErrors.value = {}
    }

    const validateForm = () => {
      const next: Record<string, string> = {}

      if (!formState.value.name.trim()) next.name = 'Name is required.'

      const email = formState.value.email.trim().toLowerCase()
      if (!email) next.email = 'Email is required.'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Please enter a valid email.'

      if (!formState.value.status) next.status = 'Status is required.'

      formErrors.value = next
      return Object.keys(next).length === 0
    }

    const openAdd = () => {
      drawerMode.value = 'add'
      editingUserId.value = null
      resetFormState()
      editingUserCommunities.value = []
      drawerOpen.value = true
    }

    const openEdit = (row: any) => {
      const id = row?.id as EntityId
      drawerMode.value = 'edit'
      drawerLoading.value = true
      editingUserId.value = id

      userStore
        .fetchUser(typeof id === 'string' ? parseInt(id) : id, [
          UserExpand.user_status,
          UserExpand.communities,
        ])
        .then((user) => {
          const normalizedData = normalizeUserData(user)
          formState.value = {
            name: normalizedData.name,
            email: normalizedData.email,
            isPlatformAdmin: normalizedData.isPlatformAdmin,
            status: normalizedData.status,
            communityIds: normalizedData.communityIds,
          }
          editingUserCommunities.value = normalizedData.communities ?? []
          drawerOpen.value = true
        })
        .catch((error) => {
          toast.error('Failed to fetch user details.')
          console.error(error)
        })
        .finally(() => {
          drawerLoading.value = false
        })
    }

    const openDelete = (row: any) => {
      deletingUserId.value = row?.id as EntityId
      deletingUserName.value = row?.name ?? 'this user'
      deleteModalOpen.value = true
    }

    const confirmDelete = async () => {
      if (!deletingUserId.value) return

      try {
        await DeleteUserApi(
          typeof deletingUserId.value === 'string'
            ? parseInt(deletingUserId.value)
            : deletingUserId.value,
        )
        toast.success('User deleted successfully.')
        await loadUser(buildListParams())
      } catch (e: any) {
        toast.error(e?.message ?? 'Failed to delete user.')
      } finally {
        deleteModalOpen.value = false
        deletingUserId.value = null
        deletingUserName.value = ''
      }
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      drawerSaving.value = true
      try {
        const backendData = {
          name: formState.value.name.trim(),
          email: formState.value.email.trim().toLowerCase(),
          is_platform_admin: formState.value.isPlatformAdmin,
          user_status_id: resolveUserStatusId(formState.value.status),
          community_ids: formState.value.isPlatformAdmin
            ? formState.value.communityIds
            : ([] as EntityId[]),
        }

        if (!backendData.user_status_id) {
          toast.error('Please select a valid user status.')
          return
        }

        if (drawerMode.value === 'add') {
          await CreateUserApi(backendData as any, { return_data: true })
          toast.success('User created successfully.')
        } else {
          if (!editingUserId.value) throw new Error('Missing user id.')
          await UpdateUserAPI(editingUserId.value, backendData as any, { return_data: true })
          toast.success('User updated successfully.')
        }

        await loadUser(buildListParams())
        drawerOpen.value = false
        resetFormState()
      } catch (e: any) {
        toast.error(e?.message ?? 'Operation failed.')
      } finally {
        drawerSaving.value = false
      }
    }

    const closeDrawer = () => {
      drawerOpen.value = false
      resetFormState()
      editingUserCommunities.value = []
    }

    watch(
      () => formState.value.isPlatformAdmin,
      (isAdmin) => {
        if (!isAdmin) {
          formState.value.communityIds = []
        }
      },
    )

    const handleTableChange = async (params: {
      page: number
      pageSize: number
      search: string
    }) => {
      page.value = params.page
      pageSize.value = params.pageSize
      search.value = params.search
      await loadUser(
        buildListParams({
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
        }),
      )
    }

    const applyFilters = async () => {
      appliedFilters.value = {
        isPlatformAdmin:
          filterDraft.value.isPlatformAdmin === 'all'
            ? null
            : filterDraft.value.isPlatformAdmin === 'true',
        status: filterDraft.value.status,
      }
      page.value = 1
      filterOpen.value = false
      await loadUser(buildListParams({ page: 1 }))
    }

    return () => (
      <div class="space-y-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-black">User Management</h1>
            <p class="text-sm text-gray-900">Create, update, and manage platform users.</p>
          </div>
        </div>

        <DataTable
          title="Users"
          subtitle="Manage user accounts"
          columns={columns}
          data={users.value}
          total={userList.value?.total_count ?? 0}
          page={page.value}
          pageSize={pageSize.value}
          loading={loading.value}
          onEdit={openEdit}
          onDelete={openDelete}
          onChange={handleTableChange}
          showSearch
          searchPlaceholder="Search users..."
          showFilter
          filterOpen={filterOpen.value}
          onFilterOpenChange={(open) => {
            filterOpen.value = open
            if (open) syncDraftFromApplied()
          }}
          filterChips={filterChips.value}
          maxVisibleFilterChips={3}
          onRemoveFilterChip={removeFilterChip}
        >
          {{
            headerAction: () => (
              <Button variant="primary" onClick={openAdd}>
                + Add User
              </Button>
            ),
            filterPopover: () => (
              <div class="space-y-4">
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium">Is Platform Admin</label>
                  <select
                    class="w-full rounded border border-gray-300 py-2 px-3 outline-none bg-white"
                    value={filterDraft.value.isPlatformAdmin}
                    onChange={(e) =>
                      (filterDraft.value.isPlatformAdmin = (e.target as HTMLSelectElement)
                        .value as any)
                    }
                  >
                    <option value="all">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium">Status</label>
                  <select
                    class="w-full rounded border border-gray-300 py-2 px-3 outline-none bg-white"
                    value={filterDraft.value.status}
                    onChange={(e) =>
                      (filterDraft.value.status = (e.target as HTMLSelectElement).value)
                    }
                  >
                    <option value="">All</option>
                    {userStatuses.value?.map((s: any) => (
                      <option key={s.id} value={s.code}>
                        {s.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="flex items-center justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button variant="primary" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            ),
          }}
        </DataTable>

        <FormDrawer
          isOpen={drawerOpen.value}
          onClose={closeDrawer}
          title={drawerMode.value === 'add' ? 'Add User' : 'Edit User'}
          description="Manage platform users."
        >
          {{
            default: () => (
              <div class="space-y-4">
                <TextField
                  label="Name"
                  placeholder="Full name"
                  modelValue={formState.value.name}
                  error={formErrors.value.name}
                  disabled={drawerSaving.value || drawerLoading.value}
                  onUpdate:modelValue={(v: string) => (formState.value.name = v)}
                />

                <TextField
                  label="Email"
                  placeholder="email@company.com"
                  modelValue={formState.value.email}
                  error={formErrors.value.email}
                  disabled={drawerSaving.value || drawerLoading.value}
                  onUpdate:modelValue={(v: string) => (formState.value.email = v)}
                />

                <div
                  class={[
                    'flex items-center justify-between rounded border p-3',
                    drawerSaving.value || drawerLoading.value ? 'opacity-70' : 'border-gray-200',
                  ].join(' ')}
                >
                  <div>
                    <div class="text-sm font-medium text-gray-900">Is Platform Admin</div>
                  </div>

                  <label
                    class={[
                      'relative inline-flex items-center',
                      drawerSaving.value || drawerLoading.value
                        ? 'cursor-not-allowed'
                        : 'cursor-pointer',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      class="sr-only peer"
                      disabled={drawerSaving.value || drawerLoading.value}
                      checked={formState.value.isPlatformAdmin}
                      onChange={(e) =>
                        (formState.value.isPlatformAdmin = (e.target as HTMLInputElement).checked)
                      }
                    />
                    <div
                      class={[
                        'w-11 h-6 rounded-full peer',
                        'bg-gray-200 peer-checked:bg-blue-600',
                        "after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
                        'peer-checked:after:translate-x-full',
                      ].join(' ')}
                    />
                  </label>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium">User Status</label>
                  <select
                    class={[
                      'w-full rounded border py-2 px-3 outline-none bg-white',
                      formErrors.value.status ? 'border-red-500' : 'border-gray-300',
                      drawerSaving.value || drawerLoading.value
                        ? 'opacity-50 cursor-not-allowed'
                        : '',
                    ].join(' ')}
                    disabled={drawerSaving.value || drawerLoading.value}
                    value={formState.value.status}
                    onChange={(e) =>
                      (formState.value.status = (e.target as HTMLSelectElement).value)
                    }
                  >
                    <option value="">Select a status</option>
                    {userStatuses.value?.map((status) => (
                      <option key={status.id} value={status.code}>
                        {status.display_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.value.status && (
                    <span class="text-xs text-red-500">{formErrors.value.status}</span>
                  )}
                </div>

                {formState.value.isPlatformAdmin && (
                  <MultiSelectDropdown
                    label="Community List"
                    placeholder="Select communities"
                    options={communityOptions.value}
                    modelValue={formState.value.communityIds as string[]}
                    disabled={drawerSaving.value || drawerLoading.value}
                    onUpdate:modelValue={(next: string[]) =>
                      (formState.value.communityIds = next as EntityId[])
                    }
                  />
                )}
              </div>
            ),
            footer: () => (
              <>
                <Button variant="outline" onClick={closeDrawer} disabled={drawerSaving.value}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={drawerSaving.value}
                  disabled={drawerSaving.value || drawerLoading.value}
                  onClick={handleSubmit}
                >
                  {drawerMode.value === 'add' ? 'Create' : 'Save'}
                </Button>
              </>
            ),
          }}
        </FormDrawer>

        <DeleteConfirmModal
          show={deleteModalOpen.value}
          title="Delete User"
          message={`Are you sure you want to delete ${deletingUserName.value}?`}
          onConfirm={confirmDelete}
          onCancel={() => {
            deleteModalOpen.value = false
            deletingUserId.value = null
            deletingUserName.value = ''
          }}
        />
      </div>
    )
  },
})
