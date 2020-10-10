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

- An Injectable declared in scope root will be a singleton, it will be shared will all other module
- An Injectable declared in scope module will be available only in the module where it was instantiated
- An Injectable declared in scope request will be available only for the current request

### 3.2 Injector
Initialisation of the injector
```ts
interface ContainerInitialisation {
  values?: Array<{
    key: string | symbol,
    value: any
  }>,
  providers?: Array<{
    key: string | symbol,
    provider: Provider<any>
  }>,
  instances?: Array<{
    key: string | symbol,
    instance: any
  }>,
  references?: Array<{
    key: string | symbol,
    useClass: Class<any>
  }>
}
```
Here a little bit complex example of what you can do.
```ts
@Injectable({
    scope: 'root'
})
class Service {}

interface OtherService {}

@Injectable({
    scope: 'root'
})
class OtherServiceImplA implement OtherService {}

@Injectable({
    scope: 'root'
})
class OtherServiceImplB implement OtherService {}

@Controller({
  method: 'GET',
  url: '/'
})
class SimpleController implements RequestHandler {
  @Injectable()
  async handler(
    @Reply reply: FastifyReply,
    service: Service,
    @Lazy(Service) lazyService: Lazy<Service>,
    @Inject('OtherService') otherService: OtherService,
    @Value('x') x: number,
    @Provide('OtherServiceFactory', ['A']) otherServiceWithProvide: OtherService
  ): Promise<void> {
    reply.send({})
  }
}
@RyModule({
  controllers: [SimpleController],
  injection: {
    values: [
      { key: 'x', value: 150 }
    ],
    providers: [
      { 
        key: 'OtherServiceFactory',
        provider: (injector: Injector, type: string) => {
          if(type == 'A') {
            return injector.resolveClass<>(OtherServiceImplA)
          }
          if(type == 'B') {
            return injector.resolveClass<>(OtherServiceImplB)
          }
          
          return injector.resolveClass<>(OtherServiceImplB)
        }
      }
    ],
    references: [
      { key: 'OtherService', useClass: OtherServiceImplA }
    ]
  }
})
class RootModule {}
```
You can inject :
- injectable class, directly like ```service```
- interface using @Inject like ```otherService``` and add a reference in current 
or parent module ```{ key: 'OtherService', useClass: OtherServiceImplA }```
- value like ```x``` and add a value in current or parent 
module ```{ key: 'x', value: 150 }```
- lazy injection like ```lazyService``` the Service class will be instantiate 
only once with the first call of ```lazyService.get()```, after that each call will 
return the same instance.

You also can inject more complex thing using @Provide because provider can have
a direct access to the injector. 

Everything is a provider, @Value is just a provider that 
return ```injector.findValue(key)``` and @Reply is just an alias
for @Value('reply'), @Inject too, etc...
