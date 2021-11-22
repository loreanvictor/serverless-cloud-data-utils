export * from './options'
export * from './base'
export * from './primary'
export * from './secondary'


import { BaseIndex } from './base'
import {
  NamespacedPrimaryIndexOptions, NamespacedSecondaryIndexOptions,
  AnonymousPrimaryIndexOptions, AnonymousSecondaryIndexOptions,
  IndexOptions,
  isSecondaryIndexOptions, isNamespacedIndexOptions } from './options'
import { PrimaryIndex, NamespacedPrimaryIndex, AnonymousPrimaryIndex } from './primary'
import { SecondaryIndex, NamespacedSecondaryIndex, AnonymousSecondaryIndex } from './secondary'


export type NamespacedIndex<T> = NamespacedPrimaryIndex<T> | NamespacedSecondaryIndex<T>
export type AnonymousIndex<T> = AnonymousPrimaryIndex<T> | AnonymousSecondaryIndex<T>
export type Index<T> = PrimaryIndex<T> | SecondaryIndex<T>


/**
 *
 * Builds an index from the given options. An index describes an access path to
 * database objects. It is highly recommended to provide a namespace in the options,
 * indexes without a namespace cannot be used to conduct operations (e.g. less than, between, partial, etc).
 *
 * Each model **MUST** have exactly one primary index, i.e. an index without a label. For having multiple
 * access paths, you need to create secondary indexes, which means you need to provide a label. The label
 * **MUST** be unique per model, i.e. each model can have at most one secondary index with a given label.
 *
 * ```ts
 * const primaryIndex = buildIndex({ namespace: 'orders' })
 * const secondaryIndex = buildIndex({ namespace: 'orders', label: 'label1' })
 * ```
 *
 * A converter may also be passed, for values that are not strings or do not default into
 * legal strings for key expressions. For example, time strings are not allowed in key expressions by default,
 * but using `timekey()` as converter will allow you to use time strings as keys.
 *
 * ```ts
 * const primaryIndex = buildIndex({ namespace: 'orders', converter: timekey })
 * ```
 *
 */
export function buildIndex<T=any>(options?: AnonymousPrimaryIndexOptions<T>): AnonymousPrimaryIndex<T>
export function buildIndex<T=any>(options: NamespacedPrimaryIndexOptions<T>): NamespacedPrimaryIndex<T>
export function buildIndex<T=any>(options: AnonymousSecondaryIndexOptions<T>): AnonymousSecondaryIndex<T>
export function buildIndex<T=any>(options: NamespacedSecondaryIndexOptions<T>): NamespacedSecondaryIndex<T>
export function buildIndex<T=any>(options?: IndexOptions<T>) {
  if (!options) {
    return new AnonymousPrimaryIndex<T>()
  } else if (isNamespacedIndexOptions(options)) {
    if (isSecondaryIndexOptions(options)) {
      return new NamespacedSecondaryIndex<T>(options)
    } else {
      return new NamespacedPrimaryIndex<T>(options)
    }
  } else {
    if (isSecondaryIndexOptions(options)) {
      return new AnonymousSecondaryIndex<T>(options)
    } else {
      return new AnonymousPrimaryIndex<T>(options)
    }
  }
}


export function isNamespaced<T>(index: BaseIndex<T>): index is NamespacedIndex<T> {
  return (index.options as any).namespace !== undefined
}
