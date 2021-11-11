import { buildIndex } from '../..'


describe('buildIndex()', () => {
  it('should build an index using given options.', () => {
    buildIndex().operate(c => c('Hellow World')).should.equal('Hellow World')
  })

  it('should build non-primary indexes if label is set.', () => {
    buildIndex().primary().should.be.true
    buildIndex({ label: 'label1' }).primary().should.be.false
  })

  it('should attach given namespace.', () => {
    buildIndex({ namespace: 'X' }).operate(c => c('Hellow World')).should.equal('X:Hellow World')
  })

  it('should execute given converter.', () => {
    buildIndex({ converter: x => x.replace(/ /g, '_')}).operate(c => c('Hellow World')).should.equal('Hellow_World')
  })
})
