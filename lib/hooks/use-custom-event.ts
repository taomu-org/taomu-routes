import React from 'react'

/**
 * 监听自定义事件
 */
export function useCustomEvent<K extends string, E = any>(key: K, cb?: (e: E) => void, deps: React.DependencyList = []) {
  const cbRef = React.useRef(cb)

  cbRef.current = cb

  React.useEffect(() => {
    if (!cbRef.current) return

    function register(e: any) {
      cbRef.current?.(e)
    }
    document.addEventListener(key, register)

    return () => {
      document.removeEventListener(key, register)
    }
  }, deps)
}

/**
 * 派发自定义事件
 */
export function dispatchCustomEvent<K extends string, D = any>(key: K, detail?: D) {
  const event = new CustomEvent(key, {
    detail,
  })
  document.dispatchEvent(event)
  return event
}
