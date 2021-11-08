import cloud from '@serverless/cloud'
import { stub } from 'sinon'


export function mockDataAPI() {
  const stubs = {
    get: stub(),
    getByLabel: stub(),
    on: stub(),
    set: stub(),
    remove: stub(),
    seed: stub(),
  }

  cloud.data = stubs

  return stubs
}
