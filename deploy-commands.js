require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { REST, Routes } = require('discord.js');
const logger = require('./util/logger')(module);

run();

function run() {
    //Retrieve commands for deployment in json format.
    logger.info("Retrieving commands for deployment...");
    const commands = []
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath);
    commandFiles.forEach(fileName => {
        const commandPath = path.join(commandsPath, fileName);
        const command = require(commandPath);
        commands.push(command.data.toJSON());
    });

    //Deploy commands
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
        .then(data => { logger.info(`Succesfully registered ${data.length} commands!`) })
        .catch((err) => logger.error(err));
}

module.exports = { run };
