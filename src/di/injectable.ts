import { Class, Prototype } from './injector'
import { Decorators, isClass, isPrototype } from './decorators'

export interface InjectableOptions {
  scope: 'root' | 'module' | 'request'
}

export function Injectable(): (target: Prototype<any>, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;
export function Injectable(options: InjectableOptions): (target: Class<any>) => void;
export function Injectable(options?: any) {
  return (target: Prototype<any> | Class<any>, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if(isClass(target) && options != undefined) {
      Decorators.defineInjectableClass(target)
      Decorators.defineScope(target, options.scope)
    }

    if(isPrototype(target) && propertyKey != undefined)
      Decorators.defineInjectableFunction(target, propertyKey)
  }
}
