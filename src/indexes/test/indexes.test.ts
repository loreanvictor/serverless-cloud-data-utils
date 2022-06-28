import { buildIndex } from '../..'


describe('buildIndex()', () => {
  it('should build an index using given options.', () => {
    expect(buildIndex().operate(c => c('Hellow World'))).toEqual('Hellow World')
  })

  it('should build non-primary indexes if label is set.', () => {
    expect(buildIndex().primary()).toBeTruthy
    expect(buildIndex({ label: 'label1' }).primary()).toBeFalsy
  })

  it('should attach given namespace.', () => {
    expect(buildIndex({ namespace: 'X' }).operate(c => c('Hellow World'))).toEqual('X:Hellow World')
  })

  it('should execute given converter.', () => {
    expect(buildIndex({ converter: x => x.replace(/ /g, '_')}).operate(c => c('Hellow World'))).toEqual('Hellow_World')
  })
})
