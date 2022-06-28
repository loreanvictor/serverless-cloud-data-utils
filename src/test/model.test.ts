import * as mockCloud from '@serverless/cloud'
import { Model, buildIndex, indexBy } from '..'
import { jest } from '@jest/globals'

jest.mock('@serverless/cloud', () => ({
  __esModule: true,
  data: {
    get: jest.fn(),
    getByLabel: jest.fn(),
    on: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    seed: jest.fn(),
  },
}))

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
            r: string;
            b: {
                s: string;
            };
        };
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

  UNSAFE_shadowKeysUnbounded() {
    return [
      ...this.t.map((t) => [
        indexBy(T(t)).exact(this.id),
        indexBy(TX(t, this.x)).exact(this.id),
      ]),
    ]
  }
  keys() {
    return [indexBy(ID).exact(this.id)]
  }
}

class R extends Model<R> {
  id: string
  t: string[]
  x: string

  UNSAFE_shadowKeysUnbounded() {
    return [
      ...this.t.map((t) => [
        indexBy(T(t)).exact(this.id),
        indexBy(TX(t, this.x)).exact(this.id),
      ]),
    ]
  }
  shadowKeys() {
    return [
      ...this.t.map((t) => [
        indexBy(T(t)).exact(this.id),
        indexBy(TX(t, this.x)).exact(this.id),
      ]),
    ]
  }
  keys() {
    return [indexBy(ID).exact(this.id)]
  }
}

beforeEach(() => jest.clearAllMocks())

