import { between, greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, partial } from '../operators'
import { BaseIndex } from '../indexes'
import { MultiQuery } from './multi'


export class Partial<T=any> extends MultiQuery<T> {
  constructor(i: BaseIndex<T>, param: T) { super(i, partial(param)) }
}

export class LessThan<T=any> extends MultiQuery<T> {
  constructor(i: BaseIndex<T>, param: T) { super(i, lessThan(param)) }
}

export class GreaterThan<T=any> extends MultiQuery<T> {
  constructor(i: BaseIndex<T>, param: T) { super(i, greaterThan(param)) }
}

export class LessThanOrEqual<T=any> extends MultiQuery<T> {
  constructor(i: BaseIndex<T>, param: T) { super(i, lessThanOrEqual(param)) }
}

export class GreaterThanOrEqual<T=any> extends MultiQuery<T> {
  constructor(i: BaseIndex<T>, param: T) { super(i, greaterThanOrEqual(param)) }
}

export class Between<T=any> extends MultiQuery<T> {
  constructor(i: BaseIndex<T>, a: T, b: T) { super(i, between(a, b)) }
}
