import { NepRouterService } from './NepRouterService';

export interface NepModuleConfig {
  app: any;
  pool: any;
  handlers: any[];
  path?: string;
}

export function NepModule(config: NepModuleConfig) {
  console.log('building nep module, # of handlers', config.handlers.length);
  return (ctor: any) => {
    const routes = {};
    config.handlers.forEach(handler => {
      for (const process in handler.prototype) {
        if (handler.prototype.hasOwnProperty(process) && handler.prototype[process]._isNepMethod) {
          const mtd = handler.prototype[process];
          const path = '/' + (handler.hasAlias ? handler.alias : handler.table) +
            (mtd.path ? mtd.path : '');
          if (!routes.hasOwnProperty(mtd.method)) {
            routes[mtd.method] = {};
          }
          routes[mtd.method][handler.name + '_' + process] = {
            path: path,
            params: Array.isArray(mtd.params) ? mtd.params : [],
            controller: (req, res, next) => {
              let request;
              let query;
              if (mtd.method === 'get') {
                request = mtd.func(req.params, req.query);
                query = 'SELECT ' + request.select.join(', ') + ' FROM ' + handler.table;
                if (request.where && request.where.length) {
                  query += ' WHERE ' + request.where;
                }
                if (request.orderBy && request.orderBy.length) {
                  let ordering = request.orderBy.replace('-', '');
                  query += ' ORDER BY ' + ordering;
                  if (request.orderBy[0] === '-') {
                    query += ' DESC';
                  } else {
                    query += ' ASC';
                  }
                }
              } else if (mtd.method === 'post') {
                request = mtd.func(req.params, req.body);
                query = 'INSERT INTO ' +
                        handler.table +
                        ' (' + Object.keys(request.insert).join(', ') +
                        ') VALUES (' + Object.keys(request.insert)
                    .map(key => request.insert[key])
                    .map(val => {
                      if (typeof val === 'string') {
                        return '\'' + val + '\'';
                      } else {
                        return val;
                      }
                    }).join(', ')
                    + ')';
                if (request.returning) {
                  query += ' RETURNING ' + request.returning;
                }
              } else if (mtd.method === 'delete') {
                request = mtd.func(req.params);
                query = 'DELETE FROM ' + handler.table + ' WHERE ' + request.where;
              } else if (mtd.method === 'put') {
                request = mtd.func(req.params, req.body);
              }
              console.log(query);
              config.pool.query(query).then(pool_response => {
                if (request.prep) {
                  res.json(request.prep(pool_response.rows));
                } else {
                  res.json(pool_response.rows);
                }
              }, err => {
                res.json(err);
              });
            },
          };
        }
      }
    });
    
    for (const middle in ctor.prototype) {
      if (ctor.prototype.hasOwnProperty(middle)) {
        config.app.use(config.path ? config.path : '', ctor.prototype[middle]);
      }
    }
    
    const ExpressRoutes = NepRouterService(routes);
    config.app.use(config.path ? config.path : '', ExpressRoutes);
    config.app.get('/neproutes', (req, res) => {
      res.json(routes);
    });
    console.log(routes);
  };
  
}