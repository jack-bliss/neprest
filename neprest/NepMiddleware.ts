export interface NepMiddlewareConfig {
  path?: string;
}

export function NepMiddleware(config: NepMiddlewareConfig) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const originalMethod = descriptor.value;
    descriptor.value = Object.assign({}, config, {
      _isNepMiddleware: true,
      func: originalMethod,
    });
    return descriptor;
  }
}