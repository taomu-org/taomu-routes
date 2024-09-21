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

  {
    name: 'page1',
    path: '/page1',
    title: 'Page1',
    element: () => import('./page'),
    count: 1,
  },

  {
    name: 'page2',
    path: '/page2',
    title: 'Page2',
    element: () => import('./page'),
    count: 2,
  },
]
