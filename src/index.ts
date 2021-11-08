export * from './query'
export * from './model'
export * from './operators'
export * from './util'

import { Index, All } from './query'

export function index<T=any>(i: Index<T>) {
  return new All<T>(i)
}
