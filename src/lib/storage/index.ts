import { LocalStorage } from './local'
import { KVStorage } from './kv'
import type { IStorage } from './interface'

let _storage: IStorage | null = null

export function getStorage(): IStorage {
  if (_storage) return _storage
  _storage =
    process.env.USE_LOCAL_STORAGE === 'true' ? new LocalStorage() : new KVStorage()
  return _storage
}

export type { IStorage }
export * from './types'
