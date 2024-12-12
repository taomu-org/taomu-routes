import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams, } from 'react-router-dom';
import { parseQuery } from 'taomu-toolkit';
import { routeTools } from '../routes';
import { useCustomEvent } from '../hooks';
import { RouteContext } from './router.ctx';
import { AsyncImport } from './async-import';
/**
 * AppRouter
 */
export const AppRouter = React.memo((props) => {
    const { routeType = 'browser', layoutFC, ...routerProps } = props;
    const Router = routeType === 'hash' ? HashRouter : BrowserRouter;
    return (_jsx(Router, { ...routerProps, children: _jsx(Routes, { children: createRoutes(props) }) }));
});
/**
 * 创建路由列表
 * @param routes
 * @returns
 */
function createRoutes(createProps) {
    const res = [];
    let noMatch = undefined;
    createProps.routes.forEach((conf) => {
        const routeEl = createRouteItem(conf, createProps);
        if (conf.path === '*') {
            noMatch = routeEl;
        }
        else {
            res.push(routeEl);
        }
    });
    if (noMatch) {
        res.push(noMatch);
    }
    // else {
    //   res.push(createRouteItem(defaultErrorPageRoute, createProps)) // 注入默认404页
    // }
    return res;
}
/**
 * 创建路由元素
 * @param routeConfig
 * @param key
 * @returns
 */
function createRouteItem(routeConfig, createProps) {
    const { name, path, redirectTo, element, ...params } = routeConfig;
    const { layoutFC: LayoutFC, beforeRouter, importErrorFC, importLoadingFC } = createProps;
    const routeProps = {
        path,
    };
    const nextProps = {
        name,
        path,
        ...params,
    };
    if (!element || redirectTo) {
        routeProps.element = _jsx(Navigate, { to: redirectTo || '/', ...nextProps });
    }
    else if (element instanceof Promise || typeof element === 'function') {
        routeProps.element = (_jsx(RouteCtx, { createProps: createProps, routeConfig: routeConfig, children: (routeHooksParams) => {
                let elementEl = null;
                const pageProps = { ...nextProps, ...routeHooksParams };
                const isPromise = element instanceof Promise;
                const elementRes = isPromise ? element : element({ ...nextProps, ...routeHooksParams });
                if (elementRes instanceof Promise) {
                    elementEl = (_jsx(AsyncImport, { ...pageProps, element: elementRes, beforeRouter: beforeRouter, importErrorFC: importErrorFC, importLoadingFC: importLoadingFC }));
                }
                else {
                    elementEl = elementRes;
                }
                if (!LayoutFC) {
                    return (_jsx("div", { "data-env": pageProps.BUILD_ENV, "data-route": name, ...nextProps.contentProps, children: elementEl }));
                }
                return (_jsx(LayoutFC, { "data-env": pageProps.BUILD_ENV, "data-route": name, ...nextProps.contentProps, children: elementEl }));
            } }));
    }
    else {
        throw new Error(`Route config error! \n ${JSON.stringify(routeConfig, undefined, 2)}`);
    }
    return _jsx(Route, { ...routeProps }, name);
}
export function RouteCtx({ children, createProps }) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const query = Object.assign(parseQuery(window.location.search), parseQuery(location.search));
    if (!location.state) {
        location.state = {}; // 防止 state 解构报错
    }
    useCustomEvent(routeTools.getNavigateEventKey(createProps.routes), ({ detail }) => {
        if (!detail)
            return;
        let toPath = detail.to;
        if (typeof toPath === 'number') {
            navigate(toPath);
            return;
        }
        if (toPath && createProps.basename) {
            toPath = toPath.replace(new RegExp(`^/?${createProps.basename}(/)`), '$1');
        }
        if (!toPath.startsWith('/')) {
            toPath = '/' + toPath;
        }
        navigate(toPath, detail.options);
    });
    const ctxValue = {
        ...createProps.contextValue,
        createProps,
        location,
        navigate,
        query,
        params,
    };
    return _jsx(RouteContext.Provider, { value: ctxValue, children: children(ctxValue) });
}
