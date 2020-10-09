import { expect } from 'chai'
import { ControllerMetadata } from './controller-metadata'
import { RequestHandler } from './request-lifecycle'
import { ControllerOptions } from './controller'


describe('ControllerMetadata', function() {
  it('should define metadata', function(){
    class Controller implements RequestHandler{
      async handler() {}
    }
    const options: ControllerOptions = { method: 'GET', url: '/' }
    expect(ControllerMetadata.isController(Controller)).to.be.false
    expect(() => ControllerMetadata.get(Controller)).to.throw(Error)
    ControllerMetadata.define(options, Controller)
    expect(ControllerMetadata.isController(Controller)).to.be.true
    expect(ControllerMetadata.get(Controller)).to.deep.eq(options)
  })
})
