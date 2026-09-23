import { AsciiStarsExperiment } from '@/components/experiments/ascii-stars/AsciiStarsExperiment'
import { createMetadata } from '@/lib/seo/create-metadata'

export const metadata = createMetadata({
  title: 'Orbit — vne.lab',
  description: 'Интерактивный эксперимент ВНЕ с формой, символами и движением.',
  path: '/lab/orbit',
  image: '/og/lab',
})

export default function OrbitPage() {
  return <AsciiStarsExperiment />
}
