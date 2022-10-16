const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require("../util/logger")(module);
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('openlist')
        .setDescription('Show personal anime or manga list')
        .addSubcommand(subcommand => subcommand
            .setName('anime')
            .setDescription('Show your anime list')
            .addStringOption(option => option
                .setName("status")
                .setDescription("Show only specific categories")
                .addChoices(
                    { name: 'ongoing', value: 'ongoing' },
                    { name: 'completed', value: 'completed' },
                    { name: 'planned', value: 'planned' },
                    { name: 'dropped', value: 'dropped' },
                )))
        .addSubcommand(subcommand => subcommand
            .setName('manga')
            .setDescription('Show your manga list')
            .addStringOption(option => option
                .setName("status")
                .setDescription("Show only specific categories")
                .addChoices(
                    { name: 'ongoing', value: 'ongoing' },
                    { name: 'completed', value: 'completed' },
                    { name: 'planned', value: 'planned' },
                    { name: 'dropped', value: 'dropped' },
                ))),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            logger.info("Resolving interaction variables...");
            const subcommand = interaction.options._subcommand;
            const hoistedOptions = interaction.options._hoistedOptions;
            const { id, discriminator, avatar, username } = interaction.user;
            const status = hoistedOptions.find(obj => obj.name === 'status')?.value || 'all';

            logger.info("Performing database transactions...");
            const docRef = interaction.client.db.collection('profile').doc(id);
            const profileDoc = await docRef.get();
            if (!profileDoc.exists) {
                await interaction.editReply('You have not created a profile yet. Please run the **/profile** command to create one.');
            } else {
                logger.info("Creating embed...");
                const profileData = profileDoc.data(); //HOLY FUCK THIS MAKES IT SO MUCH EASIER
                const items = profileData[subcommand + "s"] || []; //The 's' is so fucking stupid
                const pageSize = 10;
                const lastPageNum = Math.floor(items.length / pageSize) + 1;
                let page = 1;

                function createDescription() {
                    let description = "";
                    items.slice(pageSize * (page - 1), pageSize * page).forEach((anime, i) => {
                        description += `**${i}**. [*${anime.userStatus}*] - ${anime.title} `;
                    });
                    return description;
                }

                const listEmbed = new EmbedBuilder()
                    .setTitle(`${subcommand === 'anime' ? 'Anime' : 'Manga'} list`)
                    .addFields(
                        { name: 'Total entries', value: items.length.toString(), inline: true })
                    .setDescription(createDescription() || "List is empty. Try adding some items to your list")
                    .setFooter({ text: `Page ${page}/${lastPageNum}` });


                logger.info("Sending embed...");
                await interaction.deleteReply().then(async () => {
                    const message = await interaction.channel.send({ embeds: [listEmbed] });

                    await message.react('⬅️');
                    await message.react('➡️');

                    logger.info("Preparing reactions and collector for embed...");
                    const filter = (reaction, user) => {
                        return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id !== process.env.CLIENT_ID;
                    };
                    const collector = message.createReactionCollector({ filter, time: ms('5m'), idle: ms('1m'), dispose: true });

                    function updateEmbed(reaction, user) {
                        logger.info(`${reaction.emoji.name} pressed by ${user.tag}`);
                        if (reaction.emoji.name === '➡️' && page < lastPageNum) {
                            page += 1;
                        } else if (reaction.emoji.name === '⬅️' && page > 1) {
                            page -= 1;
                        }

                        logger.info("Editing embed...");
                        searchEmbed
                            .setDescription(createDescription() || "List is empty. Try adding some items to your list")
                            .setFooter({ text: `Page ${page}/${lastPageNum}` });
                        message.edit({ embeds: [searchEmbed] });
                    }

                    collector.on('collect', (reaction, user) => {
                        updateEmbed(reaction, user);
                    });

                    collector.on('remove', (reaction, user) => {
                        updateEmbed(reaction, user);
                    });

                    collector.on('end', () => {
                        logger.info(`Embed collection period finished.`);
                    });
                })
            }
        } catch (error) {
            logger.error(error);
            console.log(error);
            throw error;
        }

    }
}