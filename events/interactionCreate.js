const logger = require("../util/logger")(module);

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        logger.info(`${interaction.user.username} triggered an interaction in channel #${interaction.channel.name} of ${interaction.guild.name}.`);
        if (!interaction.isChatInputCommand()) { return; }
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) { return; }

        try {
            logger.info(`Executing command '/${interaction.commandName}'...`);
            await command.execute(interaction);
        } catch (error) {
            logger.error(error);
            await interaction.reply({ content: "There was an error while executing this command", ephemeral: true });
        }
    },
};