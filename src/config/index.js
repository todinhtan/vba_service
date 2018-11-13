require('dotenv').config({ path: './.env' });

export default {
  env: process.env.NODE_ENV || 'development',
  database: {
    uri: process.env.MONGO_CONNECTION_STRING,
  },
  server: {
    port: process.env.APP_PORT,
  },
};
