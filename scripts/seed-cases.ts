import config from '@payload-config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'

import type { Case } from '../src/payload-types'

const seeds = [
  {
    slug: 'iimali-design',
    order: 1,
    title: 'Сайт студии интерьеров',
    excerpt:
      'Спроектировали сайт так, чтобы пользователь мог быстро найти нужный тип интерьера и без лишних кликов перейти к просмотру работ.',
    filename: 'services-design.png',
    alt: 'Абстрактная композиция для сайта студии интерьеров',
  },
  {
    slug: 'arc-store',
    order: 2,
    title: 'Магазин цифровых товаров',
    excerpt:
      'Сделали удобный сайт, где геймеры могут купить игровые предметы, оружие или заказать прокачку.',
    filename: 'services-motion.png',
    alt: 'Абстрактная композиция для магазина цифровых товаров',
  },
  {
    slug: 'bowshock',
    order: 3,
    title: 'Скейтерское сообщество',
    excerpt:
      'Сделали большой сайт, в котором уместили перепись скейтеров, соцсеть и маркетплейс.',
    filename: 'case-bowshock.png',
    alt: 'Фотография скейт-парка BowShock',
  },
] as const

function createContent(text: string): Case['content'] {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

const payload = await getPayload({ config })

try {
  for (const seed of seeds) {
    const existingCase = await payload.find({
      collection: 'cases',
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { slug: { equals: seed.slug } },
    })

    if (existingCase.docs.length > 0) {
      await payload.update({
        collection: 'cases',
        id: existingCase.docs[0].id,
        overrideAccess: true,
        data: { order: seed.order },
      })
      console.log(`Case already exists, order synced: ${seed.slug}`)
      continue
    }

    const existingMedia = await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { filename: { equals: seed.filename } },
    })

    let media = existingMedia.docs[0]

    if (!media) {
      const filePath = path.resolve('public/assets/home', seed.filename)
      const data = await readFile(filePath)

      media = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: { alt: seed.alt },
        file: {
          data,
          mimetype: 'image/png',
          name: seed.filename,
          size: data.byteLength,
        },
      })
    }

    await payload.create({
      collection: 'cases',
      overrideAccess: true,
      draft: false,
      data: {
        title: seed.title,
        order: seed.order,
        slug: seed.slug,
        excerpt: seed.excerpt,
        cover: media.id,
        content: createContent(seed.excerpt),
        publishedAt: new Date().toISOString(),
        _status: 'published',
      },
    })

    console.log(`Created case: ${seed.slug}`)
  }
} finally {
  await payload.destroy()
}

process.exit(0)
