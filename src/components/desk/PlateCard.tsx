'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { hashtagCount, overLimit, remaining } from '@/lib/press'
import { LIMITS, type Platform } from '@/lib/types'
import { motion } from 'framer-motion'

type Props = {
  platform: Platform
  label: string
  text: string
  index: number
  busy: boolean
  copied: boolean
  onChange: (value: string) => void
  onCopy: () => void
  onSchedule: () => void
  onRegen: () => void
}

export function PlateCard({
  platform,
  label,
  text,
  index,
  busy,
  copied,
  onChange,
  onCopy,
  onSchedule,
  onRegen,
}: Props) {
  const { t } = useLocale()
  const overflow = overLimit(platform, text)
  const left = remaining(platform, text)
  const tags = platform === 'instagram' ? hashtagCount(text) : 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="sheet plate p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="stamp">{label}</p>
        <p className={`text-xs ${overflow ? 'over' : 'faint'}`}>
          {overflow ? t.over : `${left} ${t.left}`} · {text.length}/{LIMITS[platform]}
        </p>
      </div>
      <motion.div
        className="ink-bar mt-3"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: busy && !text ? 0.2 : text ? 1 : 0 }}
      />
      <textarea
        className={`field mt-4 min-h-[12rem] resize-y ${overflow ? 'over' : ''}`}
        value={text}
        onChange={(e) => onChange(e.target.value)}
      />
      {platform === 'instagram' ? (
        <p className="faint mt-2 text-xs">
          {tags} {t.tags}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn-ghost" onClick={onCopy}>
          {copied ? t.copied : t.copy}
        </button>
        <button type="button" className="btn-ghost" disabled={!text.trim()} onClick={onSchedule}>
          {t.schedule}
        </button>
        <button type="button" className="btn-ghost" disabled={busy} onClick={onRegen}>
          {t.regen}
        </button>
      </div>
    </motion.article>
  )
}
