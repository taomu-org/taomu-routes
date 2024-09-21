# taomu-routes

base: react-router-dom

## Install

```sh
npm install taomu-routes
```

## Import Global Types

in `tsconfig.json`

```json5
{
  // ...
  "compilerOptions": {
    // ...
    "types": [
      // ...
      "taomu-routes/types"
    ]
  }
}
```

## Create routes

in `src/main.ts`

```tsx
import React from 'react'
import { createRoot } from 'react-dom/client'

import { AutoRoutes, AppRouter } from 'taomu-routes'

// with vite
const routes = new AutoRoutes(import.meta.glob('./views/**/routes.(ts|tsx)', { eager: true }))

const root = createRoot(document.getElementById('root')!)

root.render(
  <div>
    <React.StrictMode>
      <AppRouter routes={routes} />
    </React.StrictMode>
  </div>
)
```

## Route Config

in `src/views/**/routes.ts`

```ts
export const autoRoutes: RouteConfig[] = [
  {
    name: 'home',
    path: '/home',
    title: 'Home',
    element: () => import('./home'),
  },
]
```

## Navigation

You can use 'navigateTo' to navigate to any route from anywhere.

```ts
import { routeTools } from 'taomu-routes'

routeTools.navigateToByRouteName('home')

// or

routeTools.navigateTo('/home')
```

## Link

You can use 'Link' to navigate to any route in `AppRouter` context.

```tsx
import { Link } from 'taomu-routes'

const Comp = () => {
  return (
    <div>
      <Link name="home">To Home</Link>
      {/* or */}
      <Link to="/home">To Home</Link>
    </div>
  )
}
```
