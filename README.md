# Fastify-ioc
Fastify-ioc is a fastify plugin that provide dependency injection and modules using decorators

## Simple example
```ts
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
    server.listen(3000, function (err, address) {
      if (err) {
        server.log.error(err)
        process.exit(1)
      }
      server.log.info(`server listening on ${address}`)
    })
```
Sending a GET request at / will output
```json
["apple","pear"]
```

## Installing
WIP
```json
{
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
}
```
## Documentation
### 1. Controllers
A controller is just a fastify route.

Controller options
```ts
interface ControllerOptions {
  method: HTTPMethods
  url: string,
  attachValidation?: boolean,
  body?: unknown,
  query?: unknown,
  params?: unknown,
  headers?: unknown,
  response?: unknown
}
```
Every events of the request life-cycle can be define. You can use dependency injection 
in constructor or directly in a request event.
```ts
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
class SimpleController implements OnRequest, RequestHandler, OnError {
  contructor(private service: Service) {}

  // If we dont add @Injectable, we have to use default parameters
  async onRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    request.log.info('We have a request !')
  }

  @Injectable()
  async handler(@Reply reply: FastifyReply, @Query query: SimpleQuery): Promise<void> {
    if(query.key === 'boom')
      throw Error('BOOM')

    reply.send(service.someValues())
  }

  @Injectable()
  async onError(error: Error, @Reply reply: FastifyReply): Promise<any> {
    reply.status(500)
    reply.send({
      explosion: true
    })
  }
}
```
Sending a GET request at /foo?name=boom will throw an error catch by onError
More information on fastify documentation.

### 2. Modules
A module is just a fastify plugin. A module can define submodules,
controllers, plugins, hooks, and some options for dependency injection.

Module options
```ts
interface RyModuleOptions {
  controllers?: Class<RequestHandler>[]
  submodules?: Array<RoutingModule | Module>
  hooks?: Hook[],
  plugins?: PluginDefinition[]
  injection?: ContainerInitialisation
}
```
Here in the RootModule we define a submodule FooModule with prefix /foo.
Each module use the same controller SimpleController.
```ts
    //...
    import swagger from 'fastify-swagger'

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
      ],
      plugins: [
        {
          plugin: swagger,
          opts: {
            routePrefix: '/doc',
            exposeRoute: true
          }
        }
     ]
    })
    class RootModule implements OnInit {
      onInit(moduleInstance: FastifyInstance) {
        // more complex stuff
      }
    }

    const server = fastify()
    server.register(asPlugin(RootModule))
    server.listen(3000, function (err, address) {
      if (err) {
        server.log.error(err)
        process.exit(1)
      }
      server.log.info(`server listening on ${address}`)
    })
```
Sending a GET request at / or /foo will output 'payload'.

You can define plugins for a module. Here we add swagger to the RootModule.
Swagger documentation at /doc will show two endpoints GET / and GET /foo.

If you have more complex initialisation to make, you can implement OnInit, 
and have a direct access to the FastifyInstance before loading of plugins, hooks, routes and submodules.

## 3. Dependency injection

A class can define as injectable using @Injectable

```ts
@Injectable({
  scope: 'root'
})
class MyService {}
```

### 3.1. Scope
There is 3 types of scope
- root
- module
- request

Injection tree
```

     + module OtherModule
     |
+--- + module FooModule
|
+--- + module BarModule
|
module RootModule
|
root
```

And every valid request will create a request scope on top of that.

An Injectable declared in scope root will be a singleton, it will be shared will all other module
An Injectable declared in scope module will be available only in the module where it was instantiated
An Injectable declared in scope request will be available only for the current request
