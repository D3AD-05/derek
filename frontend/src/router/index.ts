import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Login from '@/modules/auth/pages/Login'
import UserList from '@/modules/users/pages/list'
import PrivateLayout from '@/core/layout/PrivatLayout'
import PublicLayout from '@/core/layout/PublicLayout'
import ChangePassword from '@/modules/auth/pages/ChangePassword'
import ResetPassword from '@/modules/auth/pages/ResetPassword'
import { dashboardRoutes } from '@/modules/dashboard/routes'
import { questionBankRoutes } from '@/modules/question/route'
import { sessionsRoutes } from '@/modules/sessions/routes'
import { liveSessionsPublicRoutes, liveSessionsRoutes } from '@/modules/live-session/routes'
import { adminRoutes } from '@/modules/admin/routes'
import { pinia } from '@/core/store/pinia'
import { useAuthStore } from '@/modules/auth/store'
import AdminLayout from '@/core/layout/AdminLayout'

const routes: RouteRecordRaw[] = [
  // Public session join/play routes
  {
    path: '/session',
    component: PublicLayout,
    meta: { isPublic: true },
    children: [...liveSessionsPublicRoutes],
  },
  // Public routes with PublicLayout
  {
    path: '/auth',
    component: PublicLayout,
    meta: { isPublic: true },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
      },
      {
        path: '/reset-password',
        name: 'ResetPassword',
        component: ResetPassword,
        meta: { isPublic: true },
      },
    ],
  },

  // Private routes with PrivateLayout
  {
    path: '/',
    component: PrivateLayout,
    meta: { requiresAuth: true },
    children: [
      ...dashboardRoutes,
      ...questionBankRoutes,
      ...sessionsRoutes,
      ...liveSessionsRoutes,
      {
        path: 'user',
        name: 'UserList',
        component: UserList,
      },
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: ChangePassword,
      },
    ],
  },
  {
    path: '/admin',
    meta: { requiresAuth: true },
    component: AdminLayout,
    children: [...adminRoutes],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore(pinia)
  const isPublicRoute = to.matched.some((record) => Boolean(record.meta?.isPublic))
  const requiresAuth = to.matched.some((record) => Boolean(record.meta?.requiresAuth))

  if (requiresAuth && !auth.token) {
    return {
      path: '/auth/login',
      query: { redirect: to.fullPath },
    }
  }

  if (isPublicRoute && auth.token && to.path.startsWith('/auth')) {
    return '/'
  }

  return true
})

export default router
