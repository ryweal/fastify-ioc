import { expect } from 'chai'
import { Decorators } from './decorators'

describe('Decorators', function() {
  class Service {
    constructor(key: string, x: number) {}
    run(key: string, x: number) {}
  }
  @Reflect.metadata('metadata:key', {})
  class ServiceWithDecorators {
    constructor(key: string, x: number) {}
    @Reflect.metadata('metadata:key', {})
    run(key: string, x: number) {}
  }
  it('should create injection reference', function () {
    expect(Decorators.isInjectableClass(Service)).to.be.false
    expect(Decorators.getClassInjectionReference(Service)).to.be.undefined
    Decorators.defineInjectableClass(Service)
    expect(Decorators.isInjectableClass(Service)).to.be.true
    expect(Decorators.getClassInjectionReference(Service)).to.not.be.undefined
  })
  it('should define scope', function () {
    expect(Decorators.hasScope(Service)).to.be.false
    expect(Decorators.getScope(Service)).to.be.undefined
    Decorators.defineScope(Service,'scope')
    expect(Decorators.hasScope(Service)).to.be.true
    expect(Decorators.getScope(Service)).to.eq('scope')
  })
  it('should define injectable function', function () {
    expect(Decorators.isInjectableFunction(Service.prototype, 'run')).to.be.false
    expect(Decorators.getFunctionInjectionReference(Service.prototype, 'run')).to.be.undefined
    Decorators.defineInjectableFunction(Service.prototype,'run')
    expect(Decorators.isInjectableFunction(Service.prototype, 'run')).to.be.true
    expect(Decorators.getFunctionInjectionReference(Service.prototype, 'run')).to.not.be.undefined
  })
  it('should define class parameter provider', function () {
    const parameter2 = {
      key: 'a-key',
      args: ['str', 15]
    }
    const parameter5 = {
      key: 'my-key',
      args: [1,'ok']
    }
    expect(Decorators.hasClassParametersProvider(Service)).to.be.false
    expect(Decorators.getClassParametersProvider(Service)).to.deep.eq([])
    Decorators.defineClassParametersProvider(Service,5, parameter5)
    expect(Decorators.hasClassParametersProvider(Service)).to.be.true
    expect(Decorators.getClassParametersProvider(Service)[5]).to.deep.eq(parameter5)
    Decorators.defineClassParametersProvider(Service,2, parameter2)
    expect(Decorators.getClassParametersProvider(Service)[2]).to.deep.eq(parameter2)
    expect(Decorators.getClassParametersProvider(Service)[5]).to.deep.eq(parameter5)
  })
  it('should define function parameter provider', function () {
    const parameter2 = {
      key: 'a-key',
      args: ['str', 15]
    }
    const parameter5 = {
      key: 'my-key',
      args: [1,'ok']
    }
    expect(Decorators.hasFunctionParametersProvider(Service.prototype, 'run')).to.be.false
    expect(Decorators.getFunctionParametersProvider(Service.prototype, 'run')).to.deep.eq([])
    Decorators.defineFunctionParametersProvider(Service.prototype, 'run',5, parameter5)
    expect(Decorators.hasFunctionParametersProvider(Service.prototype, 'run')).to.be.true
    expect(Decorators.getFunctionParametersProvider(Service.prototype, 'run')[5]).to.deep.eq(parameter5)
    Decorators.defineFunctionParametersProvider(Service.prototype, 'run',2, parameter2)
    expect(Decorators.getFunctionParametersProvider(Service.prototype, 'run')[2]).to.deep.eq(parameter2)
    expect(Decorators.getFunctionParametersProvider(Service.prototype, 'run')[5]).to.deep.eq(parameter5)
  })
  it('should return empty array from class constructor without decorator', function () {
    expect(Decorators.getClassParametersTypes(Service)).to.deep.eq([])
  })
  it('should return empty array from function without decorator', function () {
    expect(Decorators.getFunctionParametersTypes(Service.prototype,'run')).to.deep.eq([])
  })
  it('should return parameters from class constructor with decorator', function () {
    expect(Decorators.getClassParametersTypes(ServiceWithDecorators)).to.deep.eq([String,Number])
  })
  it('should return parameters from function with decorator', function () {
    expect(Decorators.getFunctionParametersTypes(ServiceWithDecorators.prototype, 'run')).to.deep.eq([String,Number])
  })
})
