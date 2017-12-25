import { NepRouterService } from './NepRouterService';
import * as url from 'url';
import { Pool } from 'pg';

export interface NepModuleConfig {
  app: any;
  pool: any;
  handlers: any[];
  path?: string;
}

export function NepModule(config: NepModuleConfig) {
  
  const processPool = (url: string): any => {
    if (typeof url !== 'string') {
      return url;
    }
    
    const pg_params = url.parse(url);
    const pg_auth = pg_params.auth.split(":");
  
    return Pool({
      host: pg_params.hostname,
      port: pg_params.port,
      user: pg_auth[0],
      database: pg_params.pathname.split('/')[1],
      password: pg_auth[1],
      ssl: true
    });
  };
  
  return (ctor: any) => {
    const routes = {};
    config.handlers.forEach(handler => {
      for (const process in handler.prototype) {
        if (handler.prototype.hasOwnProperty(process)) {
          const mtd = handler.prototype[process];
          const path = '/' + (handler.hasAlias ? handler.alias : handler.table) + (mtd.path ? mtd.path : '');
          if (mtd._isNepEndpoint) {
            if (!routes.hasOwnProperty(mtd.method)) {
              routes[mtd.method] = {};
            }
            routes[mtd.method][handler.name + '_' + process] = {
              path: path,
              params: Array.isArray(mtd.params) ? mtd.params : [],
              controller: (req, res, next) => {
                let request;
                let query;
                if (mtd.custom) {
                  request = mtd.func(req.params, req.query, req.body);
                  query = request.query;
                } else if (mtd.method === 'get') {
                  request = mtd.func(req.params, req.query);
                  query = 'SELECT ' +
                    (request.select === '*' ? '*' : request.select.join(', ')) +
                    ' FROM ' + handler.table;
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
                    + ') RETURNING *';
                } else if (mtd.method === 'delete') {
                  request = mtd.func(req.params);
                  query = 'DELETE FROM ' + handler.table + ' WHERE ' + request.where;
                }
                
                let pool;
                
                if (handler.hasPool) {
                  pool = handler.pool;
                } else {
                  pool = config.pool;
                }
                
                pool = processPool(pool);
                
                pool.query(query).then(pool_response => {
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
          } else if (mtd._isNepMiddleware) {
            config.app.use(path, mtd.func);
          }
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
    config.app.get('/neproutes/' + config.path, (req, res) => {
      res.json(routes);
    });
    ctor.routes = routes;
    
  };
  
}