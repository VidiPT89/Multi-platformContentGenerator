import { LIMITS, PLATFORMS, type Pack, type Platform } from './types'

export function remaining(platform: Platform, text: string) {
  return LIMITS[platform] - text.length
}

export function overLimit(platform: Platform, text: string) {
  return remaining(platform, text) < 0
}

export function pickPlatforms(raw?: unknown): Platform[] {
  if (!Array.isArray(raw)) return [...PLATFORMS]
  const picked = raw.filter((item): item is Platform => PLATFORMS.includes(item as Platform))
  return picked.length ? picked : [...PLATFORMS]
}

export function filterPacks(packs: Pack[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return packs
  return packs.filter((pack) => {
    const hay = `${pack.topic} ${pack.tone} ${Object.values(pack.texts).join(' ')}`.toLowerCase()
    return hay.includes(q)
  })
}

export function hashtagCount(text: string) {
  return (text.match(/#[\p{L}\p{N}_]+/gu) ?? []).length
}
