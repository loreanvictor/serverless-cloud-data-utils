export * from './options'
export * from './base'
export * from './primary'
export * from './secondary'


export type Index<T> = PrimaryIndex<T> | SecondaryIndex<T>

import { PrimaryIndexOptions, SecondaryIndexOptions, isSecondaryIndexOptions } from './options'
import { PrimaryIndex } from './primary'
import { SecondaryIndex } from './secondary'


export function buildIndex<T=any>(options?: PrimaryIndexOptions<T>): PrimaryIndex<T>
export function buildIndex<T=any>(options: SecondaryIndexOptions<T>): SecondaryIndex<T>
export function buildIndex<T=any>(options?: PrimaryIndexOptions<T> | SecondaryIndexOptions<T>) {
  if (options && isSecondaryIndexOptions(options)) {
    return new SecondaryIndex(options)
  } else {
    return new PrimaryIndex(options)
  }
}
