import { expect } from 'chai'
import sinon from 'sinon'
import { RequestHandler } from './request-lifecycle'
import { bindHook } from './binder'
import { FastifyReply, FastifyRequest } from 'fastify'
import { Injector } from '../di/injector'
import { Injectable } from '../di/injectable'

describe('Binder', function() {
  it('should bind not injectable hook', async function(){
    @Injectable({
      scope: 'root'
    })
    class TestControllerHookNotInjectable implements RequestHandler {
      async handler(): Promise<void> {}
    }
    const hook = bindHook(TestControllerHookNotInjectable, 'handler')

    expect(hook).to.not.be.undefined

    const requestInjector = sinon.createStubInstance(Injector)
    const rootInjector = sinon.createStubInstance(Injector)
    const fakeRequest = {
      injector: rootInjector,
      query: {},
      body: {},
      headers: {},
      params: {}
    } as any as FastifyRequest
    const fakeReply = {} as FastifyReply
    const controllerInstance = new TestControllerHookNotInjectable()

    requestInjector.resolveClass.withArgs(TestControllerHookNotInjectable).returns(controllerInstance)
    rootInjector.extendWith.returns(requestInjector as any as Injector)

    await hook(fakeRequest, fakeReply)
    expect(fakeRequest.injector).to.eq(requestInjector)
    expect(fakeRequest.controller).to.eq(controllerInstance)
    expect(rootInjector.extendWith.calledOnceWith('request',{
      values: [
        {
          key: 'query',
          value: fakeRequest.query
        },
        {
          key: 'body',
          value: fakeRequest.body
        },
        {
          key: 'headers',
          value: fakeRequest.headers
        },
        {
          key: 'params',
          value: fakeRequest.params
        },
        {
          key: 'request',
          value: fakeRequest
        },
        {
          key: 'reply',
          value: fakeReply
        }
      ]
    })).to.be.true
  })
  it('should reuse same controller on next hook', async function(){
    @Injectable({
      scope: 'root'
    })
    class TestControllerMultipleHooks implements RequestHandler {
      async handler(): Promise<void> {}
    }
    const hook = bindHook(TestControllerMultipleHooks, 'handler')
    const requestInjector = sinon.createStubInstance(Injector)
    const rootInjector = sinon.createStubInstance(Injector)
    const fakeRequest = { injector: rootInjector } as any as FastifyRequest
    const fakeReply = {} as FastifyReply
    const controllerInstance = new TestControllerMultipleHooks()

    requestInjector.resolveClass.withArgs(TestControllerMultipleHooks).returns(controllerInstance)
    rootInjector.extendWith.returns(requestInjector as any as Injector)

    await hook(fakeRequest, fakeReply)
    expect(fakeRequest.injector).to.eq(requestInjector)
    expect(fakeRequest.controller).to.eq(controllerInstance)

    await hook(fakeRequest, fakeReply)
    expect(fakeRequest.injector).to.eq(requestInjector)
    expect(fakeRequest.controller).to.eq(controllerInstance)
    expect(requestInjector.resolveClass.calledOnce).to.be.true
    expect(rootInjector.extendWith.calledOnce).to.be.true
  })
  it('should bind injectable hook', async function(){
    @Injectable({
      scope: 'root'
    })
    class TestControllerHookInjectable implements RequestHandler {
      @Injectable()
      async handler(): Promise<void> {}
    }
    const hook = bindHook(TestControllerHookInjectable, 'handler')
    const requestInjector = sinon.createStubInstance(Injector)
    const rootInjector = sinon.createStubInstance(Injector)
    const fakeRequest = {
      injector: rootInjector,
      query: {},
      body: {},
      headers: {},
      params: {}
    } as any as FastifyRequest
    const fakeReply = {} as FastifyReply
    const controllerInstance = new TestControllerHookInjectable()
    requestInjector.resolveClass.withArgs(TestControllerHookInjectable).returns(controllerInstance)
    requestInjector.resolveFunctionArguments.withArgs(TestControllerHookInjectable.prototype, 'handler').returns([])
    rootInjector.extendWith.returns(requestInjector as any as Injector)
    await hook(fakeRequest, fakeReply)
    expect(fakeRequest.injector).to.eq(requestInjector)
    expect(fakeRequest.controller).to.eq(controllerInstance)
  })
  it('should do nothing if class does not have hook', async function(){
    @Injectable({
      scope: 'root'
    })
    class TestControllerHook implements RequestHandler {
      constructor() {
        throw new Error('Should not be instantiated')
      }
      @Injectable()
      async handler(): Promise<void> {}
    }
    const hook = bindHook(TestControllerHook, 'onRequest')
    const fakeRequest = {} as any as FastifyRequest
    const fakeReply = {} as FastifyReply
    await hook(fakeRequest, fakeReply)
    expect(fakeRequest.injector).to.be.undefined
    expect(fakeRequest.controller).to.be.undefined
  })
})
