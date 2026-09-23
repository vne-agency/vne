export type LabTool = {
  id: string
  href: `/lab/${string}`
  title: string
  number: string
  description: { ru: string; en: string }
  formats: readonly string[]
  status: 'available'
}

// Add new public tools here. The library page renders this catalog rather than
// maintaining a second list of links and availability labels.
export const labTools: readonly LabTool[] = [
  {
    id: 'ascii-dither',
    href: '/lab/ascii-dither',
    title: 'ASCII / Dither',
    number: '01',
    description: {
      ru: 'Превратите PNG или SVG в символьную графику или растровый узор. Настройте детализацию и сохраните результат.',
      en: 'Turn a PNG or SVG into type based graphics or a dithered pattern. Adjust the detail and save the result.',
    },
    formats: ['PNG', 'SVG'],
    status: 'available',
  },
] as const
