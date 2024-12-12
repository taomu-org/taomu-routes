import { checkPathParamsUnique } from './route-tools';
export class AutoRoutes extends Map {
    constructor(
    /** 唯一路由 id */
    id, 
    /** 路由模块 (import.meta.glob) */
    modules, 
    /** 配置项 */
    options = {}) {
        super();
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: id
        });
        Object.defineProperty(this, "modules", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: modules
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        /**
         * 创建路由
         */
        Object.defineProperty(this, "createAutoRoutes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const { exportKey = 'autoRoutes' } = this.options || {};
                /** 自动导入的路由文件 */
                const moduleValues = Object.values(this.modules);
                if (!moduleValues.length) {
                    console.warn('createAutoRoutes: Route modules is empty');
                    return;
                }
                // 创建页面路由
                moduleValues.forEach((item) => {
                    if (typeof item === 'function') {
                        throw new Error('createAutoRoutes: modules exception, please use { eager: true } when calling import.meta.glob');
                    }
                    const conf = item[exportKey];
                    if (!conf) {
                        console.warn(`createAutoRoutes: Routing configuration exception [${item.name}]: ${exportKey} field is not exported`);
                        return;
                    }
                    this.flatRoutes(conf);
                });
            }
        });
        /**
         * 添加一个路由
         */
        Object.defineProperty(this, "addRouteConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (conf) => {
                if (this.has(conf.name)) {
                    throw new Error(`addRouteConfig: Route<${conf.name}> already exists`);
                }
                if (conf.path && !checkPathParamsUnique(conf.path)) {
                    throw new Error(`addRouteConfig: Fatal error: Duplicate parameters in routing path "${conf.path}"`);
                }
                this.set(conf.name, conf);
            }
        });
        /**
         * 展开子路由
         */
        Object.defineProperty(this, "flatRoutes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (routes, parent) => {
                const routesH = Array.isArray(routes) ? routes : [routes];
                routesH.forEach((conf) => {
                    if (parent) {
                        conf.parentNamePath = parent.parentNamePath ? parent.parentNamePath.concat(parent.name) : [parent.name];
                        conf.parent = parent;
                    }
                    if (Array.isArray(conf.routes) && conf.routes.length) {
                        this.flatRoutes(conf.routes, conf);
                    }
                    const assignConf = Object.assign({}, this.options.defaultConfig, conf);
                    this.addRouteConfig(assignConf);
                });
            }
        });
        if (AutoRoutes.allRoutesMapStorage.has(this.id)) {
            throw new Error(`createAutoRoutes: Routes cannot be created repeatedly in the same reference<${this.id}>.`);
        }
        this.createAutoRoutes();
        AutoRoutes.allRoutesMapStorage.set(this.id, this);
    }
}
/** 所有已创建的路由实例 */
Object.defineProperty(AutoRoutes, "allRoutesMapStorage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
/** 通过 name 查找路由 */
Object.defineProperty(AutoRoutes, "findRouteByName", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: (name, routesId) => {
        let routesIns;
        if (routesId) {
            routesIns = AutoRoutes.allRoutesMapStorage.get(routesId);
        }
        else if (AutoRoutes.allRoutesMapStorage.size > 1) {
            throw new Error(`Multiple AutoRoutes instances exist, RoutesId is required.`);
        }
        else {
            routesIns = AutoRoutes.allRoutesMapStorage.values().next().value;
        }
        return routesIns?.get(name);
    }
});
