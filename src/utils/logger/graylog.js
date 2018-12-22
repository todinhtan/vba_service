/* eslint-disable new-cap */
/* eslint-disable no-console */
import graylog2 from 'graylog2';

import config from '../../config';

const logger = new graylog2.graylog({
  servers: [
    { host: config.graylog.host, port: config.graylog.gelfPort },
  ],
});

logger.on('error', (error) => {
  console.error('Error while trying to write to graylog2:', error);
});

export default logger;
