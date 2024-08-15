import { queryStringify, hasDuplicate } from 'taomu-toolkit'
import type { NavigateOptions } from 'react-router-dom'

import { dispatchCustomEvent } from '../hooks'
import type { RouteChangeParams } from '../defines'

import { routes } from './create-routes'

export interface NavigateToByRouteNameOptions extends NavigateOptions {
  params?: Record<string, any>
  query?: Record<string, any>
}

/**
 * 格式化路由路径
 *
 * @param path
 * @param params
 * @param query
 * @returns
 */
export function formatRoutePath(path: string, params?: Record<string, any>, query?: Record<string, any>) {
  let pathStr = path

  if (typeof params === 'object') {
    const paramsCopy = { ...params }
    pathStr = path.replace(/\:([^\/]+\??)/g, (_, $1: string) => {
      let isRequired = true
      if ($1.endsWith('?')) {
        isRequired = false
        $1 = $1.slice(0, -1)
      }

      const value = paramsCopy[$1]

      if (isRequired && value === undefined) {
        console.error(
          `formatRoutePath: The parameter ${$1} is not defined, the field is not passed in, or the parameter name is duplicated`
        )
        return $1
      }

      delete paramsCopy[$1]
      return value ?? ''
    })
  }

  if (typeof query === 'object') {
    pathStr += queryStringify(query)
  }

  return pathStr
}

/**
 * 通过 routeName 获取路由 Path
 *
 * @param name
 * @param params
 * @param query
 * @returns
 */
export function getRoutePathByName(
  name: string,
  { params, query }: { params?: Record<string, any>; query?: Record<string, any> } = {}
) {
  const routeConfig = routes.get(name)
  if (!routeConfig) throw new Error(`getRoutePathByName: Route<${name}> not found`)
  if (!routeConfig.path) throw new Error(`getRoutePathByName: The Route<${name}> path field does not exist`)

  return formatRoutePath(routeConfig.path, params, query)
}

/**
 * 检查路由路径参数唯一性
 *
 * - 通过条件：无参数 或 参数名称没有重复
 * - 通过返回 true
 *
 * @param path
 */
export function checkPathParamsUnique(path: string): boolean {
  const params = path.match(/\:([^\/]+)/g)
  if (!params || !params.length) return true // 无参数

  return !hasDuplicate(params)
}

/** 路由跳转 */
export function navigateTo(to: RouteChangeParams['to'], options?: NavigateOptions) {
  dispatchCustomEvent('app:route:change', { to, options })
}

/** 通过 routeName 跳转路由 (当前项目) */
export function navigateToByRouteName(name: string, { params, query, ...options }: NavigateToByRouteNameOptions = {}) {
  const path = getRoutePathByName(name, { params, query })
  return navigateTo(path, options)
}

/** 返回上一页 */
export function goBack(num = -1) {
  navigateTo(num)
}
