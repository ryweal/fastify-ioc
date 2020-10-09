import { Class } from '../di/injector'
import { ControllerHook, RequestHandler } from './request-lifecycle'
import { Decorators } from '../di/decorators'
import { Injector } from '../di/injector'
import { FastifyReply, FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    controller: any
    injector: Injector
  }
}


type Hook = (request: FastifyRequest, reply: FastifyReply) => Promise<void>
export function bindHook(controller: Class<RequestHandler>, hook: ControllerHook): Hook {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

    if(typeof controller.prototype[hook] === 'function') {
      if(request.controller === undefined) {
        request.injector = createRequestInjector(request, reply)
        request.controller = request.injector.resolveClass<any>(controller)
      }

      if(Decorators.isInjectableFunction(controller.prototype, hook)) {
        const parameters = request.injector.resolveFunctionArguments(controller.prototype, hook)
        return request.controller[hook](...parameters)
      } else {
        return request.controller[hook](request, reply)
      }
    }
  }
}

function createRequestInjector(request: FastifyRequest, reply: FastifyReply): Injector {
  return request.injector.extendWith('request', {
    values: [
      {
        key: 'query',
        value: request.query
      },
      {
        key: 'body',
        value: request.body
      },
      {
        key: 'headers',
        value: request.headers
      },
      {
        key: 'params',
        value: request.params
      },
      {
        key: 'request',
        value: request
      },
      {
        key: 'reply',
        value: reply
      }
    ]
  })
}
