const logger = require('log4js').getLogger();
const path = require('path');
logger.level = "info";

module.exports = function (module) {
    return {
        info: function (msg) {
            logger.info('(' + path.basename(module.filename) + ') : ' + msg);
        },
        error: function (msg) {
            logger.error('(' + path.basename(module.filename) + ') : ' + msg);
        }
    }
};