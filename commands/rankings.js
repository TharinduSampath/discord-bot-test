const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rankings")
        .setDescription("Show bot rankings")
        .addStringOption(option => option
            .setRequired(true)
            .setName("type")
            .setDescription("Ranking type to get")
            .addChoices(
                { name: 'anime', value: 'anime' },
                { name: 'manga', value: 'manga' },
                { name: 'both', value: 'both' },
            )),
    async execute(interaction) {
        const pendingDefer = Promise.all([interaction.deferReply()]);

        logger.info("Doing database transactions...");
        const type = hoistedOptions.find(obj => obj.name === 'type')?.value || 'both';
        const collectionRef = interaction.client.db.collection("profile").orderBy(type); //Holds reference

        await pendingDefer();
    }
}