export type ModuleHook = 'onRequest' | 'preParsing' | 'preValidation'
  | 'preHandler' | 'handler' | 'preSerialization'
  | 'onSend' | 'onResponse' | 'onError' | 'onTimeout'
export type ControllerHook = ModuleHook | 'handler'

export interface OnRequest {
  onRequest(...args: any[]): Promise<any>
}
export interface OnRequest {
  preParsing(...args: any[]): Promise<any>
}
export interface PreValidation {
  preValidation(...args: any[]): Promise<any>
}
export interface PreHandler {
  preHandler(...args: any[]): Promise<any>
}
export interface RequestHandler {
  handler(...args: any[]): Promise<void>
}
export interface PreSerialization<Payload> {
  preSerialization(payload:Payload, ...args: any[]): Promise<any>
}
export interface OnSend<Payload> {
  onSend(payload:Payload, ...args: any[]): Promise<any>
}
export interface OnResponse {
  onResponse(...args: any[]): Promise<any>
}
export interface OnTimeout {
  onTimeout(...args: any[]): Promise<any>
}
export interface OnError {
  onError(error: Error, ...args: any[]): Promise<any>
}
