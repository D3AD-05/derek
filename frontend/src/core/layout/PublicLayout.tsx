import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import PublicNavBar from '../components/navbar/PublicNavBar'

export default defineComponent({
  name: 'PublicLayout',

  setup() {
    return () => (
      <div class="min-h-screen flex flex-col bg-white">
        {/* Top Header */}
        <PublicNavBar />

        {/* Page Content */}
        <main class="flex-1 flex items-center justify-center px-4">
          <RouterView />
        </main>

        {/* Footer */}
        {/* <Footer /> */}
      </div>
    )
  },
})
