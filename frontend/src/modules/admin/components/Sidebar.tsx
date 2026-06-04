import { User2, Users2 } from "lucide-vue-next";
import { defineComponent } from "vue";
import { RouterLink } from "vue-router";

export default defineComponent({
    name: 'Sidebar',

    props: {
    isCollapsed: Boolean,
  },
  setup(props){
     const menu = [
      { name: 'Communities', icon: <Users2 />, path: '/admin/communities' },
      { name: 'Users', icon: <User2 />, path: '/admin/users' },
    ]

    return()=>(
         <aside
        class={[
          'fixed left-0 top-16 bottom-0  bg-slate-100 transition-all duration-300 flex flex-col z-40 shadow-lg border-r border-white/10',
          props.isCollapsed ? 'w-16' : 'w-64',
        ]}
      >
        <nav class="flex-1 p-2 space-y-1 mt-4">

          {menu.map((item) => (
            <RouterLink
              to={item.path}
              class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary-200 transition-colors group"
              exactActiveClass="bg-secondary-200"
            >
              <span class="text-xl text-secondary-800 group-hover:text-secondary-800 transition-colors">
                {item.icon}
              </span>

              {!props.isCollapsed && (
                <span class="text-sm font-medium text-secondary-600 group-hover:text-secondary-800">{item.name}</span>
              )}
            </RouterLink>
          ))}
        </nav>

      </aside>

    )
  }
})
