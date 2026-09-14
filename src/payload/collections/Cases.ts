import type { CollectionConfig } from 'payload'

import { getCaseWebsiteUrl } from '@/lib/cases/catalog'

export const Cases: CollectionConfig = {
  slug: 'cases',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'slug', 'publishedAt', 'updatedAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user) || { _status: { equals: 'published' } },
  },
  versions: { drafts: { autosave: true } },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: 'Порядок отображения на главной странице.' },
    },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'cover', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'projectName',
      type: 'text',
      admin: { description: 'Название проекта на отдельной странице: КОТОПЕС, ARC STORE и т. п.' },
    },
    {
      name: 'websiteUrl',
      type: 'text',
      validate: (value: string | null | undefined) =>
        !value || Boolean(getCaseWebsiteUrl(value)) || 'Укажите полный адрес сайта с https://',
    },
    {
      name: 'allowEmbed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Включите после разрешения домена ВНЕ в CSP frame-ancestors и X-Frame-Options сайта кейса. Иначе сайт открывается в новой вкладке.',
      },
    },
    {
      name: 'mockup',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Необязательный мокап с прозрачным фоном для верхнего блока.' },
    },
    {
      name: 'serviceTags',
      type: 'text',
      admin: { description: 'Услуги через запятую, например: Web-design, CRM, SEO, Producing.' },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Необязательное подробное описание; прокручивается внутри текстового блока.',
      },
    },
    { name: 'publishedAt', type: 'date' },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', maxLength: 60 },
        { name: 'description', type: 'textarea', maxLength: 160 },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'noIndex', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
