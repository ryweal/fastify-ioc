import { Injector } from './injector'

export type Provider<T> = (container: Injector, ...args:any[]) => T
export interface ProviderParameters {
  key: string | symbol,
  args: any[]
}
export const DEFAULT_PROVIDERS: Array<{ key: symbol, provider: Provider<any> }> = []
