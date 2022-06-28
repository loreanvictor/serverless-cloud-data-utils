
import * as mockCloud from '@serverless/cloud'
import { jest } from '@jest/globals'
import { buildIndex, indexBy } from '../..'


jest.mock('@serverless/cloud', () => ({
  __esModule: true,
  data: {
    get: jest.fn(),
  },
}))

const mockedCloud = jest.mocked(mockCloud, true)

afterEach(() => {
  jest.clearAllMocks()
})




describe('exact()', () => {
  it('should build a query pinpointing the exact key given.', () => {
    const index = buildIndex({ namespace: 'stuff' })
    expect(indexBy(index).exact(42).query()).toEqual('stuff:42')
  })

  it('should call data APIs properly for primary indexes.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({name: 'Hellow'}))
    const { get } = mockCloud.data

    const model = jest.fn()
    await indexBy(buildIndex()).exact(12).get(model as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('12', {})

    expect(model).toBeCalledTimes(1)
    expect(model).toHaveBeenCalledWith({name: 'Hellow'})
  })

  it('should return undefined when no results are returned for primary indexes.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve(undefined))
    const { get } = mockCloud.data

    const model = jest.fn()
    const res = await indexBy(buildIndex()).exact(12).get(model as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('12', {})

    expect(model).not.toHaveBeenCalled()
    expect(res).toEqual(undefined)
  })

  it('should call data APIs properly for secondary indexes.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [{key: 'stuff:Jack', value: {name: 'Hellow'}}] }))
    const { get } = mockCloud.data

    const model = jest.fn()
    const index = buildIndex({ namespace: 'stuff', label: 'label3' })
    await indexBy(index).exact('Jack').get(model as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('stuff:Jack', { label: 'label3' })

    expect(model).toBeCalledTimes(1)
    expect(model).toHaveBeenCalledWith({name: 'Hellow'})
  })

  it('should call data APIs properly for secondary indexes with extra options.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [{key: 'stuff:Jack', value: {name: 'Hellow'}}] }))
    const { get } = mockCloud.data

    const model = jest.fn()
    const index = buildIndex({ namespace: 'stuff', label: 'label3', converter: x => x.toLowerCase() })
    await indexBy(index).exact('Jack').limit(10).start('Jill').reverse().get(model as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('stuff:jack', {
      label: 'label3',
      limit: 10,
      start: 'stuff:jill',
      reverse: true,
    })
    expect(model).toBeCalledTimes(1)
    expect(model).toHaveBeenCalledWith({name: 'Hellow'})
  })

  it('should return an empty array when no results are returned for secondary indexes.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [] }))
    const { get } = mockCloud.data

    const model = jest.fn()
    const index = buildIndex({ namespace: 'stuff', label: 'label3', converter: x => x.toLowerCase() })
    const res = await indexBy(index).exact('Jack').limit(10).start('Jill').reverse().get(model as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('stuff:jack', {
      label: 'label3',
      limit: 10,
      start: 'stuff:jill',
      reverse: true,
    })

    expect(model).not.toHaveBeenCalled()
    expect(res).toEqual([])
  })
})
