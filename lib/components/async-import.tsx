import React from 'react'

import type { PageProps, BeforeRouterHook } from '../defines'

export interface ImportErrorProps {
  code?: number | string
  message?: string
  icon?: string
  pageProps?: PageProps
}

export interface ImportLoadingProps {
  pageProps?: PageProps
}

export interface AsyncImportProps extends PageProps {
  element: Promise<any>
  beforeRouter?: BeforeRouterHook
  /** 权限码映射表 */
  permissionCodeMap?: Record<string, boolean>
  /** 路由导入错误时渲染的组件 */
  importErrorFC?: React.FC<ImportErrorProps>
  /** 路由导入时渲染的组件 */
  importLoadingFC?: React.FC<ImportLoadingProps>
}

/** 异步导入组件 */
export const AsyncImport: React.FC<AsyncImportProps> = ({
  element,
  beforeRouter,
  importErrorFC: ImportErrorFC,
  importLoadingFC: ImportLoadingFC,
  permissionCodeMap,
  ...props
}) => {
  const [lazyElement, setLazyElement] = React.useState<React.ReactElement | null>(null)
  const currentName = React.useRef('')

  React.useEffect(() => {
    currentName.current = props.name
  }, [props.name])

  React.useEffect(() => {
    /// 非静态路由重置组件
    if (!props.isStatic && typeof ImportLoadingFC === 'function') {
      setLazyElement(<ImportLoadingFC pageProps={props} />)
    }

    element?.then(({ default: Page }) => {
      // 此处的 props.name 必须是在闭包中的旧数据
      if (currentName.current !== props.name) {
        return // 获得的数据流不是当前需要加载的组件，直接丢弃
      }

      // 如果存在 permissionCode 字段，进行权限校验，需要在 HroProvider 中设置 permissionCodeMap
      if (props.permissionCode) {
        if (!permissionCodeMap) {
          console.error('[AsyncImport] defined permissionCode, but HroProvider.permissionCodeMap is not defined.')
        } else if (!permissionCodeMap[props.permissionCode]) {
          props.navigate('/403', { state: { code: 403 }, replace: true })
          return
        }
      }

      const next = async (addProps?: PageProps) => {
        const nextProps: PageProps = {
          ...props,
          ...addProps,
        }

        // 组件私有 beforeRouter 钩子
        if (Page?.beforeRouter) {
          nextProps.dispatchBeforeRouter = (addProps) => {
            return Page.beforeRouter(props)
              .then((res: any) => {
                setLazyElement(<Page {...nextProps} {...addProps} {...res} />)
              })
              .catch((err: any) => {
                renderError(err)
                return Promise.reject()
              })
          }

          const beforeRouterRes = await Page.beforeRouter(props).catch((err: any) => {
            renderError(err)
            return Promise.reject()
          })
          if (beforeRouterRes) {
            Object.assign(nextProps, beforeRouterRes)
          }
        }

        setLazyElement(<Page {...nextProps} />)
      }

      // 全局 beforeRouter 钩子
      if (beforeRouter) {
        const hookRes = beforeRouter(props || {}, next)
        if (typeof hookRes === 'boolean' && hookRes) {
          next()
        }
      } else {
        next()
      }

      // 自动替换页面标题
      if (props.autoReplaceTitle) {
        replaceTitle(props.title)
      }
    })
  }, [element, props.isStatic ? void 0 : props.location.key])

  /** 错误渲染 */
  function renderError(err: any) {
    if (typeof err === 'function') {
      setLazyElement(err())
    } else if (typeof ImportErrorFC === 'function') {
      setLazyElement(<ImportErrorFC code={err.code} icon={err.icon} message={err.message || err.msg} />)
    }
  }

  return lazyElement
}

/**
 * 替换页面标题
 */
function replaceTitle(title?: string) {
  if (title) {
    document.title = title
  }
}
