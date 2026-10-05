'use client'

import { useCallback, useSyncExternalStore } from 'react'

// A small choice kept in localStorage (tone, view...). Read through useSyncExternalStore, so there
// is no setState in an effect and the server render always uses the fallback.
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function useStoredChoice<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): [T, (next: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      const stored = localStorage.getItem(key)
      return stored !== null && (allowed as readonly string[]).includes(stored) ? (stored as T) : fallback
    },
    () => fallback,
  )
  const set = useCallback(
    (next: T) => {
      localStorage.setItem(key, next)
      listeners.forEach((notify) => notify())
    },
    [key],
  )
  return [value, set]
}

const noSubscription = () => () => {}

/** A query-string flag, read during render (null on the server). */
export function useQueryFlag(name: string): string | null {
  return useSyncExternalStore(
    noSubscription,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  )
}
