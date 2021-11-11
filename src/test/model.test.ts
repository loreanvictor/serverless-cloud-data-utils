import { mockDataAPI } from './util'

import { Model, buildIndex, indexBy } from '..'


const ID = buildIndex()
const X = buildIndex({ namespace: 'M', label: 'label1' })
const Y = buildIndex({ label: 'label2', converter: x => x.toLowerCase() })

class M extends Model<M> {
  id: string
  theX: number
  y: string

  keys() {
    return [
      indexBy(ID).exact(this.id),
      indexBy(X).exact(this.theX),
      indexBy(Y).exact(this.y),
    ]
  }
}


describe('Model', () => {
  it('should create a new record based on its indexes.', async () => {
    const { set } = mockDataAPI()
    set.resolves()

    const m = new M()
    m.id = 'hola'
    m.theX = 2
    m.y = 'YOLO'

    await m.save()
    set.should.have.been.calledOnce
    set.firstCall.firstArg.should.equal('hola')
    set.firstCall.args[1].should.eql({
      id: 'hola',
      the_x: 2,
      y: 'YOLO',
    })
    set.firstCall.lastArg.should.eql({
      label1: 'M:2',
      label2: 'yolo'
    })
  })
})

