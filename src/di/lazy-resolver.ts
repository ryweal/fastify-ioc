import { Class, Injector } from './injector'

export class LazyResolver<T> {
  private resolved = false;
  private instance: T | undefined;

  constructor(
    private injector: Injector,
    private target: Class<T>
  ) {
  }

  get(): T {
    if(!this.resolved) {
      this.instance = this.injector.resolveClass<T>(this.target)
      this.resolved = true
      return this.instance
    } else {
      return this.instance as T
    }
  }
}
