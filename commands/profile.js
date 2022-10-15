const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require('../util/logger')(module);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Show user profile'),
    async execute(interaction) {
        await interaction.deferReply(); //Because this will take some time.

        logger.info("Doing database transactions...");
        const { id, discriminator, avatar, username } = interaction.user;
        const docRef = interaction.client.db.collection("profile").doc(id); //Holds reference
        await docRef.set({ id, username, avatar, discriminator }, { merge: true }); //Update user profile just in case.

        logger.info("Creating embed...");
        const profileEmbed = new EmbedBuilder()
            .setColor(0xC6F91F)
            .setTitle(username)
            .setDescription("Ïm quirky and shit.")
            .setThumbnail(`https://cdn.discordapp.com/avatars/${id}/${avatar}.png`)
            .addFields(
                { name: 'Rank', value: '12', inline: true },
                { name: 'Manga Read', value: '69', inline: true },
                { name: 'Anime Watched', value: '420', inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `#${discriminator}` });

        logger.info("Sending embed...");
        await interaction.deleteReply().then(() => {
            interaction.channel.send({ embeds: [profileEmbed] });
        });
    }
}