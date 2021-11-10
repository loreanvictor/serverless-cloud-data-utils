import { Converter } from '../operators'
import { Label } from '../type-helpers'


export interface PrimaryIndexOptions<T=any> {
  namespace?: string
  converter?: Converter<T>,
}

export interface SecondaryIndexOptions<T=any> {
  namespace?: string
  label: Label
  converter?: Converter<T>,
}

export type IndexOptions<T=any> = PrimaryIndexOptions<T> | SecondaryIndexOptions<T>

export function isSecondaryIndexOptions(options: IndexOptions): options is SecondaryIndexOptions {
  return (options as any).label !== undefined
}
