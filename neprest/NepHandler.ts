export interface NepHandlerConfig {
  table: string;
  schema: any;
  alias?: string;
  pool?: any;
}

export function NepHandler(config: NepHandlerConfig) {
  return (ctor: any) => {
    ctor.table = config.table;
    ctor.hasAlias = typeof config.alias !== 'undefined';
    ctor.alias = config.alias;
    ctor.hasPool = typeof config.pool !== 'undefined';
    ctor.pool = config.pool;
    ctor.schema = config.schema;
  }
}
