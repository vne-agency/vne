import config from '@payload-config'
import { getPayload } from 'payload'

// Development schema push can mask missing migrations. This check must run
// against the migrated database before any development-mode Payload instance.
if (process.env.NODE_ENV !== 'production') {
  throw new Error('Migration verification requires NODE_ENV=production')
}

const payload = await getPayload({ config })
try {
  for (const collection of ['leads', 'users', 'cases', 'services', 'media'] as const) {
    await payload.find({ collection, overrideAccess: true, limit: 1, depth: 0 })
    console.log(`Migrated schema readable: ${collection}`)
  }
} finally {
  await payload.destroy()
}
