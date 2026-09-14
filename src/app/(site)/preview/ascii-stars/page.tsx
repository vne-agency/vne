import { permanentRedirect } from 'next/navigation'

export default function LegacyLabPage() {
  permanentRedirect('/lab')
}
