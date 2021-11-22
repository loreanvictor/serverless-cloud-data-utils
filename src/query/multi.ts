import { Operation, id } from '../operators'
import { BaseIndex } from '../indexes'
import { hydrate, ModelConstructor } from '../hydrate'
import { BaseQuery } from './base'
import { ResponseList } from '../type-helpers'


export interface MultiQueryOptions<T> {
  start?: T,
  reverse?: boolean,
  limit?: number,
}


/**
 *
 * Represents a query with potentially multiple results.
 *
 */
export class MultiQuery<T=any> extends BaseQuery<T> {
  constructor(
    i: BaseIndex<T>,
    readonly op: Operation<T>,
    readonly opts: MultiQueryOptions<T> = {}
  ) {
    super(i)
  }

  protected operation() { return this.op }

  /**
   *
   * @returns a query with items returned in reverse order.
   *
   */
  reverse() {
    return new MultiQuery(this.index, this.op, { ...this.opts, reverse: true })
  }

  /**
   *
   * @returns a query with items starting after given value. Useful for pagination.
   *
   */
  start(start: T) {
    return new MultiQuery(this.index, this.op, { ...this.opts, start })
  }

  /**
   *
   * @returns a query with a limited number of results.
   *
   */
  limit(limit: number) {
    return new MultiQuery(this.index, this.op, { ...this.opts, limit })
  }

  options() {
    const opts = super.options()

    if (this.opts.reverse) {
      opts.reverse = true
    }

    if (this.opts.start) {
      opts.start = this.index.operate(id(this.opts.start))
    }

    if (this.opts.limit) {
      opts.limit = this.opts.limit
    }

    return opts
  }

  /**
   *
   * Resolves the query using given model constructor, and returns a list of hydrated models.
   *
   */
  async get<M>(constructor: ModelConstructor<M>): Promise<M[]> {
    return (await this.resolve() as ResponseList<any>).items.map(item => hydrate(constructor, item.value))
  }

  /**
   *
   * Resolves the given query, returning all matching keys.
   *
   */
  async keys(): Promise<string[]> {
    return (await this.resolve() as ResponseList<any>).items.map(i => i.key)
  }
}
