import camelcase from 'camelcase-keys'
import snakecase from 'snakecase-keys'
import clone from 'just-clone'
import { data } from '@serverless/cloud'

import { isSecondary } from './indexes'
import { Exact } from './query'
import { Labels, KeyPath } from './type-helpers'

export const MAX_SHADOW_KEYS = 5

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
  __snapshot: string | undefined
  __shadowSnapshots: string[]
  /**
   *
   * Hydrates the model instance, populating it with given data. The given data must have enough
   * information to produce a primary key.
   *
   * The object will be converted to camel case befor being used
   * to create the model.
   *
   */
  hydrate(source: any) {
    if (source) {
      Object.assign(this, camelcase(source, { deep: true }))
      this.__snapshot = this.primary()
      this.__shadowSnapshots = this.updateShadowSnapshots()
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
   * Return a list of shadowKey lists, containing exact queries that specify access keys
   * for each set of shadowKeys, each shadowKey list must have a primary, secondary keys must have separate labels.
   * shadowKeys list is limited to MAX_SHADOW_KEYS, UNSAFE_shadowKeysUnbounded allows unlimited shadowKeys
   *
   */
  shadowKeys?(): Exact[][];
  UNSAFE_shadowKeysUnbounded?(): Exact[][];

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
   *  Return shadow keys from either ShadowKeys or UNSAFE_shadowKeysUnbounded method
   *
   */
  resolveShadowKeys() {
    if (this.UNSAFE_shadowKeysUnbounded && this.shadowKeys) {
      throw new Error('Either UNSAFE_shadowKeysUnbounded OR shadowKeys may be used, they cannot be used together')
    } else if(this.UNSAFE_shadowKeysUnbounded){
      return this.UNSAFE_shadowKeysUnbounded()
    } else if (this.shadowKeys) {
      const res = this.shadowKeys()
      if (res.length > MAX_SHADOW_KEYS) {
        throw new Error(`Maximum number of ${MAX_SHADOW_KEYS} shadowKeys exceeded: Reduce number of shadowKeys, or use UNSAFE_shadowKeysUnbounded method to model`)
      }

      return res
    }
  }

  updateShadowSnapshots() {
    const shadowKeys = this.resolveShadowKeys()
    if (shadowKeys) {
      return shadowKeys.map(shadowkeys => this.primary(shadowkeys))
    } else {
      return []
    }
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
      this.__snapshot = primary
    }
    await data.set(primary, snakecase(prune(this), { deep: true }), this.secondaries())

    const shadowKeySets = this.resolveShadowKeys()
    if (shadowKeySets) {
      const shadowPrimaries = shadowKeySets.map((keySet) =>
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
            this.secondaries(shadowKeySets[index])
          )
        ),
      ])

      this.updateShadowSnapshots()
    }
  }

  /**
   *
   * Will delete the model and any shadows from the database.
   *
   */
  async delete() {
    await data.remove(this.primary())
    this.__snapshot = undefined

    const shadowKeySets = this.resolveShadowKeys()
    if (shadowKeySets) {
      await Promise.all(
        shadowKeySets.map((keySet) =>
          data.remove(this.primary(keySet))
        )
      )
      this.__shadowSnapshots = []
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
