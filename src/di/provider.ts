import { Class, Injector, Prototype } from './injector'
import { Decorators, isClass, isPrototype } from './decorators'
import { LazyResolver } from './lazy-resolver'

export type Provider<T> = (container: Injector, ...args:any[]) => T
export interface ProviderParameters {
  key: string | symbol,
  args: any[]
}

const PROVIDER_VALUE = Symbol('provider:value')
const PROVIDER_LAZY =  Symbol('provider:lazy')
const PROVIDER_INJECT =  Symbol('provider:inject')

export function Provide (key: string | symbol, args?: any[]) {
  return (target: Class<any> | Prototype<any>, propertyKey: string | symbol, parameterIndex: number) => {
    if(isClass(target))
      Decorators.defineClassParametersProvider(target, parameterIndex, { key: key, args: args ?? [] })

    if(isPrototype(target))
      Decorators.defineFunctionParametersProvider(target, propertyKey, parameterIndex, { key: key, args: args ?? [] })
  }
}

export const Inject = (target: Class<any> | string | symbol) => {
  return Provide(PROVIDER_INJECT, [target])
}

export const Lazy = (clazz: Class<any>) => {
  return Provide(PROVIDER_LAZY, [clazz])
}

export const Value = (key: string | symbol) => {
  return Provide(PROVIDER_VALUE, [key])
}

export const DEFAULT_PROVIDERS: Array<{ key: symbol, provider: Provider<any> }> = [
  {
    key: PROVIDER_VALUE,
    provider: (injector: Injector, key: string | symbol) => {
      return injector.findValue(key)
    }
  },
  {
    key: PROVIDER_LAZY,
    provider: (injector: Injector, target: Class<any>) => {
      return new LazyResolver(injector, target)
    }
  },
  {
    key: PROVIDER_INJECT,
    provider: (injector: Injector, target: Class<any> | string | symbol):any => {
      if(typeof target === 'string' || typeof target === 'symbol') {
        const useClass = injector.findReference(target)
        return injector.resolveClass<any>(useClass)
      }
      if(isClass(target)) {
        return injector.resolveClass<any>(target)
      }
      throw new Error('Target '+target+' is not valid for injection')
    }
  }
]
