'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { filterPacks } from '@/lib/press'
import type { Pack, QueueItem } from '@/lib/types'
import { formatSlot, formatWhen } from '@/lib/when'
import { useMemo, useState } from 'react'

type Props = {
  packs: Pack[]
  queue: QueueItem[]
  packId: string
  onOpen: (pack: Pack) => void
  onDeletePack: (id: string) => void
  onDeleteQueue: (id: string) => void
}

export function SideRail({ packs, queue, packId, onOpen, onDeletePack, onDeleteQueue }: Props) {
  const { t, locale } = useLocale()
  const [query, setQuery] = useState('')
  const visible = useMemo(() => filterPacks(packs, query), [packs, query])
  const tones = { formal: t.formal, warm: t.warm, punchy: t.punchy, playful: t.playful }

  return (
    <div className="space-y-5">
      <aside className="sheet p-5">
        <p className="stamp">{t.history}</p>
        <input className="field mt-3" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} />
        <ul className="mt-4 space-y-2">
          {visible.length === 0 ? <li className="muted text-sm">{t.emptyHistory}</li> : null}
          {visible.map((pack) => (
            <li key={pack.id} className="flex items-start gap-1">
              <button
                type="button"
                className={`row flex-1 px-3 py-2 ${pack.id === packId ? 'active' : ''}`}
                onClick={() => onOpen(pack)}
              >
                <span className="block truncate">{pack.topic}</span>
                <span className="faint text-xs">
                  {tones[pack.tone]} · {formatWhen(pack.createdAt, locale)}
                </span>
              </button>
              <button type="button" className="btn-ghost h-8 px-2 text-xs" onClick={() => onDeletePack(pack.id)}>
                {t.remove}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <aside className="sheet p-5">
        <p className="stamp">{t.queue}</p>
        <ul className="mt-4 space-y-3">
          {queue.length === 0 ? <li className="muted text-sm">{t.emptyQueue}</li> : null}
          {queue.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-2">
              <div>
                <p className="stamp">{item.platform}</p>
                <p className="faint mt-1 text-xs">{formatSlot(item.when, locale)}</p>
              </div>
              <button type="button" className="btn-ghost h-8 px-2 text-xs" onClick={() => onDeleteQueue(item.id)}>
                {t.remove}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
