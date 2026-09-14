import config from '@payload-config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'

import { fallbackCases } from '../src/lib/cases/catalog'

const payload = await getPayload({ config })

async function upload(asset: string, alt: string) {
  const filename = path.basename(asset)
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    where: { filename: { equals: filename } },
  })
  if (existing.docs[0]) return existing.docs[0].id
  const data = await readFile(path.resolve('public', asset.replace(/^\//, '')))
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, name: filename, mimetype: 'image/png', size: data.byteLength },
  })
  return media.id
}

try {
  for (const [index, item] of fallbackCases.entries()) {
    const existing = await payload.find({
      collection: 'cases',
      limit: 1,
      where: { slug: { equals: item.slug } },
    })
    const record = existing.docs[0]
    if (record?.projectName) {
      console.log(`Already configured, preserving CMS edits: ${item.slug}`)
      continue
    }

    const cover = await upload(item.preview, item.previewAlt || item.projectName)
    const mockup = item.mockup
      ? await upload(item.mockup, `Мокап сайта ${item.projectName}`)
      : undefined
    const presentation = {
      projectName: item.projectName,
      order: index + 1,
      websiteUrl: item.websiteUrl,
      allowEmbed: item.allowEmbed,
      serviceTags: item.services.join(', '),
      cover,
      mockup,
    }

    if (record) {
      await payload.update({ collection: 'cases', id: record.id, data: presentation })
    } else {
      await payload.create({
        collection: 'cases',
        draft: false,
        data: {
          ...presentation,
          slug: item.slug,
          title: item.title,
          excerpt: item.description,
          publishedAt: new Date().toISOString(),
          _status: 'published',
        },
      })
    }
    console.log(`Configured expanded case: ${item.slug}`)
  }
} finally {
  await payload.destroy()
}
process.exit(0)
