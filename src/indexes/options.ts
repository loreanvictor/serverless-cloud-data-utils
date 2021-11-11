import { Converter } from '../operators'
import { Label } from '../type-helpers'


export interface NamespacedPrimaryIndexOptions<T=any> {
  namespace: string;
  converter?: Converter<T>,
}

export interface AnonymousPrimaryIndexOptions<T=any> {
  converter?: Converter<T>,
}

export interface AnonymousSecondaryIndexOptions<T=any> {
  label: Label
  converter?: Converter<T>,
}

export interface NamespacedSecondaryIndexOptions<T=any> {
  namespace: string
  label: Label
  converter?: Converter<T>,
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
