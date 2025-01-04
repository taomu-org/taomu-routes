import React from 'react'
import { LinkProps as ReactRouterLinkProps, useHref } from 'react-router'

import { RoutesId, AutoRoutes } from '../routes/auto-routes'
import { navigateTo, type NavigateToByRouteNameOptions, formatRoutePath } from '../routes/route-tools'

export interface LinkProps extends Omit<ReactRouterLinkProps, 'to'>, NavigateToByRouteNameOptions {
  to?: string
  name?: string
  routesId?: RoutesId
}

export const Link: React.FC<LinkProps> = ({ children, query, params, to, name, routesId, ...wrapProps }) => {
  let ptahH = to

  if (name) {
    const routeConfig = AutoRoutes.findRouteByName(name, routesId)
    if (routeConfig) {
      ptahH = routeConfig.path
    } else {
      console.warn(`Link: Route<${name}> not found`)
    }
  }

  if (!ptahH) {
    return <a {...wrapProps}>{children}</a>
  }

  const targetPath = useHref(formatRoutePath(ptahH, params, query))

  return (
    <a
      {...wrapProps}
      href={targetPath}
      onClick={(e) => {
        if (e.ctrlKey || wrapProps.target) {
          return
        }
        e.preventDefault()
        navigateTo(targetPath, wrapProps)
      }}
    >
      {children}
    </a>
  )
}
