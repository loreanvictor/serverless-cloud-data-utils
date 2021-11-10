export type ModelConstructor<M> = new (fromDB: object) => M


export function hydrate<M>(constructor: ModelConstructor<M>, data: object): M {
  return new constructor(data)
}
