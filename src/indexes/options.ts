import { Converter } from '../operators'
import { Label } from '../type-helpers'


export interface NamespacedPrimaryIndexOptions<T=any> {
  /**
   *
   * The namespace for the index. This namespace is necessary
   * if you want to be able to conduct operations (e.g. less than, between, partial, etc).
   *
   */
  namespace: string

  /**
   *
   * The converter to use for the index. Will be used to convert all values to
   * query strings (key expressions).
   *
   */
  converter?: Converter<T>
}

export interface AnonymousPrimaryIndexOptions<T=any> {
  /**
   *
   * The converter to use for the index. Will be used to convert all values to
   * query strings (key expressions).
   *
   */
  converter?: Converter<T>
}

export interface AnonymousSecondaryIndexOptions<T=any> {
  /**
   *
   * The label for this index. Can be one of `label1`, `label2`, ..., `label5`.
   *
   * @note that an index with a label will be a secondary index, and each model
   * needs exactly one primary index.
   *
   * @note that the label must be unique for the model, i.e. each model can have at most one
   * secondary index with a given label.
   *
   */
  label: Label

  /**
   *
   * The converter to use for the index. Will be used to convert all values to
   * query strings (key expressions).
   *
   */
  converter?: Converter<T>
}

export interface NamespacedSecondaryIndexOptions<T=any> {
  /**
   *
   * The namespace for the index. This namespace is necessary
   * if you want to be able to conduct operations (e.g. less than, between, partial, etc).
   *
   */
  namespace: string

  /**
   *
   * The label for this index. Can be one of `label1`, `label2`, ..., `label5`.
   *
   * @note that an index with a label will be a secondary index, and each model
   * needs exactly one primary index.
   *
   * @note that the label must be unique for the model, i.e. each model can have at most one
   * secondary index with a given label.
   *
   */
  label: Label

  /**
   *
   * The converter to use for the index. Will be used to convert all values to
   * query strings (key expressions).
   *
   */
  converter?: Converter<T>
}

export type PrimaryIndexOptions<T=any> = NamespacedPrimaryIndexOptions<T> | AnonymousPrimaryIndexOptions<T>
export type SecondaryIndexOptions<T=any> = NamespacedSecondaryIndexOptions<T> | AnonymousSecondaryIndexOptions<T>
export type IndexOptions<T=any> = PrimaryIndexOptions<T> | SecondaryIndexOptions<T>

export function isSecondaryIndexOptions(options: IndexOptions): options is SecondaryIndexOptions {
  return (options as any).label !== undefined
}

export function isNamespacedIndexOptions(options: IndexOptions): options is NamespacedPrimaryIndexOptions {
  return (options as any).namespace !== undefined
}
