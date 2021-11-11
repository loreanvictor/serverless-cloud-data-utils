export * from './base'
export * from './multi'
export * from './exact'
export * from './operators'
export * from './all'


import { PrimaryIndex, SecondaryIndex, isPrimary } from '../indexes'
import { PrimaryAll, SecondaryAll } from './all'


export function indexBy<T=any>(i: SecondaryIndex<T>): SecondaryAll<T>
export function indexBy<T=any>(i: PrimaryIndex<T>): PrimaryAll<T>
export function indexBy<T=any>(i: PrimaryIndex<T> | SecondaryIndex<T>) {
  if (isPrimary(i)) {
    return new PrimaryAll(i)
  } else {
    return new SecondaryAll(i)
  }
}
