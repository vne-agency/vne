import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Cases } from '@/payload/collections/Cases'
import { Leads } from '@/payload/collections/Leads'
import { Media } from '@/payload/collections/Media'
import { Services } from '@/payload/collections/Services'
import { Users } from '@/payload/collections/Users'
import { SiteSettings } from '@/payload/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const migrationDir = process.env.PAYLOAD_MIGRATION_DIR || path.resolve(dirname, 'migrations')

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — ВНЕ CMS',
    },
  },
  collections: [Users, Media, Cases, Services, Leads],
  globals: [SiteSettings],
  db: postgresAdapter({
    migrationDir,
    pool: { connectionString: process.env.DATABASE_URL ?? '' },
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? '',
  sharp,
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
