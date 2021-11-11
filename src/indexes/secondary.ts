import { BaseIndex } from './base'
import { NamespacedSecondaryIndexOptions, AnonymousSecondaryIndexOptions } from './options'


export class AnonymousSecondaryIndex<T=any> extends BaseIndex<T> {
  constructor(readonly options: AnonymousSecondaryIndexOptions<T>) { super(options) }
}


export class NamespacedSecondaryIndex<T=any> extends BaseIndex<T> {
  constructor(readonly options: NamespacedSecondaryIndexOptions<T>) { super(options) }
}


export type SecondaryIndex<T=any> = NamespacedSecondaryIndex<T> | AnonymousSecondaryIndex<T>


export function isSecondary<T>(index: BaseIndex<T>): index is SecondaryIndex<T> {
  return !index.primary()
}
