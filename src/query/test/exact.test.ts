import { fake } from 'sinon'
import { expect } from 'chai'
import { mockDataAPI } from '../../test/util'

import { buildIndex, indexBy } from '../..'


describe('exact()', () => {
  it('should build a query pinpointing the exact key given.', () => {
    const index = buildIndex({ namespace: 'stuff' })
    indexBy(index).exact(42).query().should.equal('stuff:42')
  })

  it('should call data APIs properly for primary indexes.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({name: 'Hellow'})

    const model = fake()
    await indexBy(buildIndex()).exact(12).get(model as any)

    get.should.have.been.calledWith('12')
    model.should.have.been.calledOnceWithExactly({name: 'Hellow'})
  })

  it('should return undefined when no results are returned for primary indexes.', async () => {
    const { get }  = mockDataAPI()
    get.resolves(undefined)

    const model = fake()
    const res = await indexBy(buildIndex()).exact(12).get(model as any)

    get.should.have.been.calledWith('12')
    model.should.not.have.been.called
    expect(res).to.be.undefined
  })

  it('should call data APIs properly for secondary indexes.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [{key: 'stuff:Jack', value: {name: 'Hellow'}}] })

    const model = fake()
    const index = buildIndex({ namespace: 'stuff', label: 'label3' })
    await indexBy(index).exact('Jack').get(model as any)

    get.should.have.been.calledOnce
    get.firstCall.firstArg.should.equal('stuff:Jack')
    get.firstCall.lastArg.should.eql({ label: 'label3' })
    model.should.have.been.calledOnceWithExactly({name: 'Hellow'})
  })

  it('should call data APIs properly for secondary indexes with extra options.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [{key: 'stuff:Jack', value: {name: 'Hellow'}}] })

    const model = fake()
    const index = buildIndex({ namespace: 'stuff', label: 'label3', converter: x => x.toLowerCase() })
    await indexBy(index).exact('Jack').limit(10).start('Jill').reverse().get(model as any)

    get.should.have.been.calledOnce
    get.firstCall.firstArg.should.equal('stuff:jack')
    get.firstCall.lastArg.should.eql({
      label: 'label3',
      limit: 10,
      start: 'stuff:jill',
      reverse: true,
    })
    model.should.have.been.calledOnceWithExactly({name: 'Hellow'})
  })

  it('should return an empty array when no results are returned for secondary indexes.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [] })

    const model = fake()
    const index = buildIndex({ namespace: 'stuff', label: 'label3', converter: x => x.toLowerCase() })
    const res = await indexBy(index).exact('Jack').limit(10).start('Jill').reverse().get(model as any)

    get.should.have.been.calledOnce
    get.firstCall.firstArg.should.equal('stuff:jack')
    get.firstCall.lastArg.should.eql({
      label: 'label3',
      limit: 10,
      start: 'stuff:jill',
      reverse: true,
    })
    model.should.not.have.been.called
    expect(res).to.be.empty
  })
})
