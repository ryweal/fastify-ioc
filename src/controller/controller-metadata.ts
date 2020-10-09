import { ControllerOptions } from './controller'
import { Class } from '../di/injector'
import { RequestHandler } from './request-lifecycle'

const SYM_CONTROLLER = Symbol('controller')

export class ControllerMetadata {
  public static isController(controller: Class<RequestHandler>): boolean {
    return Reflect.hasMetadata(SYM_CONTROLLER, controller)
  }
  public static define(value: ControllerOptions, controller: Class<RequestHandler>): void {
    Reflect.defineMetadata(SYM_CONTROLLER, value, controller)
  }
  public static get(controller: Class<RequestHandler>): ControllerOptions {
    if(!ControllerMetadata.isController(controller))
      throw new Error(`Class ${controller.name} is not decorated with @Controller`)

    return Reflect.getMetadata(SYM_CONTROLLER, controller) as ControllerOptions
  }
}
