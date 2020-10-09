import { Injectable } from './injectable'
import { Inject, Provide, Value } from './provider'
import { Injector } from './injector'
import { expect } from "chai"

describe('Provider', function() {
  describe('Provide', function () {
    const injector = new Injector({
      providers: [
        { key: 'constant', provider: (injector, constant) => { return constant } }
      ]
    })
    it('should execute provider in constructor', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceWithProviders {
        constructor(@Provide('constant', [100]) public x: number) {}
      }
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
      const args = injector.resolveFunctionArguments(ServiceWithProvidersInFunction.prototype, 'run')
      expect(args[0]).to.eq(100)
    })
    it('should execute provider in constructor with provider without args', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceWithProvidersAndNoArgs {
        constructor(@Provide('constant') public x?: number) {}
      }
      const service = injector.resolveClass(ServiceWithProvidersAndNoArgs)
      expect(service.x).to.be.undefined
    })
    it('should execute provider in function with provider without args', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceWithProvidersInFunctionAndNoArgs {
        constructor() {}
        @Injectable()
        run(@Provide('constant') x: number | undefined) {}
      }
      const args = injector.resolveFunctionArguments(ServiceWithProvidersInFunctionAndNoArgs.prototype, 'run')
      expect(args[0]).to.be.undefined
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
    it('should throw an error if inject cannot handle the key', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceToInjectAsWrongType {}

      @Injectable({
        scope: 'root'
      })
      class ServiceWithInjectAsClass {
        constructor(@Inject({} as string) public service: ServiceToInjectAsWrongType) {
        }
      }

      const injector = new Injector({})
      expect(() => injector.resolveClass(ServiceWithInjectAsClass)).to.throw(Error)
    })
  })
})
