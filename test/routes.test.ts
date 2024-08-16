/// <reference types="vite/client" />

import { expect, test } from 'vitest'

import { AutoRoutes } from '../lib/routes/auto-routes'

test('createAutoRoutes', () => {
  const routes = new AutoRoutes(import.meta.glob('./test-src/views/**/routes.(ts|tsx)', { eager: true }))

  console.log(routes)

  expect(routes.get('home')?.name).toBe('home')
  expect(routes.get('home')?.path).toBe('/home')
  expect(routes.get('home')?.element).toBeInstanceOf(Function)
})
