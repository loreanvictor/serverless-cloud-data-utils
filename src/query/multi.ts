import { Operation } from '../operators'
import { BaseIndex } from '../indexes'
import { hydrate, ModelConstructor } from '../hydrate'
import { BaseQuery } from './base'
import { ResponseList } from '../type-helpers'


export interface MultiQueryOptions<T> {
  start?: T,
  reverse?: boolean,
  limit?: number,
}


export class MultiQuery<T=any> extends BaseQuery<T> {
  constructor(
    i: BaseIndex<T>,
    readonly op: Operation<T>,
    readonly opts: MultiQueryOptions<T> = {}
  ) {
    super(i)
  }

  protected operation() { return this.op }

  reverse() {
    return new MultiQuery(this.index, this.op, { ...this.opts, reverse: true })
  }

  start(start: T) {
    return new MultiQuery(this.index, this.op, { ...this.opts, start })
  }

  limit(limit: number) {
    return new MultiQuery(this.index, this.op, { ...this.opts, limit })
  }

  options() {
    const opts = super.options()

    if (this.opts.reverse) {
      opts.reverse = true
    }

    if (this.opts.start) {
      opts.start = this.index.convert(this.opts.start)
    }

    if (this.opts.limit) {
      opts.limit = this.opts.limit
    }

    return opts
  }

  async get<M>(constructor: ModelConstructor<M>): Promise<M[]> {
    return (await this.resolve() as ResponseList<any>).items.map(item => hydrate(constructor, item.value))
  }

  async keys(): Promise<string[]> {
    return (await this.resolve() as ResponseList<any>).items.map(i => i.key)
  }
}
