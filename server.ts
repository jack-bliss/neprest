import * as url from 'url';
import { Pool } from 'pg';
import * as express from 'express';
import * as bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const pg_params = url.parse(process.env.DATABASE_URL);
const pg_auth = pg_params.auth.split(":");

const pool = Pool({
  host: pg_params.hostname,
  port: pg_params.port,
  user: pg_auth[0],
  database: pg_params.pathname.split('/')[1],
  password: pg_auth[1],
  ssl: true
});

import { NepModule } from './neprest/NepModule';
import { handlers } from './handlers/handlers';

@NepModule({
  handlers,
  app,
  pool
})
class SmashModule { }

const port = process.env.PORT || 4040;
app.listen(port, () => console.log('Listening on port', port));
