const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require('../util/logger')(module);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Show user profile'),
    async execute(interaction) {
        const pendingDefer = Promise.all([interaction.deferReply()]);

        logger.info("Doing database transactions...");
        const { id, discriminator, avatar, username } = interaction.user;
        const docRef = interaction.client.db.collection("profile").doc(id); //Holds reference
        await docRef.update({ id, username, avatar, discriminator }); //Update user profile just in case.
        const profileDoc = await docRef.get();
        const { animeCount, mangaCount, bothCount, bothRank, animeRank, mangaRank } = profileDoc.data();

        logger.info("Creating embed...");
        const profileEmbed = new EmbedBuilder()
            .setColor(0xC6F91F)
            .setTitle(username)
            .setDescription("Ïm quirky and shit.")
            .setThumbnail(`https://cdn.discordapp.com/avatars/${id}/${avatar}.png`)
            .addFields(
                { name: 'Rank', value: `#${bothRank?.toString() || 'Unranked'}`, inline: true },
                { name: 'Man-Rank', value: `#${mangaRank?.toString() || 'Unranked'}`, inline: true },
                { name: 'Ani-Rank', value: `#${animeRank?.toString() || 'Unranked'}`, inline: true },
                { name: 'Both', value: bothCount?.toString() || '0', inline: true },
                { name: 'Manga', value: mangaCount?.toString() || '0', inline: true },
                { name: 'Anime', value: animeCount?.toString() || '0', inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `#${discriminator}` });

        await pendingDefer;
        logger.info("Sending embed...");
        await interaction.deleteReply().then(() => {
            interaction.channel.send({ embeds: [profileEmbed] });
        });
    }
}