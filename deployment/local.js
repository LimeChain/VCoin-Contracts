require('dotenv').config({ path: __dirname + '/.env' });
const deploy = require('./deploy-local');

(async () => {
    await deploy();
})();