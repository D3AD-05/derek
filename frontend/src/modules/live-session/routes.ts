import type { RouteRecordRaw } from 'vue-router'
import LiveSession from './page/LiveSession'
import JoinSession from './page/JoinSession'
import ParticipantSession from './page/ParticpiantSession'
import LeaderBoard from './page/LeaderBoard'

export const liveSessionsRoutes: RouteRecordRaw[] = [
  {
    path: 'session/:id/live',
    name: '/LiveSession',
    component: LiveSession,
  },
]

export const liveSessionsPublicRoutes: RouteRecordRaw[] = [
  {
    path: ':id/join',
    name: 'JoinSession',
    component: JoinSession,
  },
  {
    path: ':id/play',
    name: 'ParticipantSession',
    component: ParticipantSession,
  },
  {
    path: ':id/leaderboard',
    name: 'LeaderBoard',
    component: LeaderBoard,
  },
]
