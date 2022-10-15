const logger = require("../util/logger")(module);

module.exports = {
    name: 'ready',
    once: 'true',
    execute(client) {
        logger.info(`Discord bot logged in as ${client.user.tag}`);
    },
};