require('dotenv').config({ path: __dirname + '/.env' });
const deploy = require('./deploy-remote');

(async () => {
    await deploy();
})();