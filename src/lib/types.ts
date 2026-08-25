export type Locale = 'pt' | 'en'
export type Theme = 'dark' | 'light'
export type Tone = 'formal' | 'warm' | 'punchy' | 'playful'
export type Platform = 'twitter' | 'linkedin' | 'instagram' | 'blog'

export const PLATFORMS: Platform[] = ['twitter', 'linkedin', 'instagram', 'blog']

export const LIMITS: Record<Platform, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  blog: 12000,
}

export type Pack = {
  id: string
  topic: string
  tone: Tone
  locale: Locale
  createdAt: string
  texts: Record<Platform, string>
}

export type QueueItem = {
  id: string
  packId: string
  platform: Platform
  text: string
  when: string
  status: 'queued' | 'sent' | 'local'
  remoteId?: string
}
