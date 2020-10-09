import { expect } from 'chai'
import { Injector } from './injector'
import { Injectable } from './injectable'
import { LazyResolver } from './lazy-resolver'
import { Lazy } from './provider'

describe('Lazy', function() {
  it('should resolve class with lazy decorator only once', function () {
    @Injectable({
      scope: 'root'
    })
    class LazyService {
      constructor() {
      }
    }
    @Injectable({
      scope: 'root'
    })
    class Service {
      constructor(@Lazy(LazyService) public lazy: LazyResolver<LazyService>) {
      }
    }

    const injector = new Injector()
    const instance = injector.resolveClass(Service)
    expect(instance).to.not.be.undefined
    expect(instance.lazy).to.not.be.undefined
    const lazyParameter = instance.lazy.get()

    expect(lazyParameter === instance.lazy.get()).to.be.true
  })
})
