import { data } from '@serverless/cloud'

import { Operation } from '../operators'
import { BaseIndex, isSecondary } from '../indexes'
import { GetOptions } from '../type-helpers'


export abstract class BaseQuery<T=any> {
  constructor(
    readonly index: BaseIndex<T>,
  ) { }

  protected abstract operation(): Operation<T>

  query() { return this.index.operate(this.operation()) }
  options(): GetOptions {
    if (isSecondary(this.index)) {
      return { label: this.index.options.label }
    } else {
      return {}
    }
  }

  async resolve() {
    return await data.get(this.query(), this.options())
  }
}
