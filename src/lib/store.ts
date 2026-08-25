import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PLATFORMS, type Pack, type Platform, type QueueItem } from './types'

const dir = path.join(process.cwd(), 'data')
const historyFile = path.join(dir, 'history.json')
const queueFile = path.join(dir, 'queue.json')

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJson(file: string, value: unknown) {
  await mkdir(dir, { recursive: true })
  await writeFile(file, JSON.stringify(value, null, 2), 'utf8')
}

export async function listPacks(): Promise<Pack[]> {
  const packs = await readJson<Pack[]>(historyFile, [])
  return packs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function savePack(pack: Pack) {
  const packs = await listPacks()
  const next = [pack, ...packs.filter((item) => item.id !== pack.id)].slice(0, 80)
  await writeJson(historyFile, next)
  return pack
}

export async function patchPack(id: string, texts: Partial<Record<Platform, string>>) {
  const packs = await listPacks()
  const current = packs.find((item) => item.id === id)
  if (!current) return null
  for (const platform of PLATFORMS) {
    const value = texts[platform]
    if (typeof value === 'string') current.texts[platform] = value
  }
  await writeJson(historyFile, packs)
  return current
}

export async function listQueue(): Promise<QueueItem[]> {
  const items = await readJson<QueueItem[]>(queueFile, [])
  return items.sort((a, b) => a.when.localeCompare(b.when))
}

export async function saveQueueItem(item: QueueItem) {
  const items = await listQueue()
  items.push(item)
  await writeJson(queueFile, items)
  return item
}

export async function deletePack(id: string) {
  const packs = await listPacks()
  const next = packs.filter((item) => item.id !== id)
  await writeJson(historyFile, next)
  return next
}

export async function deleteQueueItem(id: string) {
  const items = await listQueue()
  const next = items.filter((item) => item.id !== id)
  await writeJson(queueFile, next)
  return next
}
