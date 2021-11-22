import { all } from '../operators'
import {
  NamespacedIndex, AnonymousIndex,
  NamespacedPrimaryIndex, NamespacedSecondaryIndex,
  AnonymousPrimaryIndex, AnonymousSecondaryIndex
} from '../indexes'
import { PrimaryExact, SecondaryExact } from './exact'
import { MultiQuery } from './multi'
import { Between, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, Partial } from './operators'


/**
 *
 * Represents a query on a namespace with potentially multiple results.
 *
 */
export class NamespacedAll<T=any> extends MultiQuery<T> {
  constructor(i: NamespacedIndex<T>) { super(i, all()) }

  /**
   *
   * @returns a query with items that are less than given value.
   *
   */
  lessThan(t: T) { return new LessThan(this.index, t) }

  /**
   *
   * @returns a query with items that are greater than the given value.
   *
   */
  greaterThan(t: T) { return new GreaterThan(this.index, t) }

  /**
   *
   * @returns a query with items that are less than or equal to the given value.
   *
   */
  leq(t: T) { return new LessThanOrEqual(this.index, t) }

  /**
   *
   * @returns a query with items that are greater than or equal to the given value.
   *
   */
  geq(t: T) { return new GreaterThanOrEqual(this.index, t) }

  /**
   *
   * @returns a query with items that are between the given values.
   *
   */
  between(a: T, b: T) { return new Between(this.index, a, b) }

  /**
   *
   * @returns a query with items starting with given value.
   *
   */
  partial(t: T) { return new Partial(this.index, t) }

  /**
   *
   * @returns a query with items that are less than the given value.
   *
   */
  before(t: T) { return this.lessThan(t) }

  /**
   *
   * @returns a query with items that are greater than the given value.
   *
   */
  after(t: T) { return this.greaterThan(t) }

  /**
   *
   * @returns a query with items that start with given value.
   *
   */
  startsWith(t: T) { return this.partial(t) }
}


/**
 *
 * Represent a query on a namespace with potentially multiple results,
 * indexed by a primary index.
 *
 */
export class NamespacedPrimaryAll<T=any> extends NamespacedAll<T> {
  constructor(i: NamespacedPrimaryIndex<T>) { super(i) }

  /**
   *
   * @returns a query resolving to the object with given value.
   *
   */
  exact(t: T) {
    return new PrimaryExact(this.index, t)
  }

  /**
   *
   * @returns a query resolving to the object with given value.
   *
   */
  equals(t: T) {
    return this.exact(t)
  }
}


/**
 *
 * Represent a query on a namespace with potentially multiple results,
 * indexed by a secondary index.
 *
 */
export class NamespacedSecondaryAll<T=any> extends NamespacedAll<T> {
  constructor(i: NamespacedSecondaryIndex<T>) { super(i) }

  /**
   *
   * @returns a query with all items matching given value.
   *
   */
  exact(t: T) {
    return new SecondaryExact(this.index, t)
  }

  /**
   *
   * @returns a query with all items matching given value.
   *
   */
  equals(t: T) {
    return this.exact(t)
  }
}


/**
 *
 * Represent a query multiple results without a namespace.
 *
 */
export class AnonymousAll<T=any> extends MultiQuery<T> {
  constructor(i: AnonymousIndex<T>) { super(i, all()) }
}


/**
 *
 * Represent a query multiple results without a namespace,
 * indexed by a primary index.
 *
 */
export class AnonymousPrimaryAll<T=any> extends AnonymousAll<T> {
  constructor(i: AnonymousPrimaryIndex<T>) { super(i) }

  /**
   *
   * @returns a query resolving to the object with given value.
   *
   */
  exact(t: T) {
    return new PrimaryExact(this.index, t)
  }

  /**
   *
   * @returns a query resolving to the object with given value.
   *
   */
  equals(t: T) {
    return this.exact(t)
  }
}


/**
 *
 * Represent a query multiple results without a namespace,
 * indexed by a secondary index.
 *
 */
export class AnonymousSecondaryAll<T=any> extends AnonymousAll<T> {
  constructor(i: AnonymousSecondaryIndex<T>) { super(i) }

  /**
   *
   * @returns a query with all items matching given value.
   *
   */
  exact(t: T) {
    return new SecondaryExact(this.index, t)
  }

  /**
   *
   * @returns a query with all items matching given value.
   *
   */
  equals(t: T) {
    return this.exact(t)
  }
}
