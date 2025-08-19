// Lightweight client-side JSON cache with TTL (works on Vercel/Netlify)
// Uses localStorage when available; falls back to in-memory

type CacheEntry = { ts: number; data: any }

const memoryCache = new Map<string, CacheEntry>()
const PREFIX = 'client-json-cache:'

function now() {
  return Date.now()
}

function readStorage(key: string): CacheEntry | null {
  try {
    if (typeof window === 'undefined') return memoryCache.get(key) || null
    const raw = window.localStorage.getItem(PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeStorage(key: string, entry: CacheEntry) {
  try {
    if (typeof window === 'undefined') {
      memoryCache.set(key, entry)
      return
    }
    window.localStorage.setItem(PREFIX + key, JSON.stringify(entry))
  } catch {
    // ignore
  }
}

export function invalidateCache(key: string) {
  try {
    if (typeof window === 'undefined') {
      memoryCache.delete(key)
      return
    }
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}

export async function cachedFetchJSON<T = any>(url: string, ttlMs: number = 300000): Promise<T> {
  const key = url
  const entry = readStorage(key)
  const nowTs = now()
  if (entry && nowTs - entry.ts < ttlMs) {
    return entry.data as T
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`)
  const data = (await res.json()) as T
  writeStorage(key, { ts: nowTs, data })
  return data
}


