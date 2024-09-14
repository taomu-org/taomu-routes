import React from 'react'
import {
  BrowserRouter,
  type BrowserRouterProps,
  HashRouter,
  Routes,
  Route,
  Navigate,
  RouteProps,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom'
import { parseQuery } from 'taomu-toolkit'

import { type AutoRoutes, routeTools } from '../routes'
import { useCustomEvent } from '../hooks'
import { RouteContext } from './router.ctx'
import { AsyncImport, type AsyncImportProps } from './async-import'

export interface AppRouterProps
  extends BrowserRouterProps,
    Pick<AsyncImportProps, 'beforeRouter' | 'permissionCodeMap' | 'importErrorFC' | 'importLoadingFC'> {
  routes: AutoRoutes
  routeType?: 'hash' | 'browser'
  contextValue?: Partial<RouteContextType>
  /** 包裹 Route Item 的函数组件 */
  layoutFC?: React.FC<any>
}

/**
 * AppRouter
 */
export const AppRouter = React.memo<AppRouterProps>((props) => {
  const { routeType = 'browser', layoutFC, ...routerProps } = props
  const Router = routeType === 'hash' ? HashRouter : BrowserRouter

  return (
    <Router {...routerProps}>
      <Routes>{createRoutes(props)}</Routes>
    </Router>
  )
})

/**
 * 创建路由列表
 * @param routes
 * @returns
 */
function createRoutes(createProps: AppRouterProps): JSX.Element[] {
  const res: JSX.Element[] = []
  let noMatch: JSX.Element | undefined = undefined

  createProps.routes.forEach((conf) => {
    const routeEl = createRouteItem(conf, createProps)

    if (conf.path === '*') {
      noMatch = routeEl
    } else {
      res.push(routeEl)
    }
  })

  if (noMatch) {
    res.push(noMatch)
  }
  // else {
  //   res.push(createRouteItem(defaultErrorPageRoute, createProps)) // 注入默认404页
  // }

  return res
}

/**
 * 创建路由元素
 * @param routeConfig
 * @param key
 * @returns
 */
function createRouteItem(routeConfig: RouteConfig, createProps: AppRouterProps) {
  const { name, path, redirectTo, element, ...params } = routeConfig
  const { layoutFC: LayoutFC, beforeRouter, importErrorFC, importLoadingFC } = createProps

  const routeProps: RouteProps = {
    path,
  }

  const nextProps = {
    name,
    path,
    ...params,
  }

  if (!element || redirectTo) {
    routeProps.element = <Navigate to={redirectTo || '/'} {...nextProps} />
  } else if (element instanceof Promise || typeof element === 'function') {
    routeProps.element = (
      <RouteCtx createProps={createProps} routeConfig={routeConfig}>
        {(routeHooksParams) => {
          let elementEl: React.ReactNode = null
          const pageProps = { ...nextProps, ...routeHooksParams }
          const isPromise = element instanceof Promise
          const elementRes = isPromise ? element : element({ ...nextProps, ...routeHooksParams })

          if (elementRes instanceof Promise) {
            elementEl = (
              <AsyncImport
                {...pageProps}
                element={elementRes}
                beforeRouter={beforeRouter}
                importErrorFC={importErrorFC}
                importLoadingFC={importLoadingFC}
              />
            )
          } else {
            elementEl = elementRes
          }

          if (!LayoutFC) {
            return (
              <div data-env={pageProps.BUILD_ENV} data-route={name} {...nextProps.contentProps}>
                {elementEl}
              </div>
            )
          }

          return (
            <LayoutFC data-env={pageProps.BUILD_ENV} data-route={name} {...nextProps.contentProps}>
              {elementEl}
            </LayoutFC>
          )
        }}
      </RouteCtx>
    )
  } else {
    throw new Error(`Route config error! \n ${JSON.stringify(routeConfig, undefined, 2)}`)
  }

  return <Route key={name} {...routeProps} />
}

interface RouterContextProps {
  children: (props: RouteContextType) => React.ReactNode
  createProps: AppRouterProps
  routeConfig: RouteConfig
}

export function RouteCtx({ children, createProps }: RouterContextProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const query = Object.assign(parseQuery(window.location.search), parseQuery(location.search))

  if (!location.state) {
    location.state = {} // 防止 state 解构报错
  }

  useCustomEvent(routeTools.getNavigateEventKey(createProps.routes), ({ detail }) => {
    if (!detail) return

    let toPath = detail.to

    if (typeof toPath === 'number') {
      navigate(toPath)
      return
    }

    if (toPath && createProps.basename) {
      toPath = toPath.replace(new RegExp(`^/?${createProps.basename}(/)`), '$1')
    }

    if (!toPath.startsWith('/')) {
      toPath = '/' + toPath
    }

    navigate(toPath, detail.options)
  })

  const ctxValue: RouteContextType = {
    ...createProps.contextValue,
    createProps,
    location,
    navigate,
    query,
    params,
  }

  return <RouteContext.Provider value={ctxValue}>{children(ctxValue)}</RouteContext.Provider>
}
