export const autoRoutes: RouteConfig[] = [
  {
    name: 'root',
    path: '/',
    redirectTo: '/home',
    showSidebar: false,
  },
  {
    name: 'home',
    path: '/home',
    title: 'Home',
    element: () => import('./home'),
  },
]
