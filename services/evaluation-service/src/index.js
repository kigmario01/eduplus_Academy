const config = require('./config');
const app = require('./app');

app.listen(config.port, () => {
  console.log(`evaluation-service listening on port ${config.port}`);
});