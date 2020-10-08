import 'reflect-metadata'
import { Class, Prototype } from './injector'
import { ProviderParameters } from './provider'

const SYM_INJECTION_CLASS = Symbol('injectable:class')
const SYM_INJECTION_FUNCTION = Symbol('injectable:function')
const SYM_INJECTION_SCOPE = Symbol('injection:scope')
const SYM_INJECTION_PROVIDER = Symbol('injection:scope')
const FUNCTION_PARAMETERS_TYPES = 'design:paramtypes'

export function isClass(target: unknown): target is Class<any> {
  return typeof(target) === 'function'
}
export function isPrototype(target: unknown): target is Prototype<any> {
  return typeof(target) === 'object'
}

export class Decorators {
  public static defineInjectableClass(clazz: Class<any>): void {
    Reflect.defineMetadata(SYM_INJECTION_CLASS, Symbol('injection:class:reference'), clazz)
  }
  public static isInjectableClass(clazz: Class<any>): boolean {
    return Reflect.hasMetadata(SYM_INJECTION_CLASS, clazz)
  }
  public static getClassInjectionReference(clazz: Class<any>): symbol {
    return Reflect.getMetadata(SYM_INJECTION_CLASS, clazz)
  }

  public static defineScope(clazz: Class<any>, scope: string): void {
    Reflect.defineMetadata(SYM_INJECTION_SCOPE, scope, clazz)
  }
  public static hasScope(clazz: Class<any>): boolean {
    return Reflect.hasMetadata(SYM_INJECTION_SCOPE, clazz)
  }
  public static getScope(clazz: Class<any>): string {
    return Reflect.getMetadata(SYM_INJECTION_SCOPE, clazz)
  }

  public static defineInjectableFunction(prototype: Prototype<any>, propertyKey: string | symbol): void {
    Reflect.defineMetadata(SYM_INJECTION_FUNCTION, Symbol('injection:function:reference'), prototype, propertyKey);
  }
  public static isInjectableFunction(prototype: Prototype<any>, propertyKey: string | symbol): boolean {
    return Reflect.hasMetadata(SYM_INJECTION_FUNCTION, prototype, propertyKey)
  }
  public static getFunctionInjectionReference(prototype: Prototype<any>, propertyKey: string | symbol): boolean {
    return Reflect.getMetadata(SYM_INJECTION_FUNCTION, prototype, propertyKey)
  }

  public static defineClassParametersProvider(clazz: Class<any>, index: number, providerParameters: ProviderParameters): void {
    const parameters = Decorators.getClassParametersProvider(clazz)
    parameters[index] = providerParameters
    Reflect.defineMetadata(SYM_INJECTION_PROVIDER, parameters, clazz)
  }
  public static hasClassParametersProvider(clazz: Class<any>): boolean {
    return Reflect.hasMetadata(SYM_INJECTION_PROVIDER, clazz)
  }
  public static getClassParametersProvider(clazz: Class<any>): ProviderParameters[] {
    return Reflect.getMetadata(SYM_INJECTION_PROVIDER, clazz) ?? []
  }

  public static defineFunctionParametersProvider(prototype: Prototype<any>, propertyKey: string | symbol, index: number, providerParameters: ProviderParameters): void {
    let parameters: ProviderParameters[]

    if(Decorators.hasFunctionParametersProvider(prototype, propertyKey))
      parameters = Decorators.getFunctionParametersProvider(prototype, propertyKey)
    else
      parameters = []

    parameters[index] = providerParameters
    Reflect.defineMetadata(SYM_INJECTION_PROVIDER, parameters, prototype, propertyKey)
  }
  public static hasFunctionParametersProvider(prototype: Prototype<any>, propertyKey: string | symbol): boolean {
    return Reflect.hasMetadata(SYM_INJECTION_PROVIDER, prototype, propertyKey)
  }
  public static getFunctionParametersProvider(prototype: Prototype<any>, propertyKey: string | symbol): ProviderParameters[] {
    return Reflect.getMetadata(SYM_INJECTION_PROVIDER, prototype, propertyKey) ?? []
  }

  public static getClassParametersTypes(clazz: Class<any>): Class<any>[] {
    return Reflect.getMetadata(FUNCTION_PARAMETERS_TYPES, clazz) ?? []
  }

  public static getFunctionParametersTypes(prototype: Prototype<any>, propertyKey: string | symbol): Class<any>[] {
    return Reflect.getMetadata(FUNCTION_PARAMETERS_TYPES, prototype, propertyKey) ?? []
  }
}
