import { fake } from 'sinon'
import { mockDataAPI } from '../../test/util'

import { indexBy, buildIndex } from '../..'


describe('all()', () => {
  it('should retreive all matching entities.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [{ key: 1, value: { id: 1 } }, { key: 2, value: { id: 2 }}] })

    const hydrate = fake()
    const model = fake(() => ({ hydrate }))
    await indexBy(buildIndex()).get(model as any)

    get.should.have.been.calledOnceWith('*')
    model.should.have.been.calledTwice
    hydrate.should.have.been.calledTwice
    hydrate.firstCall.firstArg.should.eql({ id: 1 })
    hydrate.secondCall.firstArg.should.eql({ id: 2 })
  })

  it('should retreive all matching keys as well.', async () => {
    const { get } = mockDataAPI()
    get.resolves({ items: [{ key: 1, value: { id: 1 } }, { key: 2, value: { id: 2 }}] })

    const keys = await indexBy(buildIndex()).keys()
    keys.should.eql([1, 2])
  })

  it('should return an exact match for primary keys.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ id: 42 })

    const hydrate = fake()
    const model = fake(() => ({ hydrate }))
    await indexBy(buildIndex({ namespace: 'X' })).equals(42).get(model as any)

    get.should.have.been.calledOnceWith('X:42')
    model.should.have.been.calledOnce
    hydrate.should.have.been.calledOnce
    hydrate.firstCall.firstArg.should.eql({ id: 42 })
  })


  it('should return an exact match for anonymous primary keys.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ id: 42 })

    const hydrate = fake()
    const model = fake(() => ({ hydrate }))
    await indexBy(buildIndex()).equals(42).get(model as any)

    get.should.have.been.calledOnceWith('42')
    model.should.have.been.calledOnce
    hydrate.should.have.been.calledOnce
    hydrate.firstCall.firstArg.should.eql({ id: 42 })
  })

  it('should return a list of matching labels for secondary keys.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [{ key: 1, value: { id: 1 } }, { key: 2, value: { id: 2 }}] })

    const hydrate = fake()
    const model = fake(() => ({ hydrate }))
    await indexBy(buildIndex({ namespace: 'X', label: 'label1' })).equals(42).get(model as any)

    get.should.have.been.calledOnce
    get.firstCall.firstArg.should.equal('X:42')
    get.firstCall.lastArg.should.eql({ label: 'label1' })
    model.should.have.been.calledTwice
    hydrate.should.have.been.calledTwice
    hydrate.firstCall.firstArg.should.eql({ id: 1 })
    hydrate.secondCall.firstArg.should.eql({ id: 2 })
  })

  it('should return a list of matching labels for anonymous secondary keys.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [{ key: 1, value: { id: 1 } }, { key: 2, value: { id: 2 }}] })

    const hydrate = fake()
    const model = fake(() => ({ hydrate }))
    await indexBy(buildIndex({ label: 'label1' })).equals(42).get(model as any)

    get.should.have.been.calledOnce
    get.firstCall.firstArg.should.equal('42')
    get.firstCall.lastArg.should.eql({ label: 'label1' })
    model.should.have.been.calledTwice
    hydrate.should.have.been.calledTwice
    hydrate.firstCall.firstArg.should.eql({ id: 1 })
    hydrate.secondCall.firstArg.should.eql({ id: 2 })
  })

  it('should query all items before given value.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [] })

    await indexBy(buildIndex({ namespace: 'X' })).before(42).get(fake() as any)

    get.should.have.been.calledOnceWith('X:<42')
  })

  it('should query all items before or equal given value.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [] })

    await indexBy(buildIndex({ namespace: 'X' })).leq(42).get(fake() as any)

    get.should.have.been.calledOnceWith('X:<=42')
  })

  it('should query all items after given value.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [] })

    await indexBy(buildIndex({ namespace: 'X', converter: x => `${-x}` })).after(42).get(fake() as any)

    get.should.have.been.calledOnceWith('X:>-42')
  })

  it('should query all items after or equal given value.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [] })

    await indexBy(buildIndex({ label: 'label2', namespace: 'X' })).geq(42).get(fake() as any)

    get.should.have.been.calledOnceWith('X:>=42')
  })

  it('should query all items between given values.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [] })

    await indexBy(buildIndex({ namespace: 'X', converter: x => `${x * 10}` })).between(42, 43).get(fake() as any)

    get.should.have.been.calledOnceWith('X:420|430')
  })

  it('should query all items that partially match given key.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [] })

    await indexBy(buildIndex({ namespace: 'X', converter: x => x.toUpperCase() })).startsWith('yolo').get(fake() as any)

    get.should.have.been.calledOnceWith('X:YOLO*')
  })
})
