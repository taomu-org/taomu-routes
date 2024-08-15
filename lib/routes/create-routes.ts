/**
 *
 * 自动导入 views 文件夹下所有的 routes.tsx? (export.autoRoutes) 以生成路由
 *
 * 通过 `$.routes.routes` 获取全局路由对象
 */

import { checkPathParamsUnique, formatPreviewName } from './route-tools'

export interface CreateRoutesOptions {
  /** 路由模块 (import.meta.glob) */
  modules: Record<string, unknown>
  /** 默认路由配置 */
  defaultConfig?: Partial<RouteConfig>
  /** 路由文件导出的字段名 默认: autoRoutes */
  exportKey?: string
}

/** 以 name 为 key 的路由 Map */
export const routes: Map<string, RouteConfig> = new Map()

/**
 * 创建路由
 *
 * @param options
 * @returns
 */
export function createAutoRoutes(options: CreateRoutesOptions): Map<string, RouteConfig> {
  const { modules, defaultConfig, exportKey = 'autoRoutes' } = options || {}

  routes.clear()

  /** 自动导入的路由文件 */
  const moduleValues = Object.values(modules)
  /** 等待创建的预览路由参数集合 (后置创建，因为要查找目标路由) */
  const previewRouteParams: Parameters<typeof addDrawerPreviewRoute>[] = []

  if (!moduleValues.length) {
    console.warn('[createAutoRoutes] 没有找到路由文件')
    return routes
  }

  /**
   * 添加一个路由
   *
   * @param conf
   */
  function addRouteConfig(conf: RouteConfig) {
    if (conf.path && !checkPathParamsUnique(conf.path)) {
      throw new Error(`[addRouteConfig] 致命错误: 路由路径 "${conf.path}" 中存在重复参数`)
    }
    routes.set(conf.name, conf)
  }

  /**
   * 添加抽屉路由
   *
   * @param route
   * @param previewItem
   * @returns
   */
  function addDrawerPreviewRoute(route: RouteConfig, previewItem: PreviewDrawerConfig) {
    if (!previewItem) return // 理论上不可能出现这种情况，这里主要用于回避 TS 类型校验

    const targetRouteConfig = routes.get(previewItem.targetName)
    if (!targetRouteConfig) {
      throw new Error(
        `[addDrawerPreviewRoute] 致命错误: 没有找到目标路由，previewDrawer['targetName'] <${previewItem.targetName}> 需要与目标路由 name 一致`
      )
    }

    const routePath = `${route.path}/preview${targetRouteConfig.path}`

    const nextConf: RouteConfig = {
      ...route,
      name: formatPreviewName(route.name, previewItem.targetName),
      targetRouteConfig,
      isPreviewRoute: true,
      isStatic: previewItem.isStatic ?? true,
      path: routePath,
      autoReplaceLayoutQuery: false,
    }

    addRouteConfig(nextConf)
  }

  /**
   * 展开子路由
   *
   * @param routes
   * @param parent
   */
  function flatRoutes(routes: RouteConfig | RouteConfig[], parent?: RouteConfig) {
    const routesH = Array.isArray(routes) ? routes : [routes]

    routesH.forEach((conf) => {
      if (parent) {
        conf.parentNamePath = parent.parentNamePath ? parent.parentNamePath.concat(parent.name) : [parent.name]
        conf.parent = parent
      }

      if (Array.isArray(conf.routes) && conf.routes.length) {
        // if (conf.path) {
        //   console.warn(`路由配置异常 [${conf.name}]：配有 routes 子路由的情况下不应存在 path 字段`)
        // }
        flatRoutes(conf.routes, conf)
      }

      const assignConf = Object.assign({}, defaultConfig, conf)

      if (assignConf.previewDrawer) {
        assignConf.previewDrawer.forEach((previewItem) => {
          previewRouteParams.push([assignConf, previewItem])
        })
      }

      addRouteConfig(assignConf)
    })
  }

  // 创建页面路由
  moduleValues.forEach((item: any) => {
    if (typeof item === 'function') {
      throw new Error('[createAutoRoutes] modules 异常, 调用 import.meta.glob 时请使用 { eager: true }')
    }

    const conf: RouteConfig | RouteConfig[] | undefined = item[exportKey]

    if (!conf) {
      console.warn(`[createAutoRoutes] 路由配置异常 [${item.name}]:未导出 ${exportKey} 字段`)
      return
    }
    flatRoutes(conf)
  })

  // 创建抽屉路由
  previewRouteParams.forEach(([conf, targetName]) => {
    addDrawerPreviewRoute(conf, targetName)
  })

  return routes
}
