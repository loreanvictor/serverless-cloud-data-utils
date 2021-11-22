import { equals } from '../operators'
import { BaseIndex } from '../indexes'
import { hydrate, ModelConstructor } from '../hydrate'
import { BaseQuery } from './base'
import { MultiQuery } from './multi'


/**
 *
 * Represents a query that resolves to a single model instance,
 * indexed by a primary key.
 *
 */
export class PrimaryExact<T=any> extends BaseQuery<T> {
  constructor(i: BaseIndex<T>, readonly param: T) { super(i) }
  protected operation() { return equals(this.param) }

  /**
   *
   * @returns a hydrated model instance, or undefined if no match is found.
   *
   */
  async get<M>(constructor: ModelConstructor<M>): Promise<M | undefined> {
    const res = await this.resolve() as object

    if (!res) {
      return undefined
    } else {
      return hydrate(constructor, res)
    }
  }
}


/**
 *
 * Represents a query that resolves to an exact value,
 * indexed by a secondary key.
 *
 */
export class SecondaryExact<T=any> extends MultiQuery<T> {
  constructor(i: BaseIndex<T>, param: T) { super(i, equals(param)) }
}


export type Exact<T=any> = PrimaryExact<T> | SecondaryExact<T>
