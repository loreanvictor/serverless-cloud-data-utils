import { Operation } from '../operators'
import { IndexOptions } from './options'


export abstract class BaseIndex<T=any> {
  constructor(
    readonly options: IndexOptions
  ) {}

  convert(t: T): string {
    return this.options.converter ? this.options.converter(t) : (t as any).toString()
  }

  operate(op: Operation<T>) {
    return (
      (this.options.namespace ? `${this.options.namespace}:` : '')
     + op(t => this.convert(t))
    )
  }

  primary() {
    return (this.options as any).label === undefined
  }
}
