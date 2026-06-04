import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { LayoutDashboard, FileQuestionMark, Clock } from 'lucide-vue-next'

export default defineComponent({
  name: 'SideBar',
  props: {
    isCollapsed: Boolean,
  },

  setup(props) {
    const menu = [
      { name: 'Dashboard', icon: <LayoutDashboard />, path: '/' },
      { name: 'Question Bank', icon: <FileQuestionMark />, path: '/question-bank' },
      { name: 'Session', icon: <Clock />, path: '/sessions' },
    ]

    // menu.map((item) => {
    //   console.log(item.path)
    // })

    return () => (
      <aside
        class={[
          'fixed left-0 top-16 bottom-0 bg-white transition-all duration-300 flex flex-col z-40 shadow-lg border-r border-secondary-200',
          props.isCollapsed ? 'w-16' : 'w-64',
        ]}
      >
        {/* Menu */}
        <nav class="flex-1 p-2 space-y-1 mt-4">
          {menu.map((item) => (
            <RouterLink
              to={item.path}
              class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary-200 transition-colors group"
              exactActiveClass="bg-secondary-200"
            >
              <span class="text-xl text-secondary-600 group-hover:text-secondary-800 transition-colors">
                {item.icon}
              </span>

              {!props.isCollapsed && (
                <span class="text-sm font-medium text-secondary-800">{item.name}</span>
              )}
            </RouterLink>
          ))}
        </nav>
      </aside>
    )
  },
})
