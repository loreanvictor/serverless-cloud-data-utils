import { all } from '../operators'
import {
  NamespacedIndex, AnonymousIndex,
  NamespacedPrimaryIndex, NamespacedSecondaryIndex,
  AnonymousPrimaryIndex, AnonymousSecondaryIndex
} from '../indexes'
import { PrimaryExact, SecondaryExact } from './exact'
import { MultiQuery } from './multi'
import { Between, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, Partial } from './operators'


export class NamespacedAll<T=any> extends MultiQuery<T> {
  constructor(i: NamespacedIndex<T>) { super(i, all()) }

  lessThan(t: T) { return new LessThan(this.index, t) }
  greaterThan(t: T) { return new GreaterThan(this.index, t) }
  leq(t: T) { return new LessThanOrEqual(this.index, t) }
  geq(t: T) { return new GreaterThanOrEqual(this.index, t) }
  between(a: T, b: T) { return new Between(this.index, a, b) }
  partial(t: T) { return new Partial(this.index, t) }

  before(t: T) { return this.lessThan(t) }
  after(t: T) { return this.greaterThan(t) }
  startsWith(t: T) { return this.partial(t) }
}


export class NamespacedPrimaryAll<T=any> extends NamespacedAll<T> {
  constructor(i: NamespacedPrimaryIndex<T>) { super(i) }

  exact(t: T) {
    return new PrimaryExact(this.index, t)
  }

  equals(t: T) {
    return this.exact(t)
  }
}


export class NamespacedSecondaryAll<T=any> extends NamespacedAll<T> {
  constructor(i: NamespacedSecondaryIndex<T>) { super(i) }

  exact(t: T) {
    return new SecondaryExact(this.index, t)
  }

  equals(t: T) {
    return this.exact(t)
  }
}


export class AnonymousAll<T=any> extends MultiQuery<T> {
  constructor(i: AnonymousIndex<T>) { super(i, all()) }
}


export class AnonymousPrimaryAll<T=any> extends AnonymousAll<T> {
  constructor(i: AnonymousPrimaryIndex<T>) { super(i) }

  exact(t: T) {
    return new PrimaryExact(this.index, t)
  }

  equals(t: T) {
    return this.exact(t)
  }
}


export class AnonymousSecondaryAll<T=any> extends AnonymousAll<T> {
  constructor(i: AnonymousSecondaryIndex<T>) { super(i) }

  exact(t: T) {
    return new SecondaryExact(this.index, t)
  }

  equals(t: T) {
    return this.exact(t)
  }
}
