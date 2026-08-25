import { filledKey, hasBuffer } from './keys'
import type { Platform } from './types'

type Profile = { id: string; service: string }

const SERVICE: Record<Exclude<Platform, 'blog'>, string[]> = {
  twitter: ['twitter', 'x'],
  linkedin: ['linkedin'],
  instagram: ['instagram'],
}

export { hasBuffer }

export async function bufferProfiles(): Promise<Profile[]> {
  const token = process.env.BUFFER_ACCESS_TOKEN?.trim()
  if (!filledKey(token)) return []
  const res = await fetch(`https://api.bufferapp.com/1/profiles.json?access_token=${encodeURIComponent(token!)}`)
  if (!res.ok) return []
  const data = (await res.json()) as Profile[]
  return Array.isArray(data) ? data : []
}

export function profileFor(profiles: Profile[], platform: Platform) {
  if (platform === 'blog') return null
  const names = SERVICE[platform]
  return profiles.find((profile) => names.includes(profile.service.toLowerCase())) ?? null
}

export async function scheduleOnBuffer(platform: Platform, text: string, when: string) {
  const token = process.env.BUFFER_ACCESS_TOKEN?.trim()
  if (!filledKey(token)) return { ok: false as const, reason: 'local' as const }
  if (platform === 'blog') return { ok: false as const, reason: 'blog' as const }

  const profiles = await bufferProfiles()
  const profile = profileFor(profiles, platform)
  if (!profile) return { ok: false as const, reason: 'profile' as const }

  const body = new URLSearchParams()
  body.set('access_token', token!)
  body.append('profile_ids[]', profile.id)
  body.set('text', text)
  body.set('scheduled_at', when)

  const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) return { ok: false as const, reason: 'http' as const }
  const data = (await res.json()) as { updates?: { id?: string }[] }
  return { ok: true as const, remoteId: data.updates?.[0]?.id }
}
