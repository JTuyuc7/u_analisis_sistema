const serverlessExpress = require('@vendia/serverless-express');
const app = require('../src/app').default;

exports.handler = serverlessExpress({ app });
