import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { filledKey, hasLiveModel } from './keys'
import { clip, localCopy, systemPrompt } from './copy'
import type { Locale, Platform, Tone } from './types'

export { hasLiveModel, streamText }

export function chatModel() {
  if (filledKey(process.env.GROQ_API_KEY)) {
    return groq(process.env.AI_MODEL?.trim() || 'llama-3.1-8b-instant')
  }
  if (filledKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY)) {
    return google(process.env.AI_MODEL?.trim() || 'gemini-2.0-flash')
  }
  if (filledKey(process.env.OPENAI_API_KEY)) {
    const id = process.env.AI_MODEL?.trim()
    return openai(id && !id.startsWith('claude') ? id : 'gpt-4o-mini')
  }
  if (filledKey(process.env.ANTHROPIC_API_KEY)) {
    const id = process.env.AI_MODEL?.trim()
    return anthropic(id && id.startsWith('claude') ? id : 'claude-3-5-haiku-latest')
  }
  return null
}

export function localPack(topic: string, tone: Tone, locale: Locale) {
  return localCopy(topic, tone, locale)
}

export async function streamPlatform(
  platform: Platform,
  topic: string,
  tone: Tone,
  locale: Locale,
  onDelta: (chunk: string) => void,
) {
  const model = chatModel()
  if (!model || !hasLiveModel()) {
    const full = localCopy(topic, tone, locale)[platform]
    for (const word of full.split(/(\s+)/)) onDelta(word)
    return
  }

  const result = streamText({
    model,
    system: systemPrompt(platform, tone, locale),
    prompt: topic.trim(),
  })
  let acc = ''
  for await (const delta of result.textStream) {
    acc += delta
    onDelta(delta)
  }
  const clipped = clip(platform, acc)
  if (clipped !== acc) onDelta('\n')
}
