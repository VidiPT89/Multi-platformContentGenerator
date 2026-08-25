'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function Landing() {
  const { t } = useLocale()
  const feats = [
    t.featThemeIn,
    t.featParallel,
    t.featEdit,
    t.featRegen,
    t.featHistory,
    t.featQueue,
    t.featSchedule,
    t.featI18n,
    t.featModes,
  ]
  const plates = [t.twitter, t.linkedin, t.instagram, t.blog]

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <h1 className="display amber text-6xl leading-none tracking-[-0.03em] sm:text-7xl">{t.brand}</h1>
        <p className="mt-4 text-2xl">{t.product}</p>
        <p className="muted mt-5 max-w-[42rem] text-lg leading-relaxed">{t.heroLead}</p>
        <div className="filament mt-8" />
        <Link href="/desk" className="btn mt-8 inline-block">
          {t.enter}
        </Link>
      </div>
      <div className="relative">
        <div className="wax-seal" aria-hidden />
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="sheet relative p-6"
        >
          <div className="grid grid-cols-2 gap-3">
            {plates.map((plate, index) => (
              <motion.div
                key={plate}
                className="plate rounded-xl border p-3"
                style={{ borderColor: 'var(--line)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.08 }}
              >
                <p className="stamp">{plate}</p>
                <span className="ink-bar mt-3 block" />
              </motion.div>
            ))}
          </div>
          <ul className="mt-5 space-y-2">
            {feats.map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-sm">
                <span className="h-2 w-2 rounded-full" style={{ background: 'var(--ember)' }} />
                {feat}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
