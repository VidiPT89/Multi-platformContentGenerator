import type { Locale, Platform, Tone } from './types'
import { LIMITS } from './types'

const TONE_PT: Record<Tone, string> = {
  formal: 'tom formal, claro e profissional',
  warm: 'tom próximo, humano e acolhedor',
  punchy: 'tom directo, curto e com força',
  playful: 'tom leve, com humor contido',
}

const TONE_EN: Record<Tone, string> = {
  formal: 'formal, clear and professional',
  warm: 'warm, human and welcoming',
  punchy: 'direct, short and forceful',
  playful: 'light, with restrained humour',
}

export function clip(platform: Platform, text: string) {
  const limit = LIMITS[platform]
  const trimmed = text.trim()
  if (trimmed.length <= limit) return trimmed
  return trimmed.slice(0, limit - 1).trimEnd() + '…'
}

export function localCopy(topic: string, tone: Tone, locale: Locale): Record<Platform, string> {
  const seed = topic.trim() || (locale === 'en' ? 'a useful idea' : 'uma ideia útil')
  if (locale === 'en') {
    return {
      twitter: clip('twitter', twitterEn(seed, tone)),
      linkedin: clip('linkedin', linkedinEn(seed, tone)),
      instagram: clip('instagram', instagramEn(seed, tone)),
      blog: clip('blog', blogEn(seed, tone)),
    }
  }
  return {
    twitter: clip('twitter', twitterPt(seed, tone)),
    linkedin: clip('linkedin', linkedinPt(seed, tone)),
    instagram: clip('instagram', instagramPt(seed, tone)),
    blog: clip('blog', blogPt(seed, tone)),
  }
}

export function systemPrompt(platform: Platform, tone: Tone, locale: Locale) {
  const toneLine = locale === 'en' ? TONE_EN[tone] : TONE_PT[tone]
  const lang = locale === 'en' ? 'Write in English.' : 'Escreve em português de Portugal.'
  const rules: Record<Platform, string> = {
    twitter:
      locale === 'en'
        ? `Write one X/Twitter post, max ${LIMITS.twitter} characters. No hashtag dump. No quotes around the whole post.`
        : `Escreve um post para X/Twitter, no máximo ${LIMITS.twitter} caracteres. Sem avalanche de hashtags. Sem aspas à volta do post.`,
    linkedin:
      locale === 'en'
        ? `Write a LinkedIn post (2–5 short paragraphs). Professional, readable, no emoji spam. Max ${LIMITS.linkedin} characters.`
        : `Escreve um post de LinkedIn (2–5 parágrafos curtos). Profissional, legível, sem spam de emoji. Máximo ${LIMITS.linkedin} caracteres.`,
    instagram:
      locale === 'en'
        ? `Write an Instagram caption with a hook, a short body and 5–8 relevant hashtags at the end. Max ${LIMITS.instagram} characters.`
        : `Escreve uma legenda de Instagram com gancho, corpo curto e 5–8 hashtags úteis no fim. Máximo ${LIMITS.instagram} caracteres.`,
    blog:
      locale === 'en'
        ? `Write a short blog article in Markdown: title as # heading, 3–5 sections, closing line. Max ${LIMITS.blog} characters.`
        : `Escreve um artigo curto de blog em Markdown: título em #, 3–5 secções, fecho. Máximo ${LIMITS.blog} caracteres.`,
  }
  return `You write copy about the user's theme. Use ${toneLine}. ${lang}\n${rules[platform]}\nReturn only the copy.`
}

function tags(seed: string, locale: Locale) {
  const words = seed
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 2)
    .slice(0, 5)
  const extra = locale === 'en' ? ['buildinpublic', 'shipping'] : ['cascais', 'portugal']
  return [...words, 'ividi', ...extra].map((word) => `#${word}`).join(' ')
}

function twitterPt(seed: string, tone: Tone) {
  if (tone === 'punchy') return `${seed}. Agora, não para depois.`
  if (tone === 'playful') return `${seed}… e se for hoje, ainda melhor.`
  if (tone === 'warm') return `Ando a pensar nisto: ${seed}. Se te disser alguma coisa, responde.`
  return `${seed}. Um passo claro vale mais do que dez planos.`
}

function twitterEn(seed: string, tone: Tone) {
  if (tone === 'punchy') return `${seed}. Now, not someday.`
  if (tone === 'playful') return `${seed}… and today would be a good day for it.`
  if (tone === 'warm') return `I keep coming back to this: ${seed}. If it lands, say so.`
  return `${seed}. One clear step beats ten plans.`
}

function linkedinPt(seed: string, tone: Tone) {
  const close =
    tone === 'punchy'
      ? 'Menos teoria. Um passo esta semana.'
      : tone === 'playful'
        ? 'Se isto te fizer sorrir e depois agir, já valeu.'
        : tone === 'warm'
          ? 'Se te disser alguma coisa, deixa uma nota. Eu leio.'
          : 'O próximo passo é escrever o que vais fazer até sexta.'
  return [
    seed,
    '',
    'A ideia só conta quando sai da cabeça e encontra um sítio: um post, uma conversa, um calendário.',
    '',
    close,
  ].join('\n')
}

function linkedinEn(seed: string, tone: Tone) {
  const close =
    tone === 'punchy'
      ? 'Less theory. One step this week.'
      : tone === 'playful'
        ? 'If this makes you smile and then act, it already paid off.'
        : tone === 'warm'
          ? 'If it lands, leave a note. I read them.'
          : 'The next step is to write what you will do by Friday.'
  return [
    seed,
    '',
    'An idea only counts when it leaves your head and finds a place: a post, a conversation, a calendar.',
    '',
    close,
  ].join('\n')
}

function instagramPt(seed: string, tone: Tone) {
  return [
    tone === 'playful' ? `Psst: ${seed}.` : seed,
    '',
    tone === 'formal'
      ? 'Uma frase. Um sítio. Um próximo passo.'
      : 'Guarda isto se te servir. Depois faz uma coisa pequena com a ideia.',
    '',
    tags(seed, 'pt'),
  ].join('\n')
}

function instagramEn(seed: string, tone: Tone) {
  return [
    tone === 'playful' ? `Psst: ${seed}.` : seed,
    '',
    tone === 'formal'
      ? 'One line. One place. One next step.'
      : 'Save this if it helps. Then do one small thing with the idea.',
    '',
    tags(seed, 'en'),
  ].join('\n')
}

function blogPt(seed: string, tone: Tone) {
  return [
    `# ${seed}`,
    '',
    `Queres avançar com isto: ${seed}. Não falta mais um quadro branco. Falta um corte.`,
    '',
    '## O que isto pede',
    '',
    'Diz a ideia em duas frases. Escolhe quem precisa de a ouvir. Marca uma hora esta semana.',
    '',
    '## O tom',
    '',
    `Aqui o tom é ${TONE_PT[tone]}. Ajusta as frases até soarem a ti.`,
    '',
    '## Fecho',
    '',
    'Publica quando a frase já for tua, não quando estiver perfeita.',
  ].join('\n')
}

function blogEn(seed: string, tone: Tone) {
  return [
    `# ${seed}`,
    '',
    `You want to move this forward: ${seed}. You do not need another whiteboard. You need a cut.`,
    '',
    '## What it asks',
    '',
    'Say the idea in two sentences. Pick who needs to hear it. Put an hour on this week.',
    '',
    '## Tone',
    '',
    `Here the tone is ${TONE_EN[tone]}. Tune the lines until they sound like you.`,
    '',
    '## Close',
    '',
    'Publish when the line already sounds like you, not when it is perfect.',
  ].join('\n')
}
