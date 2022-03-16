import { expect } from 'chai'
import { mockDataAPI } from './util'

import { Model, buildIndex, indexBy } from '..'

const ID = buildIndex()
const X = buildIndex({ namespace: 'M', label: 'label1' })
const Y = buildIndex({ label: 'label2', converter: (x) => x.toLowerCase() })

const T = (t: string) => buildIndex({ namespace: `O:T_${t}` })
const TX = (t: string, x: string) =>
  buildIndex({ namespace: `O:T_${t}:X_${x}`, label: 'label1' })

const C = (c: string) => buildIndex({ namespace: `O:C_${c}` })
const CX = (c: string, x: string) =>
  buildIndex({
    namespace: `O:C_${c}:X_${x}`,
    label: 'label1',
    converter: (t) => t.join(','),
  })

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
    return [indexBy(X).exact(this.x), indexBy(Y).exact(this.y)]
  }
}

class O extends Model<O> {
  id: string
  x: string
  t: string[]
  c: string
  p: {
        o: {
            n: {
                g: string;
            };
        };
    }

  keys() {
    return [indexBy(ID).exact(this.id), indexBy(X).exact(this.x)]
  }
  shadowKeys() {
    return [
      ...this.t.map((t) => [
        indexBy(T(t)).exact(this.id),
        indexBy(TX(t, this.x)).exact(this.id),
      ]),
      [
        indexBy(C(this.c)).exact(this.id),
        indexBy(CX(this.c, this.x)).exact(this.t),
      ],
    ]
  }
}

class Q extends Model<Q> {
  id: string
  keys() {
    return [indexBy(ID).exact(this.id)]
  }
}

class P extends Model<P> {
  id: string
  t: string[]
  x: string

