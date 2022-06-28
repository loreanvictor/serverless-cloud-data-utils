

import * as mockCloud from '@serverless/cloud'
import { indexBy, buildIndex } from '../..'
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
const mockedCloud = jest.mocked(mockCloud, true)

afterEach(() => {
  jest.clearAllMocks()
})

describe('all()', () => {

  it('should retrieve all matching entities.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [{ key: 1, value: { id: 1 } }, { key: 2, value: { id: 2 }}] }))
    const { get } = mockCloud.data

    const model = jest.fn()
    await indexBy(buildIndex()).get(model as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('*', {})

    expect(model).toBeCalledTimes(2)
    expect(model).toHaveBeenNthCalledWith(1, { id: 1 })
    expect(model).toHaveBeenNthCalledWith(2, { id: 2 })
  })

  it('should retreive all matching keys as well.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [{ key: 1, value: { id: 1 } }, { key: 2, value: { id: 2 }}] }))

    const keys = await indexBy(buildIndex()).keys()
    expect(keys).toEqual([1, 2])
  })

  it('should return an exact match for primary keys.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ id: 42 }))
    const { get } = mockCloud.data

    const model = jest.fn()
    await indexBy(buildIndex({ namespace: 'X' })).equals(42).get(model as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('X:42', {})

    expect(model).toBeCalledTimes(1)
    expect(model).toHaveBeenCalledWith({ id: 42 })

  })

  it('should return an exact match for anonymous primary keys.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ id: 42 }))
    const { get } = mockCloud.data

    const model = jest.fn()
    await indexBy(buildIndex()).equals(42).get(model as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('42', {})

    expect(model).toBeCalledTimes(1)
    expect(model).toHaveBeenCalledWith({ id: 42 })
  })

  it('should return a list of matching labels for secondary keys.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [{ key: 1, value: { id: 1 } }, { key: 2, value: { id: 2 }}] }))
    const { get } = mockCloud.data

    const model = jest.fn()
    await indexBy(buildIndex({ namespace: 'X', label: 'label1' })).equals(42).get(model as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('X:42', { label: 'label1' })

    expect(model).toBeCalledTimes(2)
    expect(model).toHaveBeenNthCalledWith(1, { id: 1 })
    expect(model).toHaveBeenNthCalledWith(2, { id: 2 })
  })

  it('should return a list of matching labels for anonymous secondary keys.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [{ key: 1, value: { id: 1 } }, { key: 2, value: { id: 2 }}] }))
    const { get } = mockCloud.data

    const model = jest.fn()
    await indexBy(buildIndex({ label: 'label1' })).equals(42).get(model as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('42', { label: 'label1' })

    expect(model).toBeCalledTimes(2)
    expect(model).toHaveBeenNthCalledWith(1, { id: 1 })
    expect(model).toHaveBeenNthCalledWith(2, { id: 2 })
  })

  it('should query all items before given value.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [] }))
    const { get } = mockCloud.data

    await indexBy(buildIndex({ namespace: 'X' })).before(42).get(jest.fn() as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('X:<42', { })
  })

  it('should query all items before or equal given value.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [] }))
    const { get } = mockCloud.data

    await indexBy(buildIndex({ namespace: 'X' })).leq(42).get(jest.fn() as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('X:<=42', {})
  })

  it('should query all items after given value.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [] }))
    const { get } = mockCloud.data

    await indexBy(buildIndex({ namespace: 'X', converter: x => `${-x}` })).after(42).get(jest.fn() as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('X:>-42', {})
  })

  it('should query all items after or equal given value.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [] }))
    const { get } = mockCloud.data

    await indexBy(buildIndex({ label: 'label2', namespace: 'X' })).geq(42).get(jest.fn() as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('X:>=42', {label: 'label2'})
  })

  it('should query all items between given values.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [] }))
    const { get } = mockCloud.data

    await indexBy(buildIndex({ namespace: 'X', converter: x => `${x * 10}` })).between(42, 43).get(jest.fn() as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('X:420|430', {})
  })

  it('should query all items that partially match given key.', async () => {
    mockedCloud.data.get.mockReturnValue(Promise.resolve({ items: [] }))
    const { get } = mockCloud.data

    await indexBy(buildIndex({ namespace: 'X', converter: x => x.toUpperCase() })).startsWith('yolo').get(jest.fn() as any)

    expect(get).toBeCalledTimes(1)
    expect(get).toHaveBeenCalledWith('X:YOLO*', {})
  })
})
