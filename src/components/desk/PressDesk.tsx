'use client'

import { PlateCard } from '@/components/desk/PlateCard'
import { SideRail } from '@/components/desk/SideRail'
import { useLocale } from '@/i18n/LocaleProvider'
import { PLATFORMS, type Pack, type Platform, type QueueItem, type Tone } from '@/lib/types'
import { parseWhen } from '@/lib/when'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const empty = (): Record<Platform, string> => ({ twitter: '', linkedin: '', instagram: '', blog: '' })
const TONE_KEY = 'eco-tone'

function defaultWhen() {
  const next = new Date(Date.now() + 60 * 60 * 1000)
  next.setMinutes(0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`
}

export function PressDesk() {
  const { t, locale } = useLocale()
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<Tone>('warm')
  const [texts, setTexts] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [live, setLive] = useState(false)
  const [buffer, setBuffer] = useState(false)
  const [packId, setPackId] = useState('')
  const [packs, setPacks] = useState<Pack[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [when, setWhen] = useState(defaultWhen)
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState<Platform | 'all' | null>(null)
  const [dirty, setDirty] = useState(false)
  const textsRef = useRef(texts)
  textsRef.current = texts

  const labels = useMemo(
    () => ({ twitter: t.twitter, linkedin: t.linkedin, instagram: t.instagram, blog: t.blog }),
    [t],
  )
  const sample = locale === 'en'
    ? 'Launching iVidi.dev: sites and apps for people and small businesses, from Cascais.'
    : 'Abrir a iVidi.dev: sites e apps para particulares e pequenas empresas, a partir de Cascais.'

  const loadHistory = useCallback(async () => {
    const [hist, sched, gen] = await Promise.all([fetch('/api/history'), fetch('/api/schedule'), fetch('/api/generate')])
    if (hist.ok) {
      const data = (await hist.json()) as { packs: Pack[] }
      setPacks(data.packs)
    }
    if (sched.ok) {
      const data = (await sched.json()) as { items: QueueItem[]; buffer: boolean }
      setQueue(data.items)
      setBuffer(data.buffer)
    }
    if (gen.ok) {
      const data = (await gen.json()) as { live: boolean }
      setLive(Boolean(data.live))
    }
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  useEffect(() => {
    const stored = localStorage.getItem(TONE_KEY)
    if (stored === 'formal' || stored === 'warm' || stored === 'punchy' || stored === 'playful') setTone(stored)
  }, [])

  useEffect(() => {
    localStorage.setItem(TONE_KEY, tone)
  }, [tone])

  useEffect(() => {
    if (!dirty || busy || topic.trim().length < 3) return
    const id = window.setTimeout(() => {
      void persist()
        .then(() => {
          setDirty(false)
          setNote(t.saved)
        })
        .catch(() => setNote(t.error))
    }, 900)
    return () => window.clearTimeout(id)
  }, [dirty, texts, busy, topic, t.saved, t.error])

  async function readStream(res: Response, platforms: Platform[]) {
    if (!res.ok || !res.body) throw new Error('generate')
    const acc = { ...textsRef.current }
    for (const platform of platforms) acc[platform] = ''
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const chunks = buf.split('\n\n')
      buf = chunks.pop() ?? ''
      for (const chunk of chunks) {
        const line = chunk.replace(/^data:\s*/, '')
        if (!line) continue
        const event = JSON.parse(line) as { type: string; live?: boolean; platform?: Platform; text?: string }
        if (event.type === 'meta') setLive(Boolean(event.live))
        if (event.type === 'delta' && event.platform && platforms.includes(event.platform) && event.text) {
          acc[event.platform] += event.text
          textsRef.current = { ...acc }
          setTexts({ ...acc })
        }
      }
    }
    return acc
  }

  async function persist(nextTexts = textsRef.current, id = packId) {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id || crypto.randomUUID(),
        topic: topic.trim(),
        tone,
        locale,
        texts: nextTexts,
      }),
    })
    if (!res.ok) throw new Error('save')
    const data = (await res.json()) as { pack: Pack }
    setPackId(data.pack.id)
    await loadHistory()
    return data.pack.id
  }

  async function generate(platforms: Platform[] = PLATFORMS) {
    if (topic.trim().length < 3) {
      setNote(t.needTopic)
      return
    }
    setBusy(true)
    setNote('')
    const id = packId || crypto.randomUUID()
    setPackId(id)
    if (platforms.length === PLATFORMS.length) setTexts(empty)
    else {
      setTexts((prev) => {
        const next = { ...prev }
        for (const platform of platforms) next[platform] = ''
        return next
      })
    }
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), tone, locale, platforms }),
      })
      const printed = await readStream(res, platforms)
      await persist(printed, id)
      setDirty(false)
      setNote(t.saved)
    } catch {
      setNote(t.error)
    } finally {
      setBusy(false)
    }
  }

  async function copy(platform: Platform) {
    try {
      await navigator.clipboard.writeText(texts[platform])
      setCopied(platform)
      window.setTimeout(() => setCopied(null), 1400)
    } catch {
      setNote(t.copyFail)
    }
  }

  async function copyAll() {
    try {
      const blob = PLATFORMS.map((platform) => `## ${labels[platform]}\n\n${texts[platform]}`).join('\n\n')
      await navigator.clipboard.writeText(blob)
      setCopied('all')
      window.setTimeout(() => setCopied(null), 1400)
    } catch {
      setNote(t.copyFail)
    }
  }

  async function schedule(platform: Platform) {
    if (!texts[platform].trim()) return
    const iso = parseWhen(when)
    if (!iso) {
      setNote(t.needWhen)
      return
    }
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId, platform, text: texts[platform], when: iso }),
    })
    if (!res.ok) {
      setNote(t.error)
      return
    }
    setNote(t.scheduled)
    await loadHistory()
  }

  async function scheduleAll() {
    for (const platform of PLATFORMS) {
      if (texts[platform].trim()) await schedule(platform)
    }
  }

  async function dropPack(id: string) {
    const res = await fetch('/api/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      const data = (await res.json()) as { packs: Pack[] }
      setPacks(data.packs)
      if (packId === id) {
        setPackId('')
        setTexts(empty)
      }
    }
  }

  async function dropQueue(id: string) {
    const res = await fetch('/api/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      const data = (await res.json()) as { items: QueueItem[] }
      setQueue(data.items)
    }
  }

  function openPack(pack: Pack) {
    setPackId(pack.id)
    setTopic(pack.topic)
    setTone(pack.tone)
    setTexts(pack.texts)
    setNote('')
    setDirty(false)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <p className="stamp">{busy ? t.generating : live ? t.liveModel : t.localTools}</p>
        <h1 className="display amber mt-3 text-5xl tracking-[-0.03em]">{t.desk}</h1>
        <p className="muted mt-3 max-w-[46rem]">{t.localHint}</p>
        <p className="faint mt-2 text-sm">{t.hintKeys}</p>

        <label className="tone mt-8 block">
          <span>{t.topic}</span>
          <textarea
            className="field mt-2 min-h-[6.5rem]"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.topicHint}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                void generate()
              }
            }}
          />
        </label>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="tone">
            <span>{t.tone}</span>
            <select className="field" value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
              <option value="formal">{t.formal}</option>
              <option value="warm">{t.warm}</option>
              <option value="punchy">{t.punchy}</option>
              <option value="playful">{t.playful}</option>
            </select>
          </label>
          <button type="button" className="btn" disabled={busy} onClick={() => void generate()}>
            {busy ? t.generating : t.generate}
          </button>
          <button type="button" className="btn-ghost" onClick={() => setTopic(sample)}>
            {t.sample}
          </button>
          <button type="button" className="btn-ghost" disabled={!topic.trim()} onClick={() => void persist().then(() => setNote(t.saved)).catch(() => setNote(t.error))}>
            {t.save}
          </button>
          <button type="button" className="btn-ghost" disabled={!texts.twitter && !texts.linkedin} onClick={() => void copyAll()}>
            {copied === 'all' ? t.copied : t.copyAll}
          </button>
        </div>
        {note ? <p className="amber mt-3 text-sm">{note}</p> : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {PLATFORMS.map((platform, index) => (
            <PlateCard
              key={platform}
              platform={platform}
              label={labels[platform]}
              text={texts[platform]}
              index={index}
              busy={busy}
              copied={copied === platform}
              onChange={(value) => {
                setTexts((prev) => ({ ...prev, [platform]: value }))
                setDirty(true)
              }}
              onCopy={() => void copy(platform)}
              onSchedule={() => void schedule(platform)}
              onRegen={() => void generate([platform])}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="tone">
            <span>{t.when}</span>
            <input className="field" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </label>
          <button type="button" className="btn-ghost" onClick={() => void scheduleAll()}>
            {t.scheduleAll}
          </button>
          <p className="stamp">{buffer ? t.bufferOn : t.bufferOff}</p>
        </div>
      </div>

      <SideRail
        packs={packs}
        queue={queue}
        packId={packId}
        onOpen={openPack}
        onDeletePack={(id) => void dropPack(id)}
        onDeleteQueue={(id) => void dropQueue(id)}
      />
    </div>
  )
}