  unsafeShadowKeysUnbounded() {
    return true
  }
  keys() {
    return [indexBy(ID).exact(this.id)]
  }
  shadowKeys() {
    return [
      ...this.t.map((t) => [
        indexBy(T(t)).exact(this.id),
        indexBy(TX(t, this.x)).exact(this.id),
      ]),
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
      label2: 'yolo',
    })
  })

  it('should create a new record where no secondary keys supplied.', async () => {
    const { set } = mockDataAPI()
    set.resolves()

    const q = new Q()
    q.id = 'hola'

    await q.save()
    set.should.have.been.calledOnce
    set.firstCall.firstArg.should.equal('hola')
    set.firstCall.args[1].should.eql({
      id: 'hola',
    })
  })

  it('should load from db records.', async () => {
    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS',
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
      y: 'WHATEVS',
    })

    await m.delete()
    remove.should.have.been.calledOnceWith('hola')
  })

  it('should be able to update itself.', async () => {
    const { set, remove } = mockDataAPI()

    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS',
    })

    m.theX = 43
    await m.save()

    remove.should.not.have.been.called
    set.should.have.been.calledOnce
    set.firstCall.firstArg.should.equal('hola')
    set.firstCall.args[1].should.eql({
      id: 'hola',
      the_x: 43,
      y: 'WHATEVS',
    })
    set.firstCall.lastArg.should.eql({
      label1: 'M:43',
      label2: 'whatevs',
    })
  })

  it('should remove previous entry if its primary key has changed.', async () => {
    const { set, remove } = mockDataAPI()

    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS',
    })

    m.id = 'yolo'
    await m.save()

    remove.should.have.been.calledOnceWith('hola')
    set.should.have.been.calledOnce
    set.firstCall.firstArg.should.equal('yolo')
    set.firstCall.args[1].should.eql({
      id: 'yolo',
      the_x: 42,
      y: 'WHATEVS',
    })
    set.firstCall.lastArg.should.eql({
      label1: 'M:42',
      label2: 'whatevs',
    })
  })

  it('should throw an error during saving if no primary key specified.', async () => {
    const n = new N()
    n.x = 42
    n.y = 'WHATEVS'

    await expect(n.save()).to.eventually.be.rejected
  })

  it('should throw an error during creation if no primary key specified.', () => {
    expect(
      () =>
        new N({
          x: 42,
          y: 'WHATEVS',
        })
    ).to.throw()
  })

  it('should create model with shadow keys.', async () => {
    const { set } = mockDataAPI()
    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })
    await o.save()
    set.should.have.callCount(4)
    set.firstCall.firstArg.should.equal('Yo')
    set.firstCall.args[1].should.eql({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })
    set.firstCall.lastArg.should.eql({
      label1: 'M:Origato',
    })
    set.secondCall.firstArg.should.equal('O:T_boba:Yo')
    set.secondCall.args[1].should.eql({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })
    set.secondCall.lastArg.should.eql({
      label1: 'O:T_boba:X_Origato:Yo',
    })
    set.thirdCall.firstArg.should.equal('O:T_joba:Yo')
    set.thirdCall.args[1].should.eql({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })
    set.thirdCall.lastArg.should.eql({
      label1: 'O:T_joba:X_Origato:Yo',
    })
    set.lastCall.firstArg.should.equal('O:C_WHATEVS:Yo')
    set.lastCall.args[1].should.eql({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })
    set.lastCall.lastArg.should.eql({
      label1: 'O:C_WHATEVS:X_Origato:boba,joba',
    })
  })

  it('should remove previous entry and shadowKey entries if primary key has changed.', async () => {
    const { set, remove } = mockDataAPI()

    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })

    o.id = 'Bye'

    await o.save()

    remove.should.have.callCount(4)
    remove.firstCall.firstArg.should.equal('Yo')
    remove.secondCall.firstArg.should.equal('O:T_boba:Yo')
    remove.thirdCall.firstArg.should.equal('O:T_joba:Yo')
    remove.lastCall.firstArg.should.equal('O:C_WHATEVS:Yo')
    set.firstCall.firstArg.should.equal('Bye')
    set.firstCall.args[1].should.eql({
      id: 'Bye',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })
    set.firstCall.lastArg.should.eql({
      label1: 'M:Origato',
    })
    set.secondCall.firstArg.should.equal('O:T_boba:Bye')
    set.secondCall.args[1].should.eql({
      id: 'Bye',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })
    set.secondCall.lastArg.should.eql({
      label1: 'O:T_boba:X_Origato:Bye',
    })
    set.thirdCall.firstArg.should.equal('O:T_joba:Bye')
    set.thirdCall.args[1].should.eql({
      id: 'Bye',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })
    set.thirdCall.lastArg.should.eql({
      label1: 'O:T_joba:X_Origato:Bye',
    })
    set.lastCall.firstArg.should.equal('O:C_WHATEVS:Bye')
    set.lastCall.args[1].should.eql({
      id: 'Bye',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })
    set.lastCall.lastArg.should.eql({
      label1: 'O:C_WHATEVS:X_Origato:boba,joba',
    })
  })

  it('should remove shadow entry where shadowKeys change', async () => {
    const { set, remove } = mockDataAPI()

    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })

    o.t = ['boba']

    await o.save()

    remove.should.have.callCount(1)
    remove.firstCall.firstArg.should.equal('O:T_joba:Yo')
    set.firstCall.firstArg.should.equal('Yo')
    set.firstCall.args[1].should.eql({
      id: 'Yo',
      x: 'Origato',
      t: ['boba'],
      c: 'WHATEVS',
    })
    set.firstCall.lastArg.should.eql({
      label1: 'M:Origato',
    })
    set.secondCall.firstArg.should.equal('O:T_boba:Yo')
    set.secondCall.args[1].should.eql({
      id: 'Yo',
      x: 'Origato',
      t: ['boba'],
      c: 'WHATEVS',
    })
    set.secondCall.lastArg.should.eql({
      label1: 'O:T_boba:X_Origato:Yo',
    })
    set.lastCall.firstArg.should.equal('O:C_WHATEVS:Yo')
    set.lastCall.args[1].should.eql({
      id: 'Yo',
      x: 'Origato',
      t: ['boba'],
      c: 'WHATEVS',
    })
    set.lastCall.lastArg.should.eql({
      label1: 'O:C_WHATEVS:X_Origato:boba',
    })
  })

  it('should throw an error if too many shadow keys are provided.', async () => {
    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba', 'toga', 'hoga', 'roma'],
      c: 'WHATEVS',
    })

    await expect(o.save()).to.eventually.be.rejected
  })

  it('should allow more than the maximum shadow keys with unsafeShadowKeysUnbounded.', async () => {
    const { set } = mockDataAPI()
    const p = new P({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba', 'toga', 'hoga', 'roma', 'giro'],
      c: 'WHATEVS',
    })

    await p.save()
    set.firstCall.args[1].should.eql({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba', 'toga', 'hoga', 'roma', 'giro'],
      c: 'WHATEVS',
    })
  })

  it('should delete itself and shadow keys.', async () => {
    const { remove } = mockDataAPI()

    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })

    await o.delete()
    remove.should.have.callCount(4)
    remove.firstCall.firstArg.should.equal('Yo')
    remove.secondCall.firstArg.should.equal('O:T_boba:Yo')
    remove.thirdCall.firstArg.should.equal('O:T_joba:Yo')
    remove.lastCall.firstArg.should.equal('O:C_WHATEVS:Yo')
  })

  it('should be able to update itself and shadow entries', async () => {
    const { set, remove } = mockDataAPI()

    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })

    o.c = 'Bro'
    await o.save()

    remove.should.have.been.calledOnce
    set.should.have.callCount(4)
    set.firstCall.firstArg.should.equal('Yo')
    set.lastCall.firstArg.should.equal('O:C_Bro:Yo')
    set.lastCall.args[1].should.eql({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'Bro',
    })
    set.lastCall.lastArg.should.eql({
      label1: 'O:C_Bro:X_Origato:boba,joba',
    })

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
