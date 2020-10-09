import { expect } from 'chai'
import { asPlugin, RyModule } from './module'
import fastify, { FastifyReply } from 'fastify'
import { Controller, Query, Reply } from '../controller/controller'
import { OnError, PreHandler, RequestHandler } from '../controller/request-lifecycle'
import { Injectable } from '../di/injectable'
import { Value } from '../di/provider'

describe('Module', function() {
  it('should create empty module', function(){
    @RyModule({})
    class EmptyModule{}

    const server = fastify()
    server.register(asPlugin(EmptyModule))
  })
  it('should create a module with a simple route', async function(){
    @Controller({
      method: 'GET',
      url: '/'
    })
    class SimpleController implements RequestHandler{
      @Injectable()
      async handler(@Reply reply: FastifyReply): Promise<void> {
        reply.send('payload')
      }
    }
    @RyModule({
      controllers: [SimpleController]
    })
    class SimpleModule{}

    const server = fastify()
    server.register(asPlugin(SimpleModule))

    const response: any = await server.inject({
      method: 'GET',
      url: '/'
    })
    expect(response.statusCode).to.eq(200)
    expect(response.body).to.eq('payload')
  })
  it('should create a module with a simple route and add a submodule (with prefix) with a simple route', async function(){
    @Controller({
      method: 'GET',
      url: '/'
    })
    class SimpleController implements RequestHandler{
      @Injectable()
      async handler(@Reply reply: FastifyReply): Promise<void> {
        reply.send('payload')
      }
    }
    @RyModule({
      controllers: [SimpleController]
    })
    class FooModule{}
    @RyModule({
      controllers: [SimpleController],
      submodules: [
        { prefix: '/foo', module: FooModule }
      ]
    })
    class RootModule{}

    const server = fastify()
    server.register(asPlugin(RootModule))

    const responseFromRoot: any = await server.inject({
      method: 'GET',
      url: '/'
    })
    expect(responseFromRoot.statusCode).to.eq(200)
    expect(responseFromRoot.body).to.eq('payload')

    const responseFromFoo: any = await server.inject({
      method: 'GET',
      url: '/foo'
    })
    expect(responseFromFoo.statusCode).to.eq(200)
    expect(responseFromFoo.body).to.eq('payload')
  })
  it('should create an empty module and add a submodule (without prefix) with a simple route', async function(){
    @Controller({
      method: 'GET',
      url: '/'
    })
    class SimpleController implements RequestHandler{
      @Injectable()
      async handler(@Reply reply: FastifyReply): Promise<void> {
        reply.send('payload')
      }
    }

    @RyModule({
      controllers: [SimpleController]
    })
    class FooModule{}

    @RyModule({
      submodules: [
        FooModule
      ]
    })
    class EmptyRootModule{}

    const server = fastify()
    server.register(asPlugin(EmptyRootModule))

    const responseFromRoot: any = await server.inject({
      method: 'GET',
      url: '/'
    })
    expect(responseFromRoot.statusCode).to.eq(200)
    expect(responseFromRoot.body).to.eq('payload')
  })
  it('should access parent scope injector value', async function(){
    @Controller({
      method: 'GET',
      url: '/'
    })
    class SimpleController implements RequestHandler{
      @Injectable()
      async handler(@Reply reply: FastifyReply, @Value('x') x: number): Promise<void> {
        reply.send('payload '+x)
      }
    }
    @RyModule({
      controllers: [SimpleController]
    })
    class FooModule{}
    @RyModule({
      controllers: [],
      submodules: [
        { prefix: '/foo', module: FooModule }
      ],
      injection: {
        values: [
          { key: 'x', value: 100 }
        ]
      }
    })
    class RootModule{}

    const server = fastify()
    server.register(asPlugin(RootModule))

    const responseFromFoo: any = await server.inject({
      method: 'GET',
      url: '/foo'
    })
    expect(responseFromFoo.statusCode).to.eq(200)
    expect(responseFromFoo.body).to.eq('payload 100')
  })
  it('should create services' , async function(){
    @Injectable({
      scope: 'root'
    })
    class Service {
      someValues(): string[] {
        return ['apple','pear']
      }
    }

    @Controller({
      method: 'GET',
      url: '/'
    })
    class SimpleController implements RequestHandler {
      @Injectable()
      async handler(@Reply reply: FastifyReply, service: Service): Promise<void> {
        reply.send(service.someValues())
      }
    }

    @RyModule({
      controllers: [SimpleController],
    })
    class RootModule{}

    const server = fastify()
    server.register(asPlugin(RootModule))

    const responseFromFoo: any = await server.inject({
      method: 'GET',
      url: '/'
    })
    expect(responseFromFoo.statusCode).to.eq(200)
    expect(JSON.parse(responseFromFoo.body)).to.deep.eq(['apple','pear'])
  })

  it('should handle errors' , async function(){
    interface SimpleQuery {
      key: string
    }

    @Controller({
      method: 'GET',
      url: '/foo',
      query: {
        type: 'object',
        properties: {
          key: { type: 'string' }
        },
        required: [ 'key' ]
      }
    })
    class SimpleController implements RequestHandler, OnError {
      @Injectable()
      async handler(@Reply reply: FastifyReply, @Query query: SimpleQuery): Promise<void> {
        if(query.key === 'boom')
          throw Error('BOOM')

        reply.send('OK!')
      }
      @Injectable()
      async onError(error: Error, @Reply reply: FastifyReply): Promise<any> {
        reply.status(500)
        reply.send({
          error: error.message
        })
      }
    }

    @RyModule({
      controllers: [SimpleController],
    })
    class RootModule{}

    const server = fastify()
    server.register(asPlugin(RootModule))

    const responseFromFoo: any = await server.inject({
      method: 'GET',
      url: '/foo?key=boom'
    })
    expect(responseFromFoo.statusCode).to.eq(500)
    expect(JSON.parse(responseFromFoo.body)).to.deep.eq({ error: 'Internal Server Error', message: 'BOOM', statusCode: 500 })
  })

  it('should handle errors' , async function(){

  })
})
