import { expect } from 'chai'
import { asRoute, Controller } from './controller'
import { Decorators } from '../di/decorators'
import { ControllerMetadata } from './controller-metadata'
import { RequestHandler } from './request-lifecycle'

describe('Controller', function() {
  it('should define controller', function(){
    @Controller({
      method: 'GET',
      url: '/'
    })
    class TestController implements RequestHandler{
      async handler(){}
    }
    expect(Decorators.isInjectableClass(TestController)).to.be.true
    expect(Decorators.getScope(TestController)).to.eq('request')
    expect(ControllerMetadata.get(TestController)).to.deep.eq({
      method: 'GET',
      url: '/',
      attachValidation: false
    })
  })
  it('should define controller with validation', function(){
    @Controller({
      method: 'GET',
      url: '/',
      attachValidation: true
    })
    class TestControllerWithValidation implements RequestHandler{
      async handler(){}
    }
    expect(Decorators.isInjectableClass(TestControllerWithValidation)).to.be.true
    expect(Decorators.getScope(TestControllerWithValidation)).to.eq('request')
    expect(ControllerMetadata.get(TestControllerWithValidation)).to.deep.eq({
      method: 'GET',
      url: '/',
      attachValidation: true
    })
  })
  it('should create route from controller', function(){
    @Controller({
      method: 'POST',
      url: '/url',
      attachValidation: true
    })
    class TestControllerWithValidation implements RequestHandler{
      async handler(){}
    }
    const route = asRoute(TestControllerWithValidation)
    expect(route.method).to.eq('POST')
    expect(route.url).to.eq('/url')
    expect(route.attachValidation).to.be.true
  })
})
