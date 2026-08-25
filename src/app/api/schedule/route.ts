import { NextRequest, NextResponse } from 'next/server'
import { hasBuffer, scheduleOnBuffer } from '@/lib/buffer'
import { deleteQueueItem, listQueue, saveQueueItem } from '@/lib/store'
import { PLATFORMS, type Platform } from '@/lib/types'

export async function GET() {
  return NextResponse.json({ items: await listQueue(), buffer: hasBuffer() })
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    packId?: string
    platform?: string
    text?: string
    when?: string
  }
  const platform = PLATFORMS.includes(body.platform as Platform) ? (body.platform as Platform) : null
  const text = body.text?.trim() ?? ''
  const when = body.when?.trim() ?? ''
  if (!platform || !text || !when) {
    return NextResponse.json({ error: 'schedule' }, { status: 400 })
  }

  const remote = await scheduleOnBuffer(platform, text, when)
  const item = await saveQueueItem({
    id: crypto.randomUUID(),
    packId: body.packId || '',
    platform,
    text,
    when,
    status: remote.ok ? 'sent' : 'local',
    remoteId: remote.ok ? remote.remoteId : undefined,
  })
  return NextResponse.json({ item, buffer: hasBuffer(), remote })
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json()) as { id?: string }
  if (!body.id) return NextResponse.json({ error: 'id' }, { status: 400 })
  const items = await deleteQueueItem(body.id)
  return NextResponse.json({ items, buffer: hasBuffer() })
}
