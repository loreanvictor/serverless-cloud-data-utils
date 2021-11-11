import { NamespacedPrimaryIndexOptions, AnonymousPrimaryIndexOptions } from './options'
import { BaseIndex } from './base'


export class AnonymousPrimaryIndex<T=any> extends BaseIndex<T> {
  constructor(readonly options: AnonymousPrimaryIndexOptions<T> = {}) { super(options) }
}


export class NamespacedPrimaryIndex<T=any> extends BaseIndex<T> {
  constructor(readonly options: NamespacedPrimaryIndexOptions<T>) { super(options) }
}


export type PrimaryIndex<T=any> = NamespacedPrimaryIndex<T> | AnonymousPrimaryIndex<T>


export function isPrimary<T>(index: BaseIndex<T>): index is PrimaryIndex<T> {
  return index.primary()
}
