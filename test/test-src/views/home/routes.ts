import type { RouteConfig } from '../../../../lib'

export const autoRoutes: RouteConfig[] = [
  {
    name: 'root',
    path: '/',
    redirectTo: '/home',
  },
  {
    name: 'home',
    path: '/home',
    title: 'Home',
    element: () => import('./home'),
  },
]
