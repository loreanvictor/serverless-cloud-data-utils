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
