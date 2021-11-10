import { BaseIndex } from './base'
import { SecondaryIndexOptions } from './options'


export class SecondaryIndex<T=any> extends BaseIndex<T> {
  constructor(
    readonly options: SecondaryIndexOptions<T>
  ) { super(options) }
}


export function isSecondary<T>(index: BaseIndex<T>): index is SecondaryIndex<T> {
  return !index.primary()
}
