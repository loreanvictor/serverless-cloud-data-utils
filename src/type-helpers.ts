// eslint-disable-next-line no-shadow
export enum Labels {
  label1 = 'label1',
  label2 = 'label2',
  label3 = 'label3',
  label4 = 'label4',
  label5 = 'label5',
}


export type Label = keyof typeof Labels


export type KeyValue<T> = {
  key: string
  value: T
}

export interface GetOptions {
  reverse?: boolean
  limit?: number
  start?: string
  label?: Label
}

export type ResponseList<T> = {
  items: KeyValue<T>[],
  lastKey?: string
}


/**
*
* Types for parsing key path strings
*
*/

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

type Join<K, P> =
K extends string | number ?
  P extends string | number ?
    `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never

export type KeyPath<T, D extends number = 10> =
[D] extends [never] ?
  never
  : T extends object ?
    { [K in keyof T]-?:
      K extends string | number ?
        `${K}` | (KeyPath<T[K], Prev[D]> extends infer R ? Join<K, R> : never)
        : never
    }[keyof T]
    : ''
