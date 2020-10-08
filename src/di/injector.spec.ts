import { expect } from 'chai'
import { Injector } from './injector'
import { Container } from './container'
import { Decorators } from './decorators'
import { Injectable } from './injectable'
import { Provide } from './provider'

describe('Injector', function() {
  describe('Injector initialisation', function() {
    it('should create an empty injector with scope root', function () {
      const injector = new Injector()
      expect(injector.container).to.not.be.undefined
      expect(injector.container.name).to.eq('root')
      expect(injector.container.instances.get(Decorators.getClassInjectionReference(Injector))).to.eq(injector)
    })
    it('should create an injector from a container', function () {
      const container = new Container('container-name')
      const injector = Injector.of(container)
      expect(injector.container).to.not.be.undefined
      expect(injector.container.name).to.eq('container-name')
      expect(injector.container.instances.get(Decorators.getClassInjectionReference(Injector))).to.eq(injector)
    })
    it('should extend an injector with a new child container', function () {
      let injector = new Injector()
      let injectorExtended = injector.extendWith('extension')
      expect(injectorExtended.container).to.not.be.undefined
      expect(injectorExtended.container.name).to.eq('extension')
      expect(injectorExtended.container.instances.get(Decorators.getClassInjectionReference(Injector))).to.eq(injectorExtended)
      expect(injectorExtended.container.parent).to.eq(injector.container)
    })
  })
  describe('Injector containers', function() {
    it('should iterate over parents', function () {
      let injector = new Injector().extendWith('extension')
      const containers = [...injector.parents()]
      expect(containers[0]).to.eq(injector.container)
      expect(containers[1]).to.eq(injector.container.parent)
    })
    it('should find current container', function () {
      let injector = new Injector().extendWith('extension')
      expect(injector.hasContainer('extension')).to.be.true
      expect(injector.findContainer('extension')).to.eq(injector.container)
    })
    it('should find parent container', function () {
      let injector = new Injector().extendWith('extension')
      expect(injector.hasContainer('root')).to.be.true
      expect(injector.findContainer('root')).to.eq(injector.container.parent)
    })
    it('should throw an error if container does not exist', function () {
      let injector = new Injector().extendWith('extension')
      expect(injector.hasContainer('unknown-container')).to.be.false
      expect(() => injector.findContainer('unknown-container')).to.throw(Error)
    })
  })
  describe('Injector values', function() {
    it('should find value in current container', function () {
      let injector = new Injector().extendWith('extension', {
        values: [
          { key: 'my-key', value: 1}
        ]
      })
      expect(injector.hasValue('my-key')).to.be.true
      expect(injector.findValue('my-key')).to.eq(1)
    })
    it('should find value in parent container', function () {
      let injector = new Injector({
        values: [
          { key: 'my-key', value: 1}
        ]
      }).extendWith('extension')
      expect(injector.hasValue('my-key')).to.be.true
      expect(injector.findValue('my-key')).to.eq(1)
    })
    it('should find value with same key in current container before parent container', function () {
      let injector = new Injector({
        values: [
          { key: 'my-key', value: 2}
        ]
      }).extendWith('extension', {
        values: [
          { key: 'my-key', value: 1}
        ]
      })
      expect(injector.hasValue('my-key')).to.be.true
      expect(injector.findValue('my-key')).to.eq(1)
    })
    it('should throw an error if value does not exist', function () {
      let injector = new Injector().extendWith('extension')
      expect(injector.hasValue('unknown-value')).to.be.false
      expect(() => injector.findValue('unknown-value')).to.throw(Error)
    })
  })
  describe('Injector providers', function() {
    it('should find provider in current container', function () {
      const provider = () => { return 1 }
      let injector = new Injector().extendWith('extension', {
        providers: [
          { key: 'my-key', provider: provider}
        ]
      })
      expect(injector.hasProvider('my-key')).to.be.true
      expect(injector.findProvider('my-key')).to.eq(provider)
    })
    it('should find provider in parent container', function () {
      const provider = () => { return 1 }
      let injector = new Injector({
        providers: [
          { key: 'my-key', provider: provider}
        ]
      }).extendWith('extension')
      expect(injector.hasProvider('my-key')).to.be.true
      expect(injector.findProvider('my-key')).to.eq(provider)
    })
    it('should find provider with same key in current container before parent container', function () {
      const providerCurrent = () => { return 1 }
      const providerParent = () => { return 2 }
      let injector = new Injector({
        providers: [
          { key: 'my-key', provider: providerParent}
        ]
      }).extendWith('extension', {
        providers: [
          { key: 'my-key', provider: providerCurrent}
        ]
      })
      expect(injector.hasProvider('my-key')).to.be.true
      expect(injector.findProvider('my-key')).to.eq(providerCurrent)
    })
    it('should throw an error if provider does not exist', function () {
      let injector = new Injector().extendWith('extension')
      expect(injector.hasProvider('unknown-provider')).to.be.false
      expect(() => injector.findProvider('unknown-provider')).to.throw(Error)
    })
  })
  describe('Injector instances', function() {
    it('should find instance in current container', function () {
      const instance = { key: 'value' }
      let injector = new Injector().extendWith('extension', {
        instances: [
          { key: 'my-key', instance: instance }
        ]
      })
      expect(injector.hasInstance('my-key')).to.be.true
      expect(injector.findInstance('my-key')).to.eq(instance)
    })
    it('should find instance in parent container', function () {
      const instance = { key: 'value' }
      let injector = new Injector({
        instances: [
          { key: 'my-key', instance: instance }
        ]
      }).extendWith('extension')
      expect(injector.hasInstance('my-key')).to.be.true
      expect(injector.findInstance('my-key')).to.eq(instance)
    })
    it('should find instance with same key in current container before parent container', function () {
      const instanceCurrent = { key: 'valueCurrent' }
      const instanceParent = { key: 'valueParent' }
      let injector = new Injector({
        instances: [
          { key: 'my-key', instance: instanceParent }
        ]
      }).extendWith('extension', {
        instances: [
          { key: 'my-key', instance: instanceCurrent }
        ]
      })
      expect(injector.hasInstance('my-key')).to.be.true
      expect(injector.findInstance('my-key')).to.eq(instanceCurrent)
    })
    it('should throw an error if instance does not exist', function () {
      let injector = new Injector().extendWith('extension')
      expect(injector.hasInstance('unknown-instance')).to.be.false
      expect(() => injector.findInstance('unknown-instance')).to.throw(Error)
    })
  })
  describe('Injector references', function() {
    it('should find reference in current container', function () {
      let injector = new Injector().extendWith('extension', {
        references: [
          { key: 'my-key', useClass: Number }
        ]
      })
      expect(injector.hasReference('my-key')).to.be.true
      expect(injector.findReference('my-key')).to.eq(Number)
    })
    it('should find reference in parent container', function () {
      let injector = new Injector({
        references: [
          { key: 'my-key', useClass: Number }
        ]
      }).extendWith('extension')
      expect(injector.hasReference('my-key')).to.be.true
      expect(injector.findReference('my-key')).to.eq(Number)
    })
    it('should find reference with same key in current container before parent container', function () {
      let injector = new Injector({
        references: [
          { key: 'my-key', useClass: String }
        ]
      }).extendWith('extension',{
        references: [
          { key: 'my-key', useClass: Number }
        ]
      })
      expect(injector.hasReference('my-key')).to.be.true
      expect(injector.findReference('my-key')).to.eq(Number)
    })
    it('should throw an error if reference does not exist', function () {
      let injector = new Injector().extendWith('extension')
      expect(injector.hasReference('unknown-reference')).to.be.false
      expect(() => injector.findReference('unknown-reference')).to.throw(Error)
    })
  })
  describe('Injector class resolver', function() {
    it('should throw an error if the class is not injectable', function () {
      class ServiceNotInjectable {}
      let injector = new Injector()
      expect(() => injector.resolveClass(ServiceNotInjectable)).to.throw(Error)
    })
    it('should resolve injectable class with empty constructor', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceInjectableEmpty {}
      let injector = new Injector()
      const service = injector.resolveClass(ServiceInjectableEmpty)
      expect(service).to.not.be.undefined
    })
    it('should resolve injectable class define in root scope only once', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceInRootScope {
        public id: symbol
        constructor() {
          this.id = Symbol('id')
        }
      }
      let injector = new Injector()
      const service1 = injector.resolveClass(ServiceInRootScope)
      const service2 = injector.resolveClass(ServiceInRootScope)
      expect(service1.id).to.eq(service2.id)
    })
    it('should resolve injectable class define in request scope each time with injector in root scope', function () {
      @Injectable({
        scope: 'request'
      })
      class ServiceInRequestscope {
        public id: symbol
        constructor() {
          this.id = Symbol('id')
        }
      }
      let injector = new Injector()
      const service1 = injector.resolveClass(ServiceInRequestscope)
      const service2 = injector.resolveClass(ServiceInRequestscope)
      expect(service1.id).to.not.eq(service2.id)
    })
    it('should resolve injectable class with injectable class in constructor', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceInjectableParent {}
      @Injectable({
        scope: 'root'
      })
      class ServiceInjectableChild {
        constructor(public serviceParent: ServiceInjectableParent) {}
      }
      let injector = new Injector()
      const service:ServiceInjectableChild = injector.resolveClass(ServiceInjectableChild)
      expect(service).to.not.be.undefined
      expect(service.serviceParent).to.not.be.undefined
    })
    it('should resolve injectable class providers', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceWithProviders {
        constructor(@Provide('constant', [100]) public x: number) {}
      }
      let injector = new Injector({
        providers: [
          { key: 'constant', provider: (injector, constant) => { return constant } }
        ]
      })
      const service = injector.resolveClass(ServiceWithProviders)
      expect(service.x).to.eq(100)
    })
  })
  describe('Injector function resolver', function() {
    it('should throw an error if the function is not injectable', function () {
      class ServiceWithFunctionNotInjectable {
        run(){}
      }
      let injector = new Injector()
      expect(() => injector.resolveFunctionArguments(ServiceWithFunctionNotInjectable.prototype, 'run')).to.throw(Error)
    })
    it('should resolve function arguments if function have no arguments', function () {
      class ServiceWithEmptyInjectableFunction {
        @Injectable()
        run(){}
      }
      let injector = new Injector()
      expect(injector.resolveFunctionArguments(ServiceWithEmptyInjectableFunction.prototype, 'run')).to.deep.eq([])
    })
    it('should resolve function arguments if function have injectable arguments', function () {
      @Injectable({
        scope: 'root'
      })
      class ServiceInjectableForFunction {}
      class ServiceWithNotEmptyInjectableFunction {
        @Injectable()
        run(service: ServiceInjectableForFunction){}
      }
      let injector = new Injector()
      const args = injector.resolveFunctionArguments(ServiceWithNotEmptyInjectableFunction.prototype, 'run')
      expect(args.length).to.eq(1)
      expect(args[0]).to.not.be.undefined
    })
  })
})
