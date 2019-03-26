import log4js from 'log4js';

log4js.configure({
  appenders: { app: { type: 'file', filename: 'app.log' } },
  categories: { default: { appenders: ['app'], level: 'error' } },
});

export default log4js.getLogger('app');
