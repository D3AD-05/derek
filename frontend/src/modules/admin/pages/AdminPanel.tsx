import Button from '@/core/components/button/Button'
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'AdminPanel',

  setup() {
    return () => (
      <div class="space-y-6">
        <div>
          <h1 class="text-4xl font-bold text-white">Admin </h1>
          <p class="text-sm text-gray-300">Manage users and communities.</p>
        </div>

        <div class="flex flex-wrap gap-3">
          <RouterLink to="/admin/users">
            <Button variant="primary">Go to Users</Button>
          </RouterLink>
          <RouterLink to="/admin/communities">
            <Button variant="outline">Go to Communities</Button>
          </RouterLink>
        </div>
      </div>
    )
  },
})
