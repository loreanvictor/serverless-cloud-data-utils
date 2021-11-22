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


/**
 *
 * Represents a model in the database. When extending this class,
 * you **MUST** override the `.keys()` method, returning
 * exact queries for all indexes (access paths) of the model.
 *
 */
export abstract class Model<T extends Model<T>> {
  __snapshot: string

  /**
   *
   * Creates a new model instance. If data is given,
   * it will be used to populate the model.The given data must have enough
   * information to produce a primary key.
   *
   * The object will be converted to camel case befor being used
   * to create the model.
   *
   */
  constructor(obj?: any) {
    if (obj) {
      Object.assign(this, camelcase(obj, { deep: true }))
      this.__snapshot = this.primary()
    }
  }

  /**
   *
   * Returns a list of exact queries that specify access keys (indexes)
   * of this object. Exactly one of the returned keys must be a primary key,
   * and all secondary keys must have separate labels.
   *
   */
  abstract keys(): Exact[]

  primary(keys?: Exact[]) {
    const pk = (keys || this.keys()).find(e => e.index.primary())
    if (!pk) {
      throw new Error('No primary key specified!')
    }

    return pk.query()
  }

  /**
   *
   * Will save the model to the database. If the primary key has changed,
   * the previous entry in the database will be deleted first.
   *
   */
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

  /**
   *
   * Will delete the model from the database.
   *
   */
  async delete() {
    await data.remove(this.primary())
  }

  /**
   *
   * Will return a clean JSON serializable version of the model.
   * This will remove internal data and convert the model to snake case.
   *
   * @param exclude Fields to be excluded.
   *
   */
  clean<K extends keyof T>(exclude: K[] = []) {
    const cleaned = prune(this)
    exclude.forEach(key => delete cleaned[key])

    return snakecase(cleaned)
  }
}
