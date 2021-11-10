import { BaseIndex } from './base'
import { PrimaryIndexOptions } from './options'


export class PrimaryIndex<T=any> extends BaseIndex<T> {
  constructor(
    readonly options: PrimaryIndexOptions<T> = {}
  ) { super(options) }
}


export function isPrimary<T>(index: BaseIndex<T>): index is PrimaryIndex<T> {
  return index.primary()
}
