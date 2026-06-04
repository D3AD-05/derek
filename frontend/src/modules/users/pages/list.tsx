// src/modules/users/pages/UserList.tsx
import { defineComponent, onMounted, ref } from 'vue'
import { getUsers } from '../services'
import type { PaginatedUsers } from '../types'

export default defineComponent({
  name: 'UserList',

  setup() {
    const users = ref<PaginatedUsers>()
    const loading = ref(false)
    const error = ref<string | null>(null)

    onMounted(async () => {
      loading.value = true
      try {
        const response = await getUsers()

        // Access full response details
        if (response.code === 200) {
          users.value = response.data
        }
      } catch (err: any) {
        error.value = err?.response?.status
          ? `Request failed (${err.response.status})`
          : 'Unknown error'
      } finally {
        loading.value = false
      }
    })

    return () => (
      <div style={{ padding: '20px' }}>
        <h2>User list (auth test)</h2>

        {loading.value && <p>Loading…</p>}
        {error.value && <p style={{ color: 'red' }}>{error.value}</p>}

        {!loading.value && !error.value && (
          <ul>
            {users.value?.items.map((user) => (
              <li key={user.id}>{user.email}</li>
            ))}
          </ul>
        )}
      </div>
    )
  },
})
