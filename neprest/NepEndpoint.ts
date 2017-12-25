export interface NepEndpointConfig {
  method: string;
  path?: string;
  queryParams?: string[];
  params?: string[];
  custom?: boolean;
}

export function NepEndpoint(config: NepEndpointConfig) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const originalMethod = descriptor.value;
    descriptor.value = Object.assign({}, config, {
      _isNepEndpoint: true,
      func: originalMethod,
    });
    return descriptor;
  };
}