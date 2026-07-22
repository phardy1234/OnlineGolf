import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    globalSetup: ['./src/setup/globalSetup.ts'],
    // One browser/driver session at a time — Selenium + a shared Mongo-backed
    // fixture don't behave well under concurrent test files.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
})
