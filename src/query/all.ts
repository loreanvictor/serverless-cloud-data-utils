import { all } from '..'
import { BaseIndex, PrimaryIndex, SecondaryIndex } from '../indexes'
import { PrimaryExact, SecondaryExact } from './exact'
import { MultiQuery } from './multi'
import { Between, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, Partial } from './operators'


export class All<T=any> extends MultiQuery<T> {
  constructor(i: BaseIndex<T>) { super(i, all()) }

  lessThan(t: T) { return new LessThan(this.index, t) }
  greaterThan(t: T) { return new GreaterThan(this.index, t) }
  leq(t: T) { return new LessThanOrEqual(this.index, t) }
  geq(t: T) { return new GreaterThanOrEqual(this.index, t) }
  between(a: T, b: T) { return new Between(this.index, a, b) }
  partial(t: T) { return new Partial(this.index, t) }

  before(t: T) { return this.lessThan(t) }
  after(t: T) { return this.greaterThan(t) }
}


export class PrimaryAll<T=any> extends All<T> {
  constructor(i: PrimaryIndex<T>) { super(i) }

  exact(t: T) {
    return new PrimaryExact(this.index, t)
  }

  equals(t: T) {
    return this.exact(t)
  }
}


export class SecondaryAll<T=any> extends All<T> {
  constructor(i: SecondaryIndex<T>) { super(i) }

  exact(t: T) {
    return new SecondaryExact(this.index, t)
  }

  equals(t: T) {
    return this.exact(t)
  }
}
