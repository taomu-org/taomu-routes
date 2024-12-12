import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
/** 异步导入组件 */
export const AsyncImport = ({ element, beforeRouter, importErrorFC: ImportErrorFC, importLoadingFC: ImportLoadingFC, permissionCodeMap, ...props }) => {
    const [lazyElement, setLazyElement] = React.useState(null);
    const currentName = React.useRef('');
    React.useEffect(() => {
        currentName.current = props.name;
    }, [props.name]);
    React.useEffect(() => {
        /// 非静态路由重置组件
        if (!props.isStatic && typeof ImportLoadingFC === 'function') {
            setLazyElement(_jsx(ImportLoadingFC, { pageProps: props }));
        }
        element?.then(({ default: Page }) => {
            // 此处的 props.name 必须是在闭包中的旧数据
            if (currentName.current !== props.name) {
                return; // 获得的数据流不是当前需要加载的组件，直接丢弃
            }
            // 如果存在 permissionCode 字段，进行权限校验，需要在 HroProvider 中设置 permissionCodeMap
            if (props.permissionCode) {
                if (!permissionCodeMap) {
                    console.error('[AsyncImport] defined permissionCode, but HroProvider.permissionCodeMap is not defined.');
                }
                else if (!permissionCodeMap[props.permissionCode]) {
                    props.navigate('/403', { state: { code: 403 }, replace: true });
                    return;
                }
            }
            const next = async (addProps) => {
                const nextProps = {
                    ...props,
                    ...addProps,
                };
                // 组件私有 beforeRouter 钩子
                if (Page?.beforeRouter) {
                    nextProps.dispatchBeforeRouter = (addProps) => {
                        return Page.beforeRouter(props)
                            .then((res) => {
                            setLazyElement(_jsx(Page, { ...nextProps, ...addProps, ...res }));
                        })
                            .catch((err) => {
                            renderError(err);
                            return Promise.reject();
                        });
                    };
                    const beforeRouterRes = await Page.beforeRouter(props).catch((err) => {
                        renderError(err);
                        return Promise.reject();
                    });
                    if (beforeRouterRes) {
                        Object.assign(nextProps, beforeRouterRes);
                    }
                }
                setLazyElement(_jsx(Page, { ...nextProps }));
            };
            // 全局 beforeRouter 钩子
            if (beforeRouter) {
                const hookRes = beforeRouter(props || {}, next);
                if (typeof hookRes === 'boolean' && hookRes) {
                    next();
                }
            }
            else {
                next();
            }
            // 自动替换页面标题
            if (props.autoReplaceTitle) {
                replaceTitle(props.title);
            }
        });
    }, [element, props.isStatic ? void 0 : props.location.key]);
    /** 错误渲染 */
    function renderError(err) {
        if (typeof err === 'function') {
            setLazyElement(err());
        }
        else if (typeof ImportErrorFC === 'function') {
            setLazyElement(_jsx(ImportErrorFC, { code: err.code, icon: err.icon, message: err.message || err.msg }));
        }
    }
    return lazyElement;
};
/**
 * 替换页面标题
 */
function replaceTitle(title) {
    if (title) {
        document.title = title;
    }
}
