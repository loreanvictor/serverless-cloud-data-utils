import camelcase from 'camelcase-keys'
import snakecase from 'snakecase-keys'
import { data } from '@serverless/cloud'

import { isSecondary } from './indexes'
import { Exact } from './query'
import { Labels } from './type-helpers'


function prune(ImmutableModel: ImmutableModel<any>): any {
  const copy: any = { ...ImmutableModel }
  delete copy.__snapshot
  delete copy.__shadowSnapshots

  return copy
}


/**
 *
 * Represents a ImmutableModel in the database. When extending this class,
 * you **MUST** override the `.keys()` method, returning
 * exact queries for all indexes (access paths) of the ImmutableModel.
 *
 */
export abstract class ImmutableModel<T extends ImmutableModel<T>> {
  __snapshot: string
  __shadowSnapshots: string[]
  /**
   *
   * Creates a new ImmutableModel instance. If data is given,
   * it will be used to populate the ImmutableModel.The given data must have enough
   * information to produce a primary key.
   *
   * The object will be converted to camel case befor being used
   * to create the ImmutableModel.
   *
   */
  constructor(obj?: any) {
    if (obj) {
        Object.assign(this, camelcase(obj, { deep: true }))
      this.__snapshot = this.primary()
      this.__shadowSnapshots = this.shadowKeys?.().map(shadowkeys => this.primary(shadowkeys)) ?? []
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

  /**
   *
   * Returns a list of shadowKey lists, containing exact queries that specify access keys
   * for each set of shadowKeys, each shadowKey list must have a primary, secondary keys must have separate labels.
   *
   */
  shadowKeys?(): Exact[][]

  primary(keys?: Exact[]) {
    const pk = (keys || this.keys()).find(e => e.index.primary())
    if (!pk) {
      throw new Error('No primary key specified!')
    }

    return pk.query()
  }

  secondaries(keys: Exact[]) {
    const labels: {[label in Labels]?: string} = {}
    for (const key of keys) {
      if (isSecondary(key.index)) {
        labels[key.index.options.label] = key.query()
      }
    }

    return labels
  }

  /**
   *
   * Will save the ImmutableModel to the database, as well as any shadows. If the primary key has changed,
   * the previous entry in the database will be deleted first, this also runs for primary shadow keys.
   *
   */
  async save() {
    const keys = this.keys()
    const primary = this.primary(keys)

    if (this.__snapshot && primary !== this.__snapshot) {
      await data.remove(this.__snapshot)
    }

    await data.set(primary, snakecase(prune(this), { deep: true }), this.secondaries(keys))

    if (this.shadowKeys){
      const shadowKeys = this.shadowKeys()
      const shadowPrimaries = shadowKeys.map(shadowkeys => this.primary(shadowkeys))
      await Promise.all([
        ...this.__shadowSnapshots.map(async (shadowSnapshot, index) => {
          if (shadowSnapshot && shadowPrimaries[index] !== shadowSnapshot) {
            await data.remove(shadowSnapshot)
          }
        }),
        ...shadowPrimaries.map(async(shadowPrimary, index) => await data.set(shadowPrimary, snakecase(prune(this), { deep: true }), this.secondaries(shadowKeys[index])))
      ])
    }
  }

  /**
   *
   * Will delete the ImmutableModel and any shadows from the database.
   *
   */
  async delete() {
    await data.remove(this.primary())
    if (this.shadowKeys) {
      await Promise.all(
        this.shadowKeys().map(async shadowKeys => await data.remove(this.primary(shadowKeys)))
      )
    }
  }

  /**
   *
   * Will return a clean JSON serializable version of the ImmutableModel.
   * This will remove internal data and convert the ImmutableModel to snake case.
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
