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
  return `You write for ECO, a press that echoes one theme across four platforms. Use ${toneLine}. ${lang}\n${rules[platform]}\nReturn only the copy.`
}

function twitterPt(seed: string, tone: Tone) {
  if (tone === 'punchy') return `${seed}: uma ideia, quatro vozes. Publica hoje.`
  if (tone === 'playful') return `${seed}, mas em 280 caracteres e sem drama. Eco a eco.`
  if (tone === 'warm') return `Ando a pensar nisto: ${seed}. Se te disser alguma coisa, responde.`
  return `${seed}. Um tema, quatro formatos. Começa pelo mais curto.`
}

function twitterEn(seed: string, tone: Tone) {
  if (tone === 'punchy') return `${seed}: one idea, four voices. Publish today.`
  if (tone === 'playful') return `${seed}, in 280 characters and without the fuss.`
  if (tone === 'warm') return `I keep coming back to this: ${seed}. If it lands, say so.`
  return `${seed}. One theme, four formats. Start with the shortest.`
}

function linkedinPt(seed: string, tone: Tone) {
  return [
    `Tema: ${seed}.`,
    '',
    tone === 'formal'
      ? 'A mesma mensagem não cabe igual em todas as redes. O que funciona no LinkedIn cansa no X, e o que serve de legenda no Instagram não é um artigo.'
      : 'A mesma ideia muda de fato consoante a sala. No escritório fala-se de um modo; na rua, de outro.',
    '',
    'O ECO parte de um tema e de um tom, e devolve quatro versões para editares à mão antes de publicares.',
    '',
    tone === 'punchy' ? 'Menos ruído. Mais eco.' : 'Se isto te for útil, guarda o pacote e agenda quando fizer sentido.',
  ].join('\n')
}

function linkedinEn(seed: string, tone: Tone) {
  return [
    `Theme: ${seed}.`,
    '',
    tone === 'formal'
      ? 'The same message does not fit every network. What works on LinkedIn tires on X, and an Instagram caption is not an article.'
      : 'The same idea changes clothes with the room. The office and the street do not share a voice.',
    '',
    'ECO starts from a theme and a tone, then returns four versions for you to edit before you publish.',
    '',
    tone === 'punchy' ? 'Less noise. More echo.' : 'If this helps, save the pack and schedule it when it is time.',
  ].join('\n')
}

function instagramPt(seed: string, tone: Tone) {
  return [
    tone === 'playful' ? `Psst: ${seed}.` : seed,
    '',
    'Quatro placas. Uma tinta. Tu escolhes o tom e afinás o texto antes de sair.',
    '',
    '#conteudo #redessociais #ividi #copywriting #linkedin #instagram #twitter #blog',
  ].join('\n')
}

function instagramEn(seed: string, tone: Tone) {
  return [
    tone === 'playful' ? `Psst: ${seed}.` : seed,
    '',
    'Four plates. One ink. You pick the tone and tune the line before it leaves.',
    '',
    '#content #socialmedia #ividi #copywriting #linkedin #instagram #twitter #blog',
  ].join('\n')
}

function blogPt(seed: string, tone: Tone) {
  return [
    `# ${seed}`,
    '',
    'Um tema não é um post. É a semente. O post é o que acontece quando essa semente encontra o sítio certo.',
    '',
    '## Quatro salas',
    '',
    'X pede um corte. O LinkedIn pede um argumento. O Instagram pede um gancho e ar. O blog pede tempo.',
    '',
    '## O tom',
    '',
    `Aqui o tom é ${TONE_PT[tone]}. Muda o tom e o mesmo tema veste outra voz, sem reescreveres tudo do zero.`,
    '',
    '## Como usar',
    '',
    'Gera as quatro versões, edita na placa, guarda no histórico e agenda (fila local ou Buffer, se tiveres token).',
    '',
    'Publica quando a frase já for tua.',
  ].join('\n')
}

function blogEn(seed: string, tone: Tone) {
  return [
    `# ${seed}`,
    '',
    'A theme is not a post. It is the seed. The post is what happens when that seed meets the right room.',
    '',
    '## Four rooms',
    '',
    'X wants a cut. LinkedIn wants an argument. Instagram wants a hook and air. The blog wants time.',
    '',
    '## Tone',
    '',
    `Here the tone is ${TONE_EN[tone]}. Change the tone and the same theme wears another voice, without starting from a blank page.`,
    '',
    '## How to use it',
    '',
    'Generate the four versions, edit on the plate, save to history and schedule (local queue or Buffer, if you have a token).',
    '',
    'Publish when the line already sounds like you.',
  ].join('\n')
}
