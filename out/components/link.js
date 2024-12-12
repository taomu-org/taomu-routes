import { jsx as _jsx } from "react/jsx-runtime";
import { useHref } from 'react-router-dom';
import { AutoRoutes } from '../routes/auto-routes';
import { navigateTo, formatRoutePath } from '../routes/route-tools';
export const Link = ({ children, query, params, to, name, routesId, ...wrapProps }) => {
    let ptahH = to;
    if (name) {
        const routeConfig = AutoRoutes.findRouteByName(name, routesId);
        if (routeConfig) {
            ptahH = routeConfig.path;
        }
        else {
            console.warn(`Link: Route<${name}> not found`);
        }
    }
    if (!ptahH) {
        return _jsx("a", { ...wrapProps, children: children });
    }
    const targetPath = useHref(formatRoutePath(ptahH, params, query));
    return (_jsx("a", { ...wrapProps, href: targetPath, onClick: (e) => {
            if (e.ctrlKey || wrapProps.target) {
                return;
            }
            e.preventDefault();
            navigateTo(targetPath, wrapProps);
        }, children: children }));
};
