import { NextRequest } from 'next/server'
import { PLATFORMS, type Locale, type Platform, type Tone } from '@/lib/types'
import { hasLiveModel, streamPlatform } from '@/lib/models'

const TONES: Tone[] = ['formal', 'warm', 'punchy', 'playful']

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`
}

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { topic?: string; tone?: string; locale?: string }
  const topic = body.topic?.trim() ?? ''
  if (topic.length < 3) {
    return new Response(JSON.stringify({ error: 'topic' }), { status: 400 })
  }
  const tone: Tone = TONES.includes(body.tone as Tone) ? (body.tone as Tone) : 'warm'
  const locale: Locale = body.locale === 'en' ? 'en' : 'pt'

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(encoder.encode(sse(data)))
      send({ type: 'meta', live: hasLiveModel() })
      await Promise.all(
        PLATFORMS.map(async (platform: Platform) => {
          try {
            await streamPlatform(platform, topic, tone, locale, (text) => {
              send({ type: 'delta', platform, text })
            })
            send({ type: 'done', platform })
          } catch {
            send({ type: 'error', platform })
          }
        }),
      )
      send({ type: 'end' })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
