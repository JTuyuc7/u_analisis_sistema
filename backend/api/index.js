const app = require('../src/app').default;

// Export a request handler function
module.exports = async (req, res) => {
  return app(req, res);
};
