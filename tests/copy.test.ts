import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clip, localCopy } from '../src/lib/copy'
import { filledKey } from '../src/lib/keys'
import { parseTheme } from '../src/lib/theme'
import { profileFor } from '../src/lib/buffer'
import { filterPacks, hashtagCount, overLimit, pickPlatforms, remaining } from '../src/lib/press'
import { formatWhen, parseWhen } from '../src/lib/when'
import { LIMITS } from '../src/lib/types'

test('twitter copy stays within 280 characters', () => {
  const pack = localCopy('Lançar a iVidi.dev com um gerador de conteúdo para quatro redes', 'punchy', 'pt')
  assert.ok(pack.twitter.length <= LIMITS.twitter)
  assert.match(pack.twitter, /iVidi/)
})

test('english blog has a markdown title', () => {
  const pack = localCopy('Shipping a small press', 'formal', 'en')
  assert.match(pack.blog, /^# Shipping/)
  assert.match(pack.linkedin, /Shipping a small press/)
})

test('clip trims long twitter text', () => {
  const long = 'x'.repeat(400)
  const out = clip('twitter', long)
  assert.equal(out.length, 280)
  assert.equal(out.endsWith('…'), true)
})

test('tone changes the instagram hook', () => {
  const warm = localCopy('Café em Cascais', 'warm', 'pt')
  const play = localCopy('Café em Cascais', 'playful', 'pt')
  assert.notEqual(warm.instagram, play.instagram)
  assert.match(play.instagram, /Psst/)
})

test('theme defaults to dark', () => {
  assert.equal(parseTheme(null), 'dark')
  assert.equal(parseTheme('light'), 'light')
  assert.equal(parseTheme('nope'), 'dark')
})

test('filledKey rejects empty secrets', () => {
  assert.equal(filledKey(''), false)
  assert.equal(filledKey('short'), false)
  assert.equal(filledKey('long-enough-secret'), true)
})

test('buffer profile matching ignores blog', () => {
  const profiles = [
    { id: '1', service: 'twitter' },
    { id: '2', service: 'linkedin' },
  ]
  assert.equal(profileFor(profiles, 'twitter')?.id, '1')
  assert.equal(profileFor(profiles, 'blog'), null)
})

test('press helpers pick platforms, remaining and history search', () => {
  assert.deepEqual(pickPlatforms(['twitter']), ['twitter'])
  assert.deepEqual(pickPlatforms(['nope']), ['twitter', 'linkedin', 'instagram', 'blog'])
  assert.equal(remaining('twitter', 'hi'), 278)
  assert.equal(overLimit('twitter', 'x'.repeat(281)), true)
  assert.equal(hashtagCount('#cascais #iVidi noite'), 2)
  const packs = [
    {
      id: '1',
      topic: 'Café',
      tone: 'warm' as const,
      locale: 'pt' as const,
      createdAt: '2026-08-25',
      texts: { twitter: 'a', linkedin: 'b', instagram: '#sol', blog: 'c' },
    },
  ]
  assert.equal(filterPacks(packs, 'café').length, 1)
  assert.equal(filterPacks(packs, 'linkedin-only').length, 0)
})

test('relative time uses locale', () => {
  const now = Date.parse('2026-08-25T08:11:00.000Z')
  assert.equal(formatWhen('2026-08-25T08:10:00.000Z', 'pt', now), 'há 1 min')
  assert.equal(formatWhen('2026-08-25T08:10:00.000Z', 'en', now), '1m ago')
  assert.equal(parseWhen('nope'), null)
  assert.ok(parseWhen('2026-08-26T14:00'))
})
