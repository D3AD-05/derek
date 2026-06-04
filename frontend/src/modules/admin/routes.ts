export const adminRoutes = [
  {
    path: '',
    name: 'adminPannel',
    component: () => import('./pages/AdminPanel'),
  },
  {
    path: 'users',
    name: 'adminUserManagement',
    component: () => import('./pages/UserManagement'),
  },
  {
    path: 'communities',
    name: 'adminCommunityManagement',
    component: () => import('./pages/CommunityManagement'),
  },
]
