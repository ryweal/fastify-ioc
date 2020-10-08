import { Provider, ProviderParameters } from './provider'
import { Container, ContainerInitialisation } from './container'
import { Decorators } from './decorators'

export interface Class<T> { new (...args:any[]) : T }
export interface InjectableClass<T> extends Class<T> {}
export type Prototype<T> = object

export class Injector {
  public readonly container: Container

  constructor(initialValues?: ContainerInitialisation, container?: Container) {
    if(container === undefined)
      this.container = new Container('root', initialValues)
    else
      this.container = container

    this.container.instances.set(Decorators.getClassInjectionReference(Injector), this)
  }

  extendWith(name: string, initialValues?: ContainerInitialisation) {
    const childContainer = new Container(name, initialValues)
    childContainer.parent = this.container
    return new Injector({}, childContainer)
  }

  resolveClass<T>(clazz: Class<T>): T {
    if(!Decorators.isInjectableClass(clazz))
      throw new Error(`Class ${clazz.name} is not injectable`)

    const reference = Decorators.getClassInjectionReference(clazz)
    const scope = Decorators.getScope(clazz)

    if(this.hasInstance(reference)) {
      return this.findInstance(reference)
    } else {
      const instance = this.createInstance(clazz)
      if(this.hasScope(scope))
        this.findScope(scope).instances.set(reference, instance)
      return instance as T
    }
  }

  resolveProvider<T>(providerParameters: ProviderParameters): T {
    const { key, args } = providerParameters
    const provider = this.findProvider(key)
    return provider(this, ...args) as T
  }

  resolveFunctionArguments(prototype: Prototype<any>, functionName: string | symbol): any[] {
    const parametersTypes = Decorators.getFunctionParametersTypes(prototype, functionName)
    const providers = Decorators.getFunctionParametersProvider(prototype, functionName)

    return this.resolveParameters(parametersTypes, providers)
  }

  private resolveParameters(parametersTypes: Class<any>[], providers: ProviderParameters[]) {
    return parametersTypes.map((parameterType, index) => {
      if(providers[index] !== undefined) {
        return this.resolveProvider(providers[index])
      } else {
        return this.resolveClass(parameterType)
      }
    })
  }

  private createInstance<T>(clazz: Class<T>): T {
    const parametersTypes = Decorators.getClassParametersTypes(clazz)
    const providers = Decorators.getClassParametersProvider(clazz)

    const parameters = this.resolveParameters(parametersTypes, providers)
    return new clazz(...parameters)
  }

  public findValue<T>(key: string | symbol): T {
    for(let container of this.parents())
      if(container.values.has(key))
        return container.values.get(key) as T

    throw new Error(`Cannot resolve value for key ${key.toString()}`)
  }

  public hasValue(key: string | symbol): boolean {
    for(let container of this.parents())
      if(container.values.has(key))
        return true

    return false
  }

  public findProvider<T>(key: string | symbol): Provider<T> {
    for(let container of this.parents())
      if(container.providers.has(key))
        return container.providers.get(key) as Provider<T>

    throw new Error(`Cannot resolve provider for key ${key.toString()}`)
  }

  public hasProvider(key: string | symbol): boolean {
    for(let container of this.parents())
      if(container.providers.has(key))
        return true

    return false
  }

  public findInstance<T>(key: string | symbol): T {
    for(let container of this.parents())
      if(container.instances.has(key))
        return container.instances.get(key) as T

    throw new Error(`Cannot resolve instance for key ${key.toString()}`)
  }

  public hasInstance(key: string | symbol): boolean {
    for(let container of this.parents())
      if(container.instances.has(key))
        return true

    return false
  }

  public findReference<T>(key: string | symbol): Class<T> {
    for(let container of this.parents())
      if(container.references.has(key))
        return container.references.get(key) as Class<T>

    throw new Error(`Cannot resolve instance for key ${key.toString()}`)
  }

  public hasReference(key: string | symbol): boolean {
    for(let container of this.parents())
      if(container.references.has(key))
        return true

    return false
  }

  public findScope(name: string): Container {
    for(let container of this.parents())
      if(container.name === name)
        return container

    throw new Error(`Cannot resolve container for name ${name}`)
  }

  public hasScope(name: string): boolean {
    for(let container of this.parents())
      if(container.name === name)
        return true

    return false
  }

  public parents<T>() {
    let container = this.container
    return {
      *[Symbol.iterator]() {
        yield container
        while(container.parent !== undefined) {
          container = container.parent
          yield container
        }
      }
    }
  }
}
