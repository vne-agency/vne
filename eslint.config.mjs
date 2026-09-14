import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    '.next/**',
    '.runtime/**',
    '.tools/**',
    '.seo-cache/**',
    '.playwright-cli/**',
    'output/**',
    'coverage/**',
    'node_modules/**',
    'playwright-report/**',
    'src/app/(payload)/admin/importMap.js',
    'src/migrations/**',
    'src/payload-types.ts',
    'test-results/**',
  ]),
])
