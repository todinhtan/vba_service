import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';

import config from './config';
import logger from './utils/logger';

require('./utils/db');
const healthcheck = require('express-healthcheck');

const api = express();

api.use('*', cors());
api.use(compression());
api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());
api.use('/v2/health', healthcheck());
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
