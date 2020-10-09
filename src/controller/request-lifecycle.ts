export type ModuleHook = 'onRequest' | 'preParsing' | 'preValidation'
  | 'preHandler' | 'handler' | 'preSerialization'
  | 'onSend' | 'onResponse' | 'onError' | 'onTimeout'
export type ControllerHook = ModuleHook | 'handler'

export interface OnRequest {
  onRequest(...args: any[]): Promise<any>
}
export interface OnRequest {
  preParsingHookHandler(...args: any[]): Promise<any>
}
export interface PreValidationHookHandler {
  preValidationHookHandler(...args: any[]): Promise<any>
}
export interface PreHandlerHookHandler {
  preHandlerHookHandler(...args: any[]): Promise<any>
}
export interface RequestHandler {
  handler(...args: any[]): Promise<void>
}
export interface PreSerializationHookHandler<Payload> {
  preSerializationHookHandler(payload:Payload, ...args: any[]): Promise<any>
}
export interface OnSendHookHandler<Payload> {
  onSendHookHandler(payload:Payload, ...args: any[]): Promise<any>
}
export interface OnResponseHookHandler {
  onResponseHookHandler(...args: any[]): Promise<any>
}
export interface OnTimeoutHookHandler {
  onTimeoutHookHandler(...args: any[]): Promise<any>
}
export interface OnErrorHookHandler {
  onErrorHookHandler(error: Error, ...args: any[]): Promise<any>
}
