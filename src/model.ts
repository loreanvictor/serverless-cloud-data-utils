import camelcase from 'camelcase-keys'
import snakecase from 'snakecase-keys'
import { data } from '@serverless/cloud'

import { isSecondary } from './indexes'
import { Exact } from './query'
import { Labels } from './type-helpers'


function prune(model: Model<any>): any {
  const copy: any = { ...model }
  delete copy.__snapshot

  return copy
}


export abstract class Model<T extends Model<T>> {
  __snapshot: string

  constructor(obj?: any) {
    if (obj) {
      Object.assign(this, camelcase(obj, { deep: true }))
      this.__snapshot = this.primary()
    }
  }

  abstract keys(): Exact[]

  primary(keys?: Exact[]) {
    const pk = (keys || this.keys()).find(e => e.index.primary())
    if (!pk) {
      throw new Error('No primary key specified!')
    }

    return pk.query()
  }

  async save() {
    const keys = this.keys()
    const primary = this.primary(keys)

    if (this.__snapshot && primary !== this.__snapshot) {
      await data.remove(this.__snapshot)
    }

    const labels: {[label in Labels]?: string} = {}
    for (const key of keys) {
      if (isSecondary(key.index)) {
        labels[key.index.options.label] = key.query()
      }
    }

    await data.set(primary, snakecase(prune(this), { deep: true }), labels)
  }

  async remove() {
    await data.remove(this.primary())
  }
}
