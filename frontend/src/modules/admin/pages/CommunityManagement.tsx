import { defineComponent, computed, onMounted, ref } from 'vue'
import DataTable from '@/core/components/dataTable/DataTable'
import Button from '@/core/components/button/Button'
import DeleteConfirmModal from '@/core/components/modals/DeleteConfirmModal'
import TextField from '@/core/components/inputFields/TextField/TextField'
import MultiSelectDropdown from '@/modules/admin/components/MultiSelectDropdown'
import { useToast } from '@/core/composables/useToast'
import FormDrawer from '@/modules/admin/components/FormDrawer'
import type { EntityId, CommunityListParams } from '@/modules/admin/types'
import { useCommunityStore } from '../store/communityStore'
import { useUserStore } from '../store/userStore'
import {
  CreateCommunityApi,
  UpdateCommunityApi,
  DeleteCommunityApi,
} from '@/modules/admin/services/communityService'

export default defineComponent({
  name: 'CommunityManagement',

  setup() {
    const toast = useToast()
    const communityStore = useCommunityStore()
    const userStore = useUserStore()

    const drawerOpen = ref(false)
    const drawerMode = ref<'add' | 'edit'>('add')
    const drawerLoading = ref(false)
    const drawerSaving = ref(false)
    const editingCommunityId = ref<EntityId | null>(null)

    // Form state
    const formState = ref({
      name: '',
      userIds: [] as string[],
    })
    const formErrors = ref<Record<string, string>>({})

    const deleteModalOpen = ref(false)
    const deletingCommunityId = ref<EntityId | null>(null)
    const deletingCommunityName = ref('')

    const page = ref(1)
    const pageSize = ref(10)
    const search = ref('')

    // Access store properties directly
    const communities = computed(() => communityStore.communityList?.items || [])
    const loading = computed(() => communityStore.loading)
    const users = computed(() => userStore.userList?.items || [])
    const userOptions = computed(() =>
      users.value.map((u) => ({
        label: `${u.name} (${u.email})`,
        id: String(u.id),
      })),
    )

    const buildListParams = (next?: {
      page?: number
      pageSize?: number
      search?: string
    }): CommunityListParams => {
      const nextPage = next?.page ?? page.value
      const nextPageSize = next?.pageSize ?? pageSize.value
      const nextSearch = next?.search ?? search.value

      return {
        pagination: {
          limit: nextPageSize,
          offset: (nextPage - 1) * nextPageSize,
        },
        search: nextSearch?.trim() ? nextSearch : undefined,
      }
    }

    onMounted(async () => {
      await Promise.all([loadCommunities(buildListParams()), userStore.fetchUserList()])
    })

    const loadCommunities = async (params?: CommunityListParams) => {
      try {
        await communityStore.fetchCommunityList(params)
      } catch (error) {
        console.error(error)
      }
    }

    const handleTableChange = async (params: {
      page: number
      pageSize: number
      search: string
    }) => {
      page.value = params.page
      pageSize.value = params.pageSize
      search.value = params.search
      await loadCommunities(
        buildListParams({
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
        }),
      )
    }

    const columns = [
      { key: 'name', label: 'Community Name' },
      { key: 'users', label: 'Users', width: '350px' },
      { key: 'created_at', label: 'Created At' },
    ]

    const rows = computed(() => {
      return communities.value.map((c) => ({
        id: c.id,
        name: c.name,
        users: c.users?.map((u) => `${u.name} (${u.email})`).join(', ') || 'No users',
        created_at: c.created_at ? new Date(c.created_at).toLocaleDateString() : '-',
      }))
    })

    const resetFormState = () => {
      formState.value = {
        name: '',
        userIds: [],
      }
      formErrors.value = {}
    }

    const validateForm = () => {
      const next: Record<string, string> = {}

      if (!formState.value.name.trim()) next.name = 'Community name is required.'

      formErrors.value = next
      return Object.keys(next).length === 0
    }

    const openAdd = () => {
      drawerMode.value = 'add'
      editingCommunityId.value = null
      resetFormState()
      drawerOpen.value = true
    }

    const openEdit = (row: any) => {
      const id = row?.id as EntityId
      drawerMode.value = 'edit'
      drawerLoading.value = true
      editingCommunityId.value = id

      communityStore
        .fetchCommunity(typeof id === 'string' ? parseInt(id) : id)
        .then((community) => {
          formState.value = {
            name: community.name,
            userIds: community.users?.map((u) => String(u.id)) || [],
          }
          drawerOpen.value = true
        })
        .catch((error) => {
          toast.error('Failed to fetch community details.')
          console.error(error)
        })
        .finally(() => {
          drawerLoading.value = false
        })
    }

    const openDelete = (row: any) => {
      deletingCommunityId.value = row?.id as EntityId
      deletingCommunityName.value = row?.name ?? 'this community'
      deleteModalOpen.value = true
    }

    const confirmDelete = async () => {
      if (!deletingCommunityId.value) return

      try {
        await DeleteCommunityApi(
          typeof deletingCommunityId.value === 'string'
            ? parseInt(deletingCommunityId.value)
            : deletingCommunityId.value,
        )
        toast.success('Community deleted successfully.')
        await loadCommunities()
      } catch (e: any) {
        toast.error(e?.message ?? 'Failed to delete community.')
      } finally {
        deleteModalOpen.value = false
        deletingCommunityId.value = null
        deletingCommunityName.value = ''
      }
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      drawerSaving.value = true
      try {
        const backendData = {
          name: formState.value.name.trim(),
          user_ids: formState.value.userIds.map((id) =>
            typeof id === 'string' ? parseInt(id) : id,
          ),
        }

        if (drawerMode.value === 'add') {
          await CreateCommunityApi(backendData as any, { return_data: true })
          toast.success('Community created successfully.')
        } else {
          if (!editingCommunityId.value) throw new Error('Missing community id.')
          await UpdateCommunityApi(editingCommunityId.value, backendData as any, {
            return_data: true,
          })
          toast.success('Community updated successfully.')
        }

        await loadCommunities()
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
    }

    return () => (
      <div class="space-y-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-black">Community Management</h1>
            <p class="text-sm text-gray-900">Create, update, and manage communities.</p>
          </div>
        </div>

        <DataTable
          title="Communities"
          subtitle="Manage community accounts"
          columns={columns}
          data={rows.value}
          total={communityStore.communityList?.total_count ?? 0}
          page={page.value}
          pageSize={pageSize.value}
          loading={loading.value}
          onEdit={openEdit}
          onDelete={openDelete}
          onChange={handleTableChange}
          showSearch
          searchPlaceholder="Search communities..."
        >
          {{
            headerAction: () => (
              <Button variant="primary" onClick={openAdd}>
                + Add Community
              </Button>
            ),
          }}
        </DataTable>

        <FormDrawer
          isOpen={drawerOpen.value}
          onClose={closeDrawer}
          title={drawerMode.value === 'add' ? 'Add Community' : 'Edit Community'}
          description="Manage communities."
        >
          {{
            default: () => (
              <div class="space-y-4">
                <TextField
                  label="Community Name"
                  placeholder="Enter community name"
                  modelValue={formState.value.name}
                  error={formErrors.value.name}
                  disabled={drawerSaving.value || drawerLoading.value}
                  onUpdate:modelValue={(v: string) => (formState.value.name = v)}
                />
                <MultiSelectDropdown
                  label="Users"
                  placeholder="Select users"
                  options={userOptions.value}
                  modelValue={formState.value.userIds}
                  disabled={drawerSaving.value || drawerLoading.value}
                  onUpdate:modelValue={(v: string[]) => (formState.value.userIds = v)}
                />
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
          title="Delete Community"
          message={`Are you sure you want to delete ${deletingCommunityName.value}?`}
          onConfirm={confirmDelete}
          onCancel={() => {
            deleteModalOpen.value = false
            deletingCommunityId.value = null
            deletingCommunityName.value = ''
          }}
        />
      </div>
    )
  },
})
