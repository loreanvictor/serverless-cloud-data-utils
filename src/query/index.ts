export * from './base'
export * from './multi'
export * from './exact'
export * from './operators'
export * from './all'


import {
  Index, isPrimary, isNamespaced,
  NamespacedPrimaryIndex, NamespacedSecondaryIndex,
  AnonymousPrimaryIndex, AnonymousSecondaryIndex,
} from '../indexes'
import {
  NamespacedPrimaryAll, NamespacedSecondaryAll,
  AnonymousPrimaryAll, AnonymousSecondaryAll,
} from './all'


export function indexBy<T=any>(i: NamespacedSecondaryIndex<T>): NamespacedSecondaryAll<T>
export function indexBy<T=any>(i: AnonymousSecondaryIndex<T>): AnonymousSecondaryAll<T>
export function indexBy<T=any>(i: NamespacedPrimaryIndex<T>): NamespacedPrimaryAll<T>
export function indexBy<T=any>(i: AnonymousPrimaryIndex<T>): AnonymousPrimaryAll<T>
export function indexBy<T=any>(i: Index<T>) {
  if (isPrimary(i)) {
    if (isNamespaced(i)) {
      return new NamespacedPrimaryAll(i)
    } else {
      return new AnonymousPrimaryAll(i)
    }
  } else {
    if (isNamespaced(i)) {
      return new NamespacedSecondaryAll(i)
    } else {
      return new AnonymousSecondaryAll(i)
    }
  }
}
