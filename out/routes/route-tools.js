import { queryStringify, hasDuplicate } from 'taomu-toolkit';
import { dispatchCustomEvent } from '../hooks';
import { AutoRoutes } from './auto-routes';
/**
 * 格式化路由路径
 *
 * @param path
 * @param params
 * @param query
 * @returns
 */
export function formatRoutePath(path, params, query) {
    let pathStr = path;
    if (typeof params === 'object') {
        const paramsCopy = { ...params };
        pathStr = path.replace(/\:([^\/]+\??)/g, (_, $1) => {
            let isRequired = true;
            if ($1.endsWith('?')) {
                isRequired = false;
                $1 = $1.slice(0, -1);
            }
            const value = paramsCopy[$1];
            if (isRequired && value === undefined) {
                console.error(`formatRoutePath: The parameter ${$1} is not defined, the field is not passed in, or the parameter name is duplicated`);
                return $1;
            }
            delete paramsCopy[$1];
            return value ?? '';
        });
    }
    if (typeof query === 'object') {
        pathStr += queryStringify(query);
    }
    return pathStr;
}
/**
 * 通过 routeName 获取路由 Path
 *
 * @param name
 * @param options
 * @returns
 */
export function getRoutePathByName(name, { params, query, routesId } = {}) {
    const routeConfig = findRoutesInstance(routesId)?.get(name);
    if (!routeConfig)
        throw new Error(`getRoutePathByName: Route<${name}> not found`);
    if (!routeConfig.path)
        throw new Error(`getRoutePathByName: The Route<${name}> path field does not exist`);
    return formatRoutePath(routeConfig.path, params, query);
}
/**
 * 查找 Routes 实例
 *
 * @param routesId
 * @returns
 */
export function findRoutesInstance(routesId) {
    let routesIns;
    if (routesId) {
        routesIns = AutoRoutes.allRoutesMapStorage.get(routesId);
    }
    else if (AutoRoutes.allRoutesMapStorage.size > 1) {
        throw new Error(`findRoutesInstance: Multiple AutoRoutes instances exist, RoutesId is required.`);
    }
    else {
        routesIns = AutoRoutes.allRoutesMapStorage.values().next().value;
    }
    return routesIns;
}
/**
 * 获取通信事件 key
 *
 * @param routesId
 * @returns
 */
export function getNavigateEventKey(routesId) {
    const routesIns = routesId instanceof AutoRoutes ? routesId : findRoutesInstance(routesId);
    if (!routesIns) {
        throw new Error(`getNavigateEventKey: Routes Instance not found`);
    }
    return `auto-routes-navigate:${routesIns.id}`;
}
/**
 * 检查路由路径参数唯一性
 *
 * - 通过条件：无参数 或 参数名称没有重复
 * - 通过返回 true
 *
 * @param path
 */
export function checkPathParamsUnique(path) {
    const params = path.match(/\:([^\/]+)/g);
    if (!params || !params.length)
        return true; // 无参数
    return !hasDuplicate(params);
}
/**
 * 路由跳转
 *
 * @param to
 * @param options
 */
export function navigateTo(to, options = {}) {
    dispatchCustomEvent(getNavigateEventKey(options.routesId), { to, options });
}
/**
 * 通过 routeName 跳转路由
 *
 * @param name
 * @param options
 * @returns
 */
export function navigateToByRouteName(name, options = {}) {
    const path = getRoutePathByName(name, options);
    return navigateTo(path, options);
}
/**
 * 返回上一页
 *
 * @param num
 */
export function goBack(num = -1) {
    navigateTo(num);
}
