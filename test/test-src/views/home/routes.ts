import type { RouteConfig } from '../../../../lib'

export const autoRoutes: RouteConfig[] = [
  {
    name: 'home',
    path: '/home',
    title: 'Home',
    element: () => import('./home'),
  },
]
