//dependencies
const nconf = require("nconf");
const path = require("path");

class LoadConfig {
    constructor() {
        const environment = process.env.NODE_ENV || nconf.get('environment') || "dev";
        nconf.use('file', {file: path.join(__dirname, './env/' + environment + '.json')});
    }
}

module.exports = new LoadConfig();