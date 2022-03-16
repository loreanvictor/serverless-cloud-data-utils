import camelcase from 'camelcase-keys'
import snakecase from 'snakecase-keys'
import clone from 'just-clone'
import { data } from '@serverless/cloud'

import { isSecondary } from './indexes'
import { Exact } from './query'
import { Labels, KeyPath } from './type-helpers'

const MAX_SHADOW_KEYS = 5

function prune(model: Model<any>): any {
  const copy: any = clone(model)
  delete copy.__snapshot
  delete copy.__shadowSnapshots

  return copy
}



/**
 *
 * Remove properties for path provided as a string seperated by full stops
 * ie model.clean(['x.y'])
 *
 */

function deletePropertyByPath<T>(target: T, key: KeyPath<T>): any {
  const path = key.split('.')
  const last = path.pop()

  const cursor = path.reduce((acc, step) => acc[step], target as any)
  delete cursor[last!]
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
  __shadowSnapshots: string[]
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
  shadowKeys?(): Exact[][];

  /**
   *
   * Use to disable maximum check on maximum shadow keys
   *
   */
  unsafeShadowKeysUnbounded?(): boolean | null;


  primary(keys?: Exact[]) {
    const pk = (keys || this.keys()).find(e => e.index.primary())
    if (!pk) {
      throw new Error('No primary key specified!')
    }

    return pk.query()
  }

  secondaries(keys?: Exact[]) {
    const labels: { [label in Labels]?: string } = {}
    const secondaryKeys = keys || this.keys()
    for (const key of secondaryKeys) {
      if (isSecondary(key.index)) {
        labels[key.index.options.label] = key.query()
      }
    }


    return labels
  }

  /**
   *
   * Will save the model to the database, as well as any shadows. If the primary key has changed,
   * the previous entry in the database will be deleted first, this also runs for primary shadow keys.
   *
   */
  async save() {
    const keys = this.keys()
    const primary = this.primary(keys)

    if (this.__snapshot && primary !== this.__snapshot) {
      await data.remove(this.__snapshot)
    }

    await data.set(primary, snakecase(prune(this), { deep: true }), this.secondaries())

    if (this.shadowKeys) {
      if (
        this.shadowKeys().length > MAX_SHADOW_KEYS &&
        !this.unsafeShadowKeysUnbounded?.()
      ){
        throw new Error(`Maximum number of ${MAX_SHADOW_KEYS} shadowKeys exceeded: Reduce number of shadowKeys, or add unsafeShadowKeysUnbounded method to model`)
      }

      const keySets = this.shadowKeys()
      const shadowPrimaries = keySets.map((keySet) =>
        this.primary(keySet)
      )

      await Promise.all([
        ...this.__shadowSnapshots.map((shadowSnapshot) => {
          if (!shadowPrimaries.includes(shadowSnapshot)) {
            return data.remove(shadowSnapshot)
          }
        }),
        ...shadowPrimaries.map((shadowPrimary, index) =>
          data.set(
            shadowPrimary,
            snakecase(prune(this), { deep: true }),
            this.secondaries(keySets[index])
          )
        ),
      ])
    }
  }

  /**
   *
   * Will delete the model and any shadows from the database.
   *
   */
  async delete() {
    await data.remove(this.primary())
    if (this.shadowKeys) {
      await Promise.all(
        this.shadowKeys().map((keySet) =>
          data.remove(this.primary(keySet))
        )
      )
    }
  }

  /**
   *
   * Will return a clean JSON serializable version of the model.
   * This will remove internal data and convert the model to snake case.
   *
   * @param exclude Fields or key paths to be excluded.
   *
   */
  clean(exclude: KeyPath<T>[] = []) {
    const cleaned = prune(this)
    exclude.forEach(key => {
      deletePropertyByPath(cleaned, key)
    })

    return snakecase(cleaned)
  }
}
