export interface NepHandlerConfig {
  table: string;
  alias?: string;
  schema: any;
}

export function NepHandler(config: NepHandlerConfig) {
  return (ctor: any) => {
    ctor.table = config.table;
    ctor.hasAlias = typeof config.alias !== 'undefined';
    ctor.alias = config.alias;
  }
}
