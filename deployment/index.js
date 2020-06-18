require('dotenv').config({ path: __dirname + '/.env' });
const deploy = require('./deploy');

(async () => {
    await deploy();
})();