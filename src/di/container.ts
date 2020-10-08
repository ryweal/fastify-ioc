import { DEFAULT_PROVIDERS, Provider } from './provider'
import { Class } from './injector'

export interface ContainerInitialisation {
  values?: Array<{
    key: string | symbol,
    value: any
  }>,
  providers?: Array<{
    key: string | symbol,
    provider: Provider<any>
  }>,
  instances?: Array<{
    key: string | symbol,
    instance: any
  }>,
  references?: Array<{
    key: string | symbol,
    useClass: Class<any>
  }>
}

export class Container {
  public parent: Container | undefined
  public readonly id: symbol
  public readonly name: string

  public readonly values: Map<string | symbol, any>
  public readonly providers: Map<string | symbol, any>
  public readonly instances: Map<string | symbol, any>
  public readonly references: Map<string | symbol, Class<any>>

  constructor(name: string, initialValues?: ContainerInitialisation) {
    this.name = name
    this.id = Symbol('container')

    this.values = new Map<string|symbol, any>()
    this.providers = new Map<string|symbol, Provider<any>>()
    this.instances = new Map<string|symbol, any>()
    this.references = new Map<string|symbol, Class<any>>()

    for(let { key, provider } of DEFAULT_PROVIDERS)
      this.providers.set(key, provider)

    if(initialValues)
      this.init(initialValues)
  }

  private init(initialisation: ContainerInitialisation) {
    if(initialisation.values) {
      for(let { key, value } of initialisation.values)
        this.values.set(key, value)
    }
    if(initialisation.providers) {
      for(let { key, provider } of initialisation.providers)
        this.providers.set(key, provider)
    }
    if(initialisation.instances) {
      for(let { key, instance } of initialisation.instances)
        this.instances.set(key, instance)
    }
    if(initialisation.references) {
      for(let { key, useClass } of initialisation.references)
        this.references.set(key, useClass)
    }
  }
}
