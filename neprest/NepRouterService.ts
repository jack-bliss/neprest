import * as express from 'express';

export function NepRouterService(routes) {
  const router = express.Router();
  let url;
  let process;
  
  for (let method in routes) {
    if (routes.hasOwnProperty(method)) {
    
      for (let processName in routes[method]) {
        
        if (routes[method].hasOwnProperty(processName)) {
          process = routes[method][processName];
          url = process.path;
          if (process.params.length) {
            url += '/:' + process.params.join('/:');
          }
          console.log(method, url, processName);
          router[method](url, process.controller);
        }
        
      }
    
    }
  }
  
  return router;
  
}