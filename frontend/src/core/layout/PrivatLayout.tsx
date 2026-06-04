import { defineComponent, ref } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from '../components/navbar/Navbar'
import Sidebar from '../components/sidebar/Sidebar'

// import Footer from "@/components/Footer"

export default defineComponent({
  name: 'PrivateLayout',

  setup() {
    const isCollapsed = ref(false)

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
    }

    return () => (
      <div class="min-h-screen flex flex-col bg-gray-100">
        {/* Top Navbar */}
        <Navbar isCollapsed={isCollapsed.value} onToggle={toggleSidebar} />

        {/* Main Area */}
        <div class="flex flex-1 overflow-hidden pt-16">
          {/* Sidebar */}
          <Sidebar isCollapsed={isCollapsed.value} />

          {/* Page Content */}
          <main
            class={[
              'flex-1 overflow-y-auto p-6 transition-all duration-300',
              isCollapsed.value ? 'ml-16' : 'ml-64',
            ]}
          >
            <RouterView />
          </main>
        </div>

        {/* Footer */}
        {/* <Footer /> */}
      </div>
    )
  },
})
