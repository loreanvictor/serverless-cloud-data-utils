export type Label = 'label1' | 'label2' | 'label3' | 'label4' | 'label5'


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
