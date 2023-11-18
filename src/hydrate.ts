export interface Hydratable {
  hydrate(data: any): void
}
export type ModelConstructor<M extends Hydratable> = new () => M


export function hydrate<M extends Hydratable>(constructor: ModelConstructor<M>, data: object): M {
  const model = new constructor()
  model.hydrate(data)

  return model
}
