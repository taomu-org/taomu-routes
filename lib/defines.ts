import type { RouteProps, Location, NavigateFunction, NavigateOptions } from 'react-router-dom'
import type { AppRouterProps } from './components'

declare global {
  export interface TaomuRouteConfig extends RouteConfig {}
  export interface TaomuPageProps<Params = Record<string, unknown>, Query = Record<string, unknown>, LocationState = unknown>
    extends PageProps<Params, Query, LocationState> {}
  export interface TaomuBeforeRouterFC<Props, BeforeRouterRes extends Record<string, any>>
    extends ReactBeforeRouterFC<Props, BeforeRouterRes> {}
}

export type RouteElement = Promise<any> | ((props: PageProps) => React.ReactNode | Promise<any>)

export interface RouteConfig extends Omit<RouteProps, 'children' | 'element'>, Record<string, any> {
  element?: RouteElement
  /** 路由的 name,全局唯一 */
  name: string
  /** 路径 */
  path?: string
  /** 重定向 */
  redirectTo?: string
  /**
   * 子路由
   * 子路由 path 与父级不存在嵌套关系
   */
  routes?: RouteConfig[]
  /** 是否静态, 默认 false, 非静态下 url 变更将强制组件重写渲染 */
  isStatic?: boolean
  /** 页面标题 */
  title?: string
  /** 自定义参数, 视情况而定 */
  type?: string
  /** 路由容器 props */
  contentProps?: React.HTMLAttributes<HTMLDivElement>
  /** 关键字 用于检索 */
  keywords?: string[]
  /** 自动替换页面标题 */
  autoReplaceTitle?: boolean
  /**
   * 禁用面包屑跳转
   * 某些带参数的 url 需要激活此选项以禁止点击面包屑时跳转页面
   */
  disableBreadcrumbJump?: boolean
  /** 权限代码, 控制路由能否被访问 */
  permissionCode?: string

  /**
   * 父级路由
   * auto-routes 会根据 RouteConfig 层级自动注入，无需手动声明
   */
  parent?: RouteConfig
  /**
   * 嵌套层级路径，路由 name 的数组
   * 用明确路由嵌套层级
   * auto-routes 会根据 RouteConfig 层级自动注入，无需手动声明
   */
  parentNamePath?: string[]
}

interface RouteLocation<States = unknown> extends Location {
  state: States
}

export interface RouteContextType<Params = Record<string, unknown>, Query = Record<string, unknown>, States = unknown>
  extends Record<string, any> {
  /** 由 location.search 转换来的对象 */
  query: Query
  /** react-router location 对象 */
  location: RouteLocation<States>
  /** react-router 路由跳转方法 */
  navigate: NavigateFunction
  /** 路由参数 */
  params: Params
  /** 根路由创建时传入的 props */
  createProps: AppRouterProps
  /** 构建环境变量 */
  BUILD_ENV?: string
}

interface BeforeRouteProps {
  /**
   * 主动触发当前路由的私有 BeforeRouter 函数, 在 BeforeRouter 中存在数据准备动作且后续需要更新的情况下非常有用
   *
   * #### 注意：
   *
   * - 此方法只会触发私有 BeforeRouter 钩子
   * - 触发 props 更新但不会重新加载组件
   */
  dispatchBeforeRouter?: <Result = any, AddProps extends RouteProps = RouteProps>(addProps?: AddProps) => Promise<Result>
}

interface RouteStatic<P = any, R extends Record<string, any> = Record<string, any>> {
  /**
   * ## 私有 beforeRouter 钩子
   *
   * - 你可以在当前路由的私有 beforeRouter 钩子中准备必要的数据
   * - 这么做的好处是可以在页面正式渲染前将所有数据准备就绪，从而避免Loading闪烁/页面抖动
   * - 你可以通过 props.dispatchBeforeRouter 来重新触发 beforeRouter 以刷新准备数据，同时这会触发一次组件重渲染
   * - beforeRouter 的返回值可以是一个对象，其中的所有字段会平铺到 props 中，返回的类型需要手动定义
   *
   * @param props 当前路由的 props
   * @returns 必须返回一个 Promise
   */
  beforeRouter?: (props: P) => Promise<R | void>
}

/** 路由 props  */
export interface PageProps<Params = Record<string, unknown>, Query = Record<string, unknown>, LocationState = unknown>
  extends RouteContextType<Params, Query, LocationState>,
    RouteConfig,
    BeforeRouteProps {}

export interface RouteChangeParams {
  to: string | number
  options?: NavigateOptions
}

export type ReactBeforeRouterFC<Props, BeforeRouterRes extends Record<string, any>> = React.FC<Props & BeforeRouterRes> &
  RouteStatic<Props, BeforeRouterRes>

export type BeforeRouterHook = (
  props: PageProps,
  next: (addProps?: PageProps) => void
) => boolean | void | Promise<boolean | void>
