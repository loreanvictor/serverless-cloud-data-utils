import { timekey } from '..'


describe('timekey()', () => {
  it('should convert timestamps so that they are storable by serverless data.', () => {
    expect(timekey('2021-11-11T16:17:58.946Z')).toEqual('2021-11-11T16-17-58.946Z')
  })
})
