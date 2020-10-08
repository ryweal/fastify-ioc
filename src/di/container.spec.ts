import { expect } from 'chai'
import { Container } from './container'
import { DEFAULT_PROVIDERS } from './provider'

describe('Container', function() {
  it('should create an empty container', function () {
    const container = new Container('container-name')
    expect(container.parent).to.be.undefined
    expect(container.id).to.not.be.undefined
    expect(container.name).to.eq('container-name')
    expect(container.values).to.not.be.undefined
    expect(container.values.size).to.eq(0)
    expect(container.providers.size).to.eq(DEFAULT_PROVIDERS.length)
    expect(container.instances.size).to.eq(0)
    expect(container.references.size).to.eq(0)
  })

  it('should create a container with no initial values', function () {
    const container = new Container('container-name', {})
    expect(container).to.not.be.undefined
  })

  it('should create a container with values', function () {
    const values = [
      { key: 'my-key', value: 1 },
      { key: Symbol('my-key'), value: {} }
    ]
    const container = new Container('container-name', {
      values: values
    })
    expect(container.values.size).to.eq(values.length)
    for(let { key, value } of values) {
      expect(container.values.has(key)).to.be.true
      expect(container.values.get(key)).to.eq(value)
    }
  })

  it('should create a container with providers', function () {
    const providersList = [
      { key: 'my-key', provider: () => {} },
      { key: Symbol('my-key'), provider: () => { return 1 } }
    ]
    const container = new Container('container-name', {
      providers: providersList
    })
    expect(container.providers.size).to.eq(providersList.length + DEFAULT_PROVIDERS.length)
    for(let { key, provider } of providersList) {
      expect(container.providers.has(key)).to.be.true
      expect(container.providers.get(key)).to.eq(provider)
    }
  })

  it('should create a container with instances', function () {
    const instances = [
      { key: 'my-key', instance: {} },
      { key: Symbol('my-key'), instance: { key: 1 } }
    ]
    const container = new Container('container-name', {
      instances: instances
    })
    expect(container.instances.size).to.eq(instances.length)
    for(let { key, instance } of instances) {
      expect(container.instances.has(key)).to.be.true
      expect(container.instances.get(key)).to.deep.eq(instance)
    }
  })

  it('should create a container with references', function () {
    class ServiceA {}
    class ServiceB {}
    const references = [
      { key: 'my-key', useClass: ServiceA },
      { key: Symbol('my-key'), useClass: ServiceB }
    ]
    const container = new Container('container-name', {
      references: references
    })
    expect(container.references.size).to.eq(references.length)
    for(let { key, useClass } of references) {
      expect(container.references.has(key)).to.be.true
      expect(container.references.get(key)).to.deep.eq(useClass)
    }
  })
})
