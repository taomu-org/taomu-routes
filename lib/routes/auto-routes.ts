import { checkPathParamsUnique } from './route-tools'

export type RoutesId = string

export interface CreateRoutesOptions {
  /** 默认路由配置 */
  defaultConfig?: Partial<RouteConfig>
  /** 路由文件导出的字段名 默认: autoRoutes */
  exportKey?: string
}

export class AutoRoutes extends Map<string, RouteConfig> {
  /** 所有已创建的路由实例 */
  public static allRoutesMapStorage = new Map<RoutesId, AutoRoutes>()

  /** 通过 name 查找路由 */
  public static findRouteByName = (name: string, routesId?: RoutesId): RouteConfig | void => {
    let routesIns: AutoRoutes | undefined

    if (routesId) {
      routesIns = AutoRoutes.allRoutesMapStorage.get(routesId)
    } else if (AutoRoutes.allRoutesMapStorage.size > 1) {
      throw new Error(`Multiple AutoRoutes instances exist, RoutesId is required.`)
    } else {
      routesIns = AutoRoutes.allRoutesMapStorage.values().next().value
    }

    return routesIns?.get(name)
  }

  constructor(
    /** 唯一路由 id */
    public id: RoutesId,
    /** 路由模块 (import.meta.glob) */
    public modules: Record<string, unknown>,
    /** 配置项 */
    public options: CreateRoutesOptions = {}
  ) {
    super()

    if (AutoRoutes.allRoutesMapStorage.has(this.id)) {
      throw new Error(`createAutoRoutes: Routes cannot be created repeatedly in the same reference<${this.id}>.`)
    }

    this.createAutoRoutes()

    AutoRoutes.allRoutesMapStorage.set(this.id, this)
  }

  /**
   * 创建路由
   */
  private createAutoRoutes = () => {
    const { exportKey = 'autoRoutes' } = this.options || {}

    /** 自动导入的路由文件 */
    const moduleValues = Object.values(this.modules)

    if (!moduleValues.length) {
      console.warn('createAutoRoutes: Route modules is empty')
      return
    }

    // 创建页面路由
    moduleValues.forEach((item: any) => {
      if (typeof item === 'function') {
        throw new Error('createAutoRoutes: modules exception, please use { eager: true } when calling import.meta.glob')
      }

      const conf: RouteConfig | RouteConfig[] | undefined = item[exportKey]

      if (!conf) {
        console.warn(`createAutoRoutes: Routing configuration exception [${item.name}]: ${exportKey} field is not exported`)
        return
      }
      this.flatRoutes(conf)
    })
  }

  /**
   * 添加一个路由
   */
  public addRouteConfig = (conf: RouteConfig) => {
    if (this.has(conf.name)) {
      throw new Error(`addRouteConfig: Route<${conf.name}> already exists`)
    }

    if (conf.path && !checkPathParamsUnique(conf.path)) {
      throw new Error(`addRouteConfig: Fatal error: Duplicate parameters in routing path "${conf.path}"`)
    }
    this.set(conf.name, conf)
  }

  /**
   * 展开子路由
   */
  private flatRoutes = (routes: RouteConfig | RouteConfig[], parent?: RouteConfig) => {
    const routesH = Array.isArray(routes) ? routes : [routes]

    routesH.forEach((conf) => {
      if (parent) {
        conf.parentNamePath = parent.parentNamePath ? parent.parentNamePath.concat(parent.name) : [parent.name]
        conf.parent = parent
      }

      if (Array.isArray(conf.routes) && conf.routes.length) {
        this.flatRoutes(conf.routes, conf)
      }

      const assignConf: RouteConfig = Object.assign({}, this.options.defaultConfig, conf)

      this.addRouteConfig(assignConf)
    })
  }
}
