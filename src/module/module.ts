import { Class, Injector } from '../di/injector'
import { RequestHandler } from '../controller/request-lifecycle'
import { ContainerInitialisation } from '../di/container'
import { FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from 'fastify'
import { asRoute } from '../controller/controller'

declare module 'fastify' {
  interface FastifyInstance {
    injector: Injector
    module: Module
  }
}

export interface Module extends Class<any>{}
export interface RyModuleOptions {
  controllers?: Class<RequestHandler>[]
  submodules?: Array<RoutingModule | Module>
  hooks?: Hook[],
  plugins?: PluginDefinition[]
  injection?: ContainerInitialisation
}
export interface RoutingModule {
  prefix: string,
  module: Module
}
export interface Hook {
  name: any,
  hook: any
}
export interface PluginDefinition {
  plugin: FastifyPluginAsync | FastifyPluginCallback
  opts?: any
}
export interface OnInit {
  onInit(instance: FastifyInstance): Promise<void>
}
const SYM_MODULE = Symbol('module')
export const RyModule = (options: RyModuleOptions) => {
  return (constructor: Class<any>) => {
    Reflect.defineMetadata(SYM_MODULE, options, constructor)
  }
}

function isModule(obj: unknown): obj is Module {
  return typeof(obj) === 'function' && Reflect.hasMetadata(SYM_MODULE, obj)
}

export function asPlugin(moduleClass: Module) {
  return async (moduleInstance: FastifyInstance) => {
    if(!Reflect.hasMetadata(SYM_MODULE, moduleClass))
      throw new Error(moduleClass?.name+' is not a module')

    const options = Reflect.getMetadata(SYM_MODULE, moduleClass) as RyModuleOptions

    const injector = createModuleInjector(moduleInstance, options)
    moduleInstance.decorate('injector', injector)
    moduleInstance.decorateRequest('injector', injector)

    const mod = new moduleClass()
    moduleInstance.decorate('module', mod)

    if('onInit' in moduleClass.prototype) {
      await mod.onInit(moduleInstance)
    }

    initModule(moduleInstance, options)
  }
}

function createModuleInjector(moduleInstance: FastifyInstance, options: RyModuleOptions): Injector {
  if(moduleInstance.injector === undefined){
    return new Injector(options.injection)
  } else {
    return moduleInstance.injector.extendWith('module', options.injection)
  }
}

function initModule(moduleInstance: FastifyInstance, options: RyModuleOptions) {

  if(options.plugins)
    for(let { plugin, opts } of options.plugins)
      moduleInstance.register(plugin, opts)

  if(options.hooks)
    for(let { name, hook } of options.hooks)
      moduleInstance.addHook(name, hook)

  if(options.controllers)
    for(let controller of options.controllers)
      moduleInstance.route(asRoute(controller))

  if(options.submodules) {
    for(let submodule of options.submodules) {
      if(isModule(submodule)) {
        moduleInstance.register(asPlugin(submodule))
      } else {
        moduleInstance.register(asPlugin(submodule.module), { prefix: submodule.prefix })
      }
    }
  }
}
