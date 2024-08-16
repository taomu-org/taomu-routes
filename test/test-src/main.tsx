/// <reference types="vite/client" />

import React from 'react'
import { createRoot } from 'react-dom/client'

import { AppRouter, AutoRoutes } from '../../lib'

const root = createRoot(document.getElementById('root')!)

const routes = new AutoRoutes(import.meta.glob('./views/**/routes.(ts|tsx)', { eager: true }))

console.log(routes)

root.render(
  <div>
    <AppRouter />
  </div>
)
