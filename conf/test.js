require('ts-node/register')
const chai = require('chai')
const sinonChai = require('sinon-chai')

chai.should()
chai.use(sinonChai)
