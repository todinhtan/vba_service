require('dotenv').config({ path: './.env' });

export default {
  env: process.env.NODE_ENV || 'development',
  database: {
    uri: process.env.MONGO_CONNECTION_STRING,
  },
  server: {
    port: process.env.APP_PORT,
  },
  graylog: {
    host: process.env.GRAYLOG_HOST || '52.221.204.21',
    gelfPort: process.env.GRAYLOG_GELF_PORT || 12201,
  },
  api: {
    epiapi_prefix: process.env.EPIAPI_PREFIX || 'https://go-test.epiapi.com/v2',
  },
};
