import { fake } from 'sinon'
import { mockDataAPI } from './util'

import { indexBy, buildIndex } from '..'


describe('Query', () => {
  it('should generate simple queries based on given index.', () => {
    const key = buildIndex({ namespace: 'stuff' })
    indexBy(key).query().should.equal('stuff:*')
  })

  it('should call proper functions from data APIs.', async () => {
    const { get }  = mockDataAPI()
    get.resolves({ items: [
      {key: 12, value: {name: 'Hellow'}},
      {key: 13, value: {name: 'World'}},
    ] })

    const model = fake()

    const key = buildIndex({ namespace: 'stuff' })
    await indexBy(key).get(model as any)

    get.should.have.been.calledWith('stuff:*')
    model.should.have.been.calledTwice
    model.firstCall.firstArg.should.eql({ name: 'Hellow' })
    model.secondCall.firstArg.should.eql({ name: 'World' })
  })
})

