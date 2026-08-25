'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { LIMITS, PLATFORMS, type Pack, type Platform, type Tone } from '@/lib/types'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'

const empty = (): Record<Platform, string> => ({ twitter: '', linkedin: '', instagram: '', blog: '' })

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
  const [when, setWhen] = useState(defaultWhen)
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState<Platform | null>(null)

  const labels = useMemo(
    () => ({ twitter: t.twitter, linkedin: t.linkedin, instagram: t.instagram, blog: t.blog }),
    [t],
  )

  const loadHistory = useCallback(async () => {
    const [hist, sched] = await Promise.all([fetch('/api/history'), fetch('/api/schedule')])
    if (hist.ok) {
      const data = (await hist.json()) as { packs: Pack[] }
      setPacks(data.packs)
    }
    if (sched.ok) {
      const data = (await sched.json()) as { buffer: boolean }
      setBuffer(data.buffer)
    }
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  async function generate() {
    if (topic.trim().length < 3) {
      setNote(t.needTopic)
      return
    }
    setBusy(true)
    setNote('')
    setTexts(empty)
    setPackId(crypto.randomUUID())
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), tone, locale }),
      })
      if (!res.ok || !res.body) throw new Error('generate')
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
          if (event.type === 'delta' && event.platform && event.text) {
            setTexts((prev) => ({ ...prev, [event.platform!]: prev[event.platform!] + event.text }))
          }
        }
      }
    } catch {
      setNote(t.error)
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: packId || crypto.randomUUID(),
        topic: topic.trim(),
        tone,
        locale,
        texts,
      }),
    })
    if (!res.ok) {
      setNote(t.error)
      return
    }
    const data = (await res.json()) as { pack: Pack }
    setPackId(data.pack.id)
    setNote(t.saved)
    await loadHistory()
  }

  async function copy(platform: Platform) {
    await navigator.clipboard.writeText(texts[platform])
    setCopied(platform)
    window.setTimeout(() => setCopied(null), 1400)
  }

  async function schedule(platform: Platform) {
    if (!texts[platform].trim()) return
    const iso = new Date(when).toISOString()
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
  }

  function openPack(pack: Pack) {
    setPackId(pack.id)
    setTopic(pack.topic)
    setTone(pack.tone)
    setTexts(pack.texts)
    setNote('')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        <p className="stamp">{busy ? t.generating : live ? t.liveModel : t.localTools}</p>
        <h1 className="display amber mt-3 text-5xl tracking-[-0.03em]">{t.desk}</h1>
        <p className="muted mt-3 max-w-[46rem]">{t.localHint}</p>

        <label className="tone mt-8 block">
          <span>{t.topic}</span>
          <textarea
            className="field mt-2 min-h-[6.5rem]"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.topicHint}
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
          <button type="button" className="btn-ghost" disabled={!topic.trim()} onClick={() => void save()}>
            {t.save}
          </button>
        </div>
        {note ? <p className="amber mt-3 text-sm">{note}</p> : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {PLATFORMS.map((platform, index) => (
            <motion.article
              key={platform}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="sheet plate p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="stamp">{labels[platform]}</p>
                <p className="faint text-xs">
                  {texts[platform].length}/{LIMITS[platform]} {t.chars}
                </p>
              </div>
              <motion.div
                className="ink-bar mt-3"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: busy && !texts[platform] ? 0.2 : texts[platform] ? 1 : 0 }}
              />
              <textarea
                className="field mt-4 min-h-[12rem] resize-y"
                value={texts[platform]}
                onChange={(e) => setTexts((prev) => ({ ...prev, [platform]: e.target.value }))}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn-ghost" onClick={() => void copy(platform)}>
                  {copied === platform ? t.copied : t.copy}
                </button>
                <button type="button" className="btn-ghost" onClick={() => void schedule(platform)}>
                  {t.schedule}
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="tone">
            <span>{t.when}</span>
            <input className="field" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </label>
          <p className="stamp">{buffer ? t.bufferOn : t.bufferOff}</p>
        </div>
      </div>

      <aside className="sheet h-fit p-5">
        <p className="stamp">{t.history}</p>
        <ul className="mt-4 space-y-2">
          {packs.length === 0 ? <li className="muted text-sm">{t.emptyHistory}</li> : null}
          {packs.map((pack) => (
            <li key={pack.id}>
              <button type="button" className="row w-full rounded-xl px-3 py-2 text-left" onClick={() => openPack(pack)}>
                <span className="block truncate">{pack.topic}</span>
                <span className="faint text-xs">{pack.tone}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
