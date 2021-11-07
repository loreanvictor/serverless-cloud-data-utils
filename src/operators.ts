export type Converter<T> = (value: T) => string

export type Operation<T=any> = (converter: Converter<T>) => string

export interface Operator<T=any> {
  (...keys: T[]): Operation<T>
}

export interface NullaryOperator<T=any> extends Operator<T> {
  (): Operation<T>
}

export interface UnaryOperator<T=any> extends Operator<T> {
  (key: T): Operation<T>
}

export interface BinaryOperator<T=any> extends Operator<T> {
  (a: T, b: T): Operation<T>
}

export const all: NullaryOperator = () => () => '*'
export const partial: UnaryOperator = key => convert => `${convert(key)}*`
export const lessThan: UnaryOperator = key => convert => `<${convert(key)}`
export const greaterThan: UnaryOperator = key => convert => `>${convert(key)}`
export const lessThanOrEqual: UnaryOperator = key => convert => `<=${convert(key)}`
export const greaterThanOrEqual: UnaryOperator = key => convert => `>=${convert(key)}`
export const equals: UnaryOperator = key => convert => convert(key)
export const between: BinaryOperator = (a, b) => convert => `${convert(a)}|${convert(b)}`
