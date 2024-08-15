import React from 'react'
import {
  BrowserRouter,
  type BrowserRouterProps,
  HashRouter,
  Routes,
  Route,
  Navigate,
  RouteProps,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom'

export interface AppRouterProps extends BrowserRouterProps {}

export const AppRouter = React.memo<AppRouterProps>((props) => {
  return <div>ok</div>
})
