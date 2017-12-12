export interface NepMethodConfig {
  method: string;
  path?: string;
  queryParams?: string[];
  params?: string[];
  custom?: boolean;
}

export function NepMethod(config: NepMethodConfig) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = Object.assign({}, config, {
      _isNepMethod: true,
      func: originalMethod,
    });
    return descriptor;
  };
}