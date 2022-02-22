import { expect } from 'chai'
import { mockDataAPI } from './util'

import { Model, buildIndex, indexBy } from '..'


const ID = buildIndex()
const X = buildIndex({ namespace: 'M', label: 'label1' })
const Y = buildIndex({ label: 'label2', converter: x => x.toLowerCase() })

class M extends Model<M> {
  id: string
  theX: number
  y: string
  z: {
    o: {
      r: string,
      b: {
        s: string
      }
    }
  }

  keys() {
    return [
      indexBy(ID).exact(this.id),
      indexBy(X).exact(this.theX),
      indexBy(Y).exact(this.y),
    ]
  }
}


class N extends Model<N> {
  x: number
  y: string

  keys() {
    return [
      indexBy(X).exact(this.x),
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

  it('should load from db records.', async () => {
    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS'
    })

    m.id.should.equal('hola')
    m.theX.should.equal(42)
    m.y.should.equal('WHATEVS')
  })

  it('should be able to delete itself.', async () => {
    const { remove } = mockDataAPI()

    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS'
    })

    await m.delete()
    remove.should.have.been.calledOnceWith('hola')
  })

  it('should be able to update itself.', async () => {
    const { set, remove } = mockDataAPI()

    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS'
    })

    m.theX = 43
    await m.save()

    remove.should.not.have.been.called
    set.should.have.been.calledOnce
    set.firstCall.firstArg.should.equal('hola')
    set.firstCall.args[1].should.eql({
      id: 'hola',
      the_x: 43,
      y: 'WHATEVS'
    })
    set.firstCall.lastArg.should.eql({
      label1: 'M:43',
      label2: 'whatevs'
    })
  })

  it('should remove previous entry if its primary key has changed.', async () => {
    const { set, remove } = mockDataAPI()

    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS'
    })

    m.id = 'yolo'
    await m.save()

    remove.should.have.been.calledOnceWith('hola')
    set.should.have.been.calledOnce
    set.firstCall.firstArg.should.equal('yolo')
    set.firstCall.args[1].should.eql({
      id: 'yolo',
      the_x: 42,
      y: 'WHATEVS'
    })
    set.firstCall.lastArg.should.eql({
      label1: 'M:42',
      label2: 'whatevs'
    })
  })

  it('should throw an error during saving if no primary key specified.', async () => {
    const n = new N()
    n.x = 42
    n.y = 'WHATEVS'

    await expect(n.save()).to.eventually.be.rejected
  })

  it('should throw an error during creation if no primary key specified.', () => {
    expect(() => new N({
      x: 42,
      y: 'WHATEVS'
    })).to.throw()
  })

  it('should provide a utility for cleaning up the model.', () => {
    const m = new M()
    m.theX = 42
    m.y = 'WHATEVS'
    m.id = 'hola'
    m.z = {
      o: {
        r: 'amigo',
        b: {
          s: 'siracha'
        }
      }
    }

    m.clean().should.eql({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS',
      z: {
        o: {
          r: 'amigo',
          b: {
            s: 'siracha'
          }
        }
      }
    })

    m.clean(['y']).should.eql({
      the_x: 42,
      id: 'hola',
      z: {
        o: {
          r: 'amigo',
          b: {
            s: 'siracha'
          }
        }
      }
    })

    m.clean(['z.o.b.s']).should.eql({
      the_x: 42,
      id: 'hola',
      y: 'WHATEVS',
      z: {
        o: {
          r: 'amigo',
          b:{},
        }
      }
    })

    m.clean(['y', 'z.o.r']).should.eql({
      the_x: 42,
      id: 'hola',
      z: {
        o: {
          b: {
            s: 'siracha'
          }
        }
      }
    })
  })
})

