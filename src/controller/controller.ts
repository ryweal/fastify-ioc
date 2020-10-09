import { HTTPMethods, RouteOptions } from 'fastify'
import { Decorators } from '../di/decorators'
import { Class } from '../di/injector'
import { ControllerMetadata } from './controller-metadata'
import { Value } from '../di/provider'
import { bindHook } from './binder'
import { RequestHandler } from './request-lifecycle'

export interface ControllerOptions {
  method: HTTPMethods
  url: string,
  attachValidation?: boolean,
  body?: unknown,
  query?: unknown,
  params?: unknown,
  headers?: unknown,
  response?: unknown
}

export const Controller = (options: ControllerOptions) => {
  return (clazz: Class<any>) => {
    Decorators.defineInjectableClass(clazz)
    Decorators.defineScope(clazz,'request')
    options.attachValidation = options.attachValidation ?? false
    ControllerMetadata.define(options, clazz)
  }
}
export const Body = Value('body')
export const Query = Value('query')
export const Headers = Value('headers')
export const Params = Value('params')
export const Request = Value('request')
export const Reply = Value('reply')

export function asRoute(controller: Class<RequestHandler>): RouteOptions {
  const options: ControllerOptions = ControllerMetadata.get(controller)
  return {
    method: options.method,
    url: options.url,
    attachValidation: options.attachValidation,
    schema: {
      body: options.body,
      querystring: options.query,
      params: options.params,
      response: options.response,
      headers: options.headers,
    },
    onRequest: bindHook(controller, 'onRequest'),
    preParsing: bindHook(controller, 'preParsing'),
    preValidation: bindHook(controller, 'preValidation'),
    preHandler: bindHook(controller, 'preHandler'),
    handler: bindHook(controller, 'handler'),
    preSerialization: bindHook(controller, 'preSerialization'),
    onSend: bindHook(controller, 'onSend'),
    onResponse: bindHook(controller, 'onResponse'),
    onError: bindHook(controller, 'onError'),
    onTimeout: bindHook(controller, 'onTimeout'),
  }
}

