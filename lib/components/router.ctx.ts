import React from 'react'

import type { RouteContextType } from '../defines'

export const RouteContext = React.createContext<Partial<RouteContextType>>({})
