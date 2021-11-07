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