describe('Model', () => {
  it('should create a new record based on its indexes.', async () => {
    const { set } = mockCloud.data
    const m = new M()
    m.id = 'hola'
    m.theX = 2
    m.y = 'YOLO'
    await m.save()
    expect(set).toBeCalledTimes(1)
    expect(set).toHaveBeenCalledWith(
      'hola',
      {
        id: 'hola',
        the_x: 2,
        y: 'YOLO',
      },
      {
        label1: 'M:2',
        label2: 'yolo',
      }
    )
  })

  it('should create a new record where no secondary keys supplied.', async () => {
    const { set } = mockCloud.data
    const q = new Q()
    q.id = 'hola'

    await q.save()
    expect(set).toBeCalledTimes(1)
    expect(set).toHaveBeenCalledWith(
      'hola',
      {
        id: 'hola',
      },
      {}
    )
  })

  it('should load from db records.', async () => {
    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS',
    })

    expect(m.id).toEqual('hola')
    expect(m.theX).toEqual(42)
    expect(m.y).toEqual('WHATEVS')
  })

  it('should be able to delete itself.', async () => {
    const { remove } = mockCloud.data
    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS',
    })

    await m.delete()
    expect(remove).toBeCalledTimes(1)
    expect(remove).toHaveBeenCalledWith('hola')
  })

  it('should be able to update itself.', async () => {
    const { set, remove } = mockCloud.data

    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS',
    })

    m.theX = 43
    await m.save()

    expect(remove).not.toBeCalled()
    expect(set).toBeCalledTimes(1)

    expect(set).toHaveBeenCalledWith(
      'hola',
      {
        id: 'hola',
        the_x: 43,
        y: 'WHATEVS',
      },
      {
        label1: 'M:43',
        label2: 'whatevs',
      }
    )
  })

  it('should remove previous entry if its primary key has changed.', async () => {
    const { set, remove } = mockCloud.data

    const m = new M({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS',
    })

    m.id = 'yolo'
    await m.save()

    expect(remove).toBeCalledTimes(1)
    expect(set).toBeCalledTimes(1)
    expect(set).toHaveBeenCalledWith(
      'yolo',
      {
        id: 'yolo',
        the_x: 42,
        y: 'WHATEVS',
      },
      {
        label1: 'M:42',
        label2: 'whatevs',
      }
    )
  })

  it('should throw an error during saving if no primary key specified.', async () => {
    const n = new N()
    n.x = 42
    n.y = 'WHATEVS'

    await expect(n.save()).rejects.toThrowError()
  })

  it('should throw an error during creation if no primary key specified.', () => {
    expect(
      () =>
        new N({
          x: 42,
          y: 'WHATEVS',
        })
    ).toThrowError()
  })

  it('should create model with shadow keys.', async () => {
    const { set } = mockCloud.data
    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })
    await o.save()
    expect(set).toBeCalledTimes(4)
    expect(set).toHaveBeenNthCalledWith(
      1,
      'Yo',
      {
        id: 'Yo',
        x: 'Origato',
        t: ['boba', 'joba'],
        c: 'WHATEVS',
      },
      {
        label1: 'M:Origato',
      }
    )
    expect(set).toHaveBeenNthCalledWith(
      2,
      'O:T_boba:Yo',
      {
        id: 'Yo',
        x: 'Origato',
        t: ['boba', 'joba'],
        c: 'WHATEVS',
      },
      {
        label1: 'O:T_boba:X_Origato:Yo',
      }
    )
    expect(set).toHaveBeenNthCalledWith(
      3,
      'O:T_joba:Yo',
      {
        id: 'Yo',
        x: 'Origato',
        t: ['boba', 'joba'],
        c: 'WHATEVS',
      },
      {
        label1: 'O:T_joba:X_Origato:Yo',
      }
    )
    expect(set).toHaveBeenLastCalledWith(
      'O:C_WHATEVS:Yo',
      {
        id: 'Yo',
        x: 'Origato',
        t: ['boba', 'joba'],
        c: 'WHATEVS',
      },
      {
        label1: 'O:C_WHATEVS:X_Origato:boba,joba',
      }
    )
  })

  it('should remove previous entry and shadowKey entries if primary key has changed.', async () => {
    const { set, remove } = mockCloud.data

    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })

    o.id = 'Bye'

    await o.save()

    expect(remove).toBeCalledTimes(4)
    expect(remove).toHaveBeenNthCalledWith(1, 'Yo')
    expect(remove).toHaveBeenNthCalledWith(2, 'O:T_boba:Yo')
    expect(remove).toHaveBeenNthCalledWith(3, 'O:T_joba:Yo')
    expect(remove).toHaveBeenLastCalledWith('O:C_WHATEVS:Yo')

    expect(set).toHaveBeenNthCalledWith(
      1,
      'Bye',
      {
        id: 'Bye',
        x: 'Origato',
        t: ['boba', 'joba'],
        c: 'WHATEVS',
      },
      {
        label1: 'M:Origato',
      }
    )
    expect(set).toHaveBeenNthCalledWith(
      2,
      'O:T_boba:Bye',
      {
        id: 'Bye',
        x: 'Origato',
        t: ['boba', 'joba'],
        c: 'WHATEVS',
      },
      {
        label1: 'O:T_boba:X_Origato:Bye',
      }
    )
    expect(set).toHaveBeenNthCalledWith(
      3,
      'O:T_joba:Bye',
      {
        id: 'Bye',
        x: 'Origato',
        t: ['boba', 'joba'],
        c: 'WHATEVS',
      },
      {
        label1: 'O:T_joba:X_Origato:Bye',
      }
    )
    expect(set).toHaveBeenLastCalledWith(
      'O:C_WHATEVS:Bye',
      {
        id: 'Bye',
        x: 'Origato',
        t: ['boba', 'joba'],
        c: 'WHATEVS',
      },
      {
        label1: 'O:C_WHATEVS:X_Origato:boba,joba',
      }
    )
  })

  it('should remove shadow entry where shadowKeys change', async () => {
    const { set, remove } = mockCloud.data

    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })

    o.t = ['boba']

    await o.save()

    expect(remove).toBeCalledTimes(1)
    expect(remove).toHaveBeenCalledWith('O:T_joba:Yo')

    expect(set).toHaveBeenNthCalledWith(
      1,
      'Yo',
      {
        id: 'Yo',
        x: 'Origato',
        t: ['boba'],
        c: 'WHATEVS',
      },
      {
        label1: 'M:Origato',
      }
    )
    expect(set).toHaveBeenNthCalledWith(
      2,
      'O:T_boba:Yo',
      {
        id: 'Yo',
        x: 'Origato',
        t: ['boba'],
        c: 'WHATEVS',
      },
      {
        label1: 'O:T_boba:X_Origato:Yo',
      }
    )
    expect(set).toHaveBeenLastCalledWith(
      'O:C_WHATEVS:Yo',
      {
        id: 'Yo',
        x: 'Origato',
        t: ['boba'],
        c: 'WHATEVS',
      },
      {
        label1: 'O:C_WHATEVS:X_Origato:boba',
      }
    )
  })

  it('should throw an error if too many shadow keys are provided.', async () => {
    expect(
      () =>
        new O({
          id: 'Yo',
          x: 'Origato',
          t: ['boba', 'joba', 'toga', 'hoga', 'roma'],
          c: 'WHATEVS',
        })
    ).toThrowError()
  })

  it('should allow more than the maximum shadow keys with UNSAFE_shadowKeysUnbounded.', async () => {
    const { set } = mockCloud.data
    const p = new P({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba', 'toga', 'hoga', 'roma', 'giro'],
      c: 'WHATEVS',
    })

    await p.save()
    expect(set).toHaveBeenCalledTimes(7)
  })

  it('should throw an error if both UNSAFE_shadowKeysUnbounded and shadowKeys methods are used.', async () => {
    expect(
      () =>
        new R({
          id: 'Yo',
          x: 'Origato',
          t: ['boba', 'joba'],
          c: 'WHATEVS',
        })
    ).toThrowError()
  })

  it('should delete itself and shadow keys.', async () => {
    const { remove } = mockCloud.data

    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })

    await o.delete()
    expect(remove).toBeCalledTimes(4)
    expect(remove).toHaveBeenNthCalledWith(1, 'Yo')
    expect(remove).toHaveBeenNthCalledWith(2, 'O:T_boba:Yo')
    expect(remove).toHaveBeenNthCalledWith(3, 'O:T_joba:Yo')
    expect(remove).toHaveBeenLastCalledWith('O:C_WHATEVS:Yo')
  })

  it('should be able to update itself and shadow entries', async () => {
    const { set, remove } = mockCloud.data

    const o = new O({
      id: 'Yo',
      x: 'Origato',
      t: ['boba', 'joba'],
      c: 'WHATEVS',
    })

    o.c = 'Bro'
    await o.save()

    expect(remove).toBeCalledTimes(1)
    expect(set).toBeCalledTimes(4)
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
          s: 'siracha',
        },
      },
    }

    expect(m.clean()).toEqual({
      id: 'hola',
      the_x: 42,
      y: 'WHATEVS',
      z: {
        o: {
          r: 'amigo',
          b: {
            s: 'siracha',
          },
        },
      },
    })

    expect(m.clean(['y'])).toEqual({
      the_x: 42,
      id: 'hola',
      z: {
        o: {
          r: 'amigo',
          b: {
            s: 'siracha',
          },
        },
      },
    })

    expect(m.clean(['z.o.b.s'])).toEqual({
      the_x: 42,
      id: 'hola',
      y: 'WHATEVS',
      z: {
        o: {
          r: 'amigo',
          b: {},
        },
      },
    })

    expect(m.clean(['y', 'z.o.r'])).toEqual({
      the_x: 42,
      id: 'hola',
      z: {
        o: {
          b: {
            s: 'siracha',
          },
        },
      },
    })
  })
})
