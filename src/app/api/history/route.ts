import { NextRequest, NextResponse } from 'next/server'
import { deletePack, listPacks, patchPack, savePack } from '@/lib/store'
import { PLATFORMS, type Locale, type Pack, type Platform, type Tone } from '@/lib/types'

const TONES: Tone[] = ['formal', 'warm', 'punchy', 'playful']

export async function GET() {
  return NextResponse.json({ packs: await listPacks() })
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<Pack>
  const topic = body.topic?.trim() ?? ''
  if (topic.length < 3 || !body.texts) {
    return NextResponse.json({ error: 'pack' }, { status: 400 })
  }
  const tone: Tone = TONES.includes(body.tone as Tone) ? (body.tone as Tone) : 'warm'
  const locale: Locale = body.locale === 'en' ? 'en' : 'pt'
  const texts = emptyTexts()
  for (const platform of PLATFORMS) {
    texts[platform] = String(body.texts[platform] ?? '')
  }
  const pack: Pack = {
    id: body.id || crypto.randomUUID(),
    topic,
    tone,
    locale,
    createdAt: body.createdAt || new Date().toISOString(),
    texts,
  }
  await savePack(pack)
  return NextResponse.json({ pack })
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as { id?: string; texts?: Partial<Record<Platform, string>> }
  if (!body.id || !body.texts) return NextResponse.json({ error: 'patch' }, { status: 400 })
  const pack = await patchPack(body.id, body.texts)
  if (!pack) return NextResponse.json({ error: 'missing' }, { status: 404 })
  return NextResponse.json({ pack })
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json()) as { id?: string }
  if (!body.id) return NextResponse.json({ error: 'id' }, { status: 400 })
  const packs = await deletePack(body.id)
  return NextResponse.json({ packs })
}

function emptyTexts(): Record<Platform, string> {
  return { twitter: '', linkedin: '', instagram: '', blog: '' }
}
