import { Operation } from '../operators'
import { IndexOptions, isNamespacedIndexOptions } from './options'


export abstract class BaseIndex<T=any> {
  constructor(
    readonly options: IndexOptions
  ) {}

  convert(t: T): string {
    return this.options.converter ? this.options.converter(t) : (t as any).toString()
  }

  operate(op: Operation<T>) {
    return (
      (isNamespacedIndexOptions(this.options) ? `${this.options.namespace}:` : '')
     + op(t => this.convert(t))
    )
  }

  primary() {
    return (this.options as any).label === undefined
  }
}
