# Fastify-ioc
Fastify-ioc is fastify plugin that provide dependency injection and modules using decorators

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
## Controllers
A controller is just a fastify route. Every events of the request life-cycle can be define
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
class SimpleController implements RequestHandler, OnError {
  contructor(private service: Service) {}

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
      error: error.message
    })
  }
}
```
Sending a GET request at /foo?name=boom will throw an error catch by onError
More information on fastify documentation.

## Modules
A module is just a fastify plugin. A module can define submodules,
controllers, plugins, hooks, and some options for dependency injection.

Here in the RootModule we define a submodule FooModule with prefix /foo.
Each module use the same controller SimpleController.
```ts
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
    server.listen(3000, function (err, address) {
      if (err) {
        server.log.error(err)
        process.exit(1)
      }
      server.log.info(`server listening on ${address}`)
    })
```
Sending a GET request at / or /foo will output 'payload'

## Dependency injection

A class can define as injectable using @Injectable

```ts
@Injectable({
  scope: 'root'
})
class MyService {}
```

### Scope
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
