import React from 'react';
/**
 * 监听自定义事件
 */
export function useCustomEvent(key, cb, deps = []) {
    const cbRef = React.useRef(cb);
    cbRef.current = cb;
    React.useEffect(() => {
        if (!cbRef.current)
            return;
        function register(e) {
            cbRef.current?.(e);
        }
        document.addEventListener(key, register);
        return () => {
            document.removeEventListener(key, register);
        };
    }, deps);
}
/**
 * 派发自定义事件
 */
export function dispatchCustomEvent(key, detail) {
    const event = new CustomEvent(key, {
        detail,
    });
    document.dispatchEvent(event);
    return event;
}
