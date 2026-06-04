import { type RouteRecordRaw } from 'vue-router'
import SessionsPage from './pages/SessionsPage'
import CreateSession from './pages/CreateSession'

export const sessionsRoutes: RouteRecordRaw[] = [
  {
    path: 'sessions',
    name: 'Sessions',
    component: SessionsPage,
  },

  {
    path: 'sessions/:id',
    name: 'EditSession',
    component: CreateSession,
  },

  {
    path: 'sessions/create',
    name: 'CreateSessions',
    component: CreateSession,
  },
]
