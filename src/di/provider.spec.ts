import { Injectable } from './injectable'
import { Inject, Provide, Value } from './provider'
import { Injector } from './injector'
import { expect } from "chai"

describe('Provider', function() {
  describe('Provide', function () {
    it('should execute provider in constructor', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceWithProviders {
        constructor(@Provide('constant', [100]) public x: number) {}
      }
      const injector = new Injector({
        providers: [
          { key: 'constant', provider: (injector, constant) => { return constant } }
        ]
      })
      const service = injector.resolveClass(ServiceWithProviders)
      expect(service.x).to.eq(100)
    })
    it('should execute provider in function', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceWithProvidersInFunction {
        constructor() {}
        @Injectable()
        run(@Provide('constant', [100]) x: number) {}
      }
      const injector = new Injector({
        providers: [
          { key: 'constant', provider: (injector, constant) => { return constant } }
        ]
      })
      const args = injector.resolveFunctionArguments(ServiceWithProvidersInFunction.prototype, 'run')
      expect(args[0]).to.eq(100)
    })
  })
  describe('Value', function () {
    it('should execute value provider', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceWithProviderValue {
        constructor(@Value('key') public x: number) {}
      }
      const injector = new Injector({
        values: [
          { key: 'key', value: 100 }
        ]
      })
      const service = injector.resolveClass(ServiceWithProviderValue)
      expect(service.x).to.eq(100)
    })
  })
  describe('Inject', function () {
    it('should execute inject provider from key', function () {
      interface IService {}
      @Injectable({
        scope: 'root'
      })
      class ServiceToInject implements IService {}

      @Injectable({
        scope: 'root'
      })
      class ServiceWithProviderValue {
        constructor(@Inject('key') public service: ServiceToInject) {
        }
      }

      const injector = new Injector({
        references: [
          { key: 'key', useClass: ServiceToInject }
        ]
      })
      const service = injector.resolveClass(ServiceWithProviderValue)
      expect(service.service).to.not.be.undefined
    })
  })
  it('should execute inject provider from class', function () {
    @Injectable({
      scope: 'root'
    })
    class ServiceToInjectAsClass {}

    @Injectable({
      scope: 'root'
    })
    class ServiceWithInjectAsClass {
      constructor(@Inject(ServiceToInjectAsClass) public service: ServiceToInjectAsClass) {
      }
    }

    const injector = new Injector({
      references: [
        { key: 'key', useClass: ServiceToInjectAsClass }
      ]
    })
    const service = injector.resolveClass(ServiceWithInjectAsClass)
    expect(service.service).to.not.be.undefined
  })
})
