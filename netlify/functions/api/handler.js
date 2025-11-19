const serverless = require('serverless-http');
const app = require('../../../src/server/index.js');

module.exports.handler = serverless(app);
