import { data } from '@serverless/cloud'

import { Operation } from '../operators'
import { BaseIndex, isSecondary } from '../indexes'
import { GetOptions } from '../type-helpers'


/**
 *
 * Represents a database query.
 *
 */
export abstract class BaseQuery<T=any> {
  constructor(
    readonly index: BaseIndex<T>,
  ) { }

  protected abstract operation(): Operation<T>

  /**
   *
   * @returns the query string (key expression) that can be sent to the database.
   *
   */
  query() { return this.index.operate(this.operation()) }

  /**
   *
   * @returns the options to be used when executing the query.
   *
   */
  options(): GetOptions {
    if (isSecondary(this.index)) {
      return { label: this.index.options.label }
    } else {
      return {}
    }
  }

  /**
   *
   * Resolves the query and returns the raw result.
   *
   */
  async resolve() {
    return await data.get(this.query(), this.options())
  }
}
