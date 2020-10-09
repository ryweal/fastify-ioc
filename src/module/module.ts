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
  submodules?: SubModule[],//Array<SubModule | Module>
  hooks?: Hook[],
  plugins?: PluginDefinition[]
  injection?: ContainerInitialisation
}
export interface SubModule {
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
  return (constructor: Function) => {
    Reflect.defineMetadata(SYM_MODULE, options, constructor)
  }
}

export function asPlugin(moduleClass: Module) {
  return async (moduleInstance: FastifyInstance) => {
    const options = Reflect.getMetadata(SYM_MODULE, moduleClass) as RyModuleOptions
    let injector: Injector;
    if(moduleInstance.injector === undefined){
      injector = new Injector(options.injection)
    } else {
      injector = moduleInstance.injector.extendWith('module', options.injection)
    }
    moduleInstance.decorate('injector', injector)
    moduleInstance.decorateRequest('injector', injector)

    const mod = new moduleClass()
    moduleInstance.decorate('module', mod)

    if('onInit' in moduleClass.prototype) {
      await mod.onInit(moduleInstance)
    }

    if(options.plugins)
      for(let { plugin, opts } of options.plugins)
        moduleInstance.register(plugin, opts)

    if(options.hooks)
      for(let { name, hook } of options.hooks)
        moduleInstance.addHook(name, hook)

    if(options.controllers)
      for(let controller of options.controllers)
        moduleInstance.route(asRoute(controller))

    if(options.submodules)
      for(let { prefix, module } of options.submodules)
        moduleInstance.register(asPlugin(module), { prefix })
  }
}
