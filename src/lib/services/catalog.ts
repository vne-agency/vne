import { serviceExperiences } from '@/components/sections/service-experience-data'

export { serviceExperiences }
export type { ServiceExperience } from '@/components/sections/service-experience-data'

export function getServiceHref(id: string) {
  return `/services/${encodeURIComponent(id)}`
}

export function getServiceBySlug(slug: string) {
  return serviceExperiences.find((service) => service.id === slug)
}
