import { data } from '@serverless/cloud'

import { GetOptions, Label, ResponseList } from './type-helpers'

import {
  all, between, equals, greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, partial,
  Operation, Converter,
} from './operators'

export interface IndexOptions<T=any> {
  namespace?: string
  label?: Label,
  converter?: Converter<T>,
}

export class Index<T=any> {
  constructor(
    readonly options: IndexOptions = {}
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

  for(t: T): Exact<T> {
    return new Exact(this, t)
  }

  primary() {
    return this.options.label === undefined
  }
}

export abstract class Query<T=any> {
  constructor(
    readonly index: Index<T>,
  ) { }

  protected abstract operation(): Operation<T>

  query() { return this.index.operate(this.operation()) }
  options(): GetOptions {
    if (this.index.options.label) {
      return { label: this.index.options.label }
    } else {
      return {}
    }
  }

  async resolve() {
    return await data.get(this.query(), this.options())
  }
}

export class Exact<T=any> extends Query<T> {
  constructor(index: Index<T>, readonly param: T) { super(index) }
  protected operation() { return equals(this.param) }

  async get<M>(CLS: new (obj: any) => M): Promise<M | undefined> {
    const res = await this.resolve()

    if (!res) {
      return undefined
    } else {
      return new CLS(res)
    }
  }
}

export interface MultiQueryOptions<T> {
  start?: T,
  reverse?: boolean,
  limit?: number,
}

export class MultiQuery<T=any> extends Query<T> {
  constructor(
    index: Index<T>,
    readonly op: Operation<T>,
    readonly opts: MultiQueryOptions<T> = {}
  ) {
    super(index)
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

  async get<M>(CLS: new (obj: any) => M): Promise<M[]> {
    return (await this.resolve() as ResponseList<any>).items.map(item => new CLS(item.value))
  }

  async keys(): Promise<string[]> {
    return (await this.resolve() as ResponseList<any>).items.map(i => i.key)
  }
}

export class Partial<T=any> extends MultiQuery<T> {
  constructor(index: Index<T>, param: T) { super(index, partial(param)) }
}

export class LessThan<T=any> extends MultiQuery<T> {
  constructor(index: Index<T>, param: T) { super(index, lessThan(param)) }
}

export class GreaterThan<T=any> extends MultiQuery<T> {
  constructor(index: Index<T>, param: T) { super(index, greaterThan(param)) }
}

export class LessThanOrEqual<T=any> extends MultiQuery<T> {
  constructor(index: Index<T>, param: T) { super(index, lessThanOrEqual(param)) }
}

export class GreaterThanOrEqual<T=any> extends MultiQuery<T> {
  constructor(index: Index<T>, param: T) { super(index, greaterThanOrEqual(param)) }
}

export class Between<T=any> extends MultiQuery<T> {
  constructor(index: Index<T>, a: T, b: T) { super(index, between(a, b)) }
}

export class All<T=any> extends MultiQuery<T> {
  constructor(index: Index<T>) { super(index, all()) }

  lessThan(t: T) { return new LessThan(this.index, t) }
  greaterThan(t: T) { return new GreaterThan(this.index, t) }
  leq(t: T) { return new LessThanOrEqual(this.index, t) }
  geq(t: T) { return new GreaterThanOrEqual(this.index, t) }
  between(a: T, b: T) { return new Between(this.index, a, b) }
  exact(t: T) { return new Exact(this.index, t) }
  partial(t: T) { return new Partial(this.index, t) }

  equals(t: T) { return this.exact(t) }
  before(t: T) { return this.lessThan(t) }
  after(t: T) { return this.greaterThan(t) }
}

export function indexBy<T=any>(index: Index<T>) {
  return new All<T>(index)
}
