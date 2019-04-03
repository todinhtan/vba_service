import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import basicAuth from 'express-basic-auth';
import morgan from 'morgan';
// import fs from 'fs';
// import path from 'path';

import config from './config';
import logger from './utils/logger';

require('./utils/db');
const healthcheck = require('express-healthcheck');

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
morgan.token('reqBody', (req, res) => JSON.stringify(req.body));

const api = express();

api.use('*', cors())
  .use(compression())
  .use(morgan(':date[iso] - :method :url :status :reqBody - :response-time ms'))
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use('/v2/health', healthcheck());
// api.use(basicAuth({
//   users: { admin: '123456@stg' },
// }));
require('./routes/vba')(api);

api.listen(config.server.port, (err) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }

  logger.info(
    `API is now running on port ${config.server.port} in ${config.env} mode`,
  );
});

export default api;
