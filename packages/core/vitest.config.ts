import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: './tests/environment/jsdom-no-canvas.ts',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
