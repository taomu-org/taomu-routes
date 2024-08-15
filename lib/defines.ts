import type { RouteProps, Location, NavigateFunction, NavigateOptions } from 'react-router-dom'
import type { AppRouterProps } from './components'

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
  /** 是否显示侧边栏 */
  showSidebar?: boolean
  /** 是否显示顶部导航栏 */
  showNavbar?: boolean
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean
  /**
   * 自动替换 url 布局参数
   *
   * @deprecated
   */
  autoReplaceLayoutQuery?: boolean
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

interface RouteLocation<S = unknown> extends Location {
  state: S
}

interface RouteContextType<Q = Record<string, unknown>, P = Record<string, unknown>, S = unknown> extends Record<string, any> {
  /** 由 location.search 转换来的对象 */
  query: Q
  /** react-router location 对象 */
  location: RouteLocation<S>
  /** react-router 路由跳转方法 */
  navigate: NavigateFunction
  /** 路由参数 */
  params: P
  /** 根路由创建时传入的 props */
  createProps: AppRouterProps
  /** 是否是抽屉预览 */
  isPreview?: boolean
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

/** 路由 props  */
export interface PageProps<P = Record<string, unknown>, Q = Record<string, unknown>, LocationState = unknown>
  extends RouteContextType<Q, P, LocationState>,
    RouteConfig,
    BeforeRouteProps {}

export interface RouteChangeParams {
  to: string | number
  options?: NavigateOptions
}
