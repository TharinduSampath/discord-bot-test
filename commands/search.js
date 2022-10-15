const axios = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require('../util/logger')(module);
const ms = require('ms');

function fetchData(url, page, search) {
    return axios.get(url, {
        params: {
            page,
            limit: 10,
            q: search,
            order_by: 'popularity',
            min_score: 0.0
        }
    });
}

function createDescription(data) {
    let description = "";
    data.data.forEach((item) => {
        const { title, popularity, type, score } = item;
        description += `**${popularity}** [*${score}*] - ${type} : ${title}  \n`;
    });
    return description;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search for an anime or a manga")
        .addSubcommand(subcommand =>
            subcommand
                .setName('anime')
                .setDescription('Search for anime')
                .addStringOption(option =>
                    option
                        .setRequired(true)
                        .setName('search')
                        .setDescription("Anime to search for")))
        .addSubcommand(subcommand =>
            subcommand
                .setName('manga')
                .setDescription('Search for manga')
                .addStringOption(option =>
                    option
                        .setRequired(true)
                        .setName('search')
                        .setDescription("Manga to search for"))),
    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options._subcommand;
        const search = interaction.options._hoistedOptions[0].value;

        logger.info("Creating and sending axios get request... ");
        const url = `https://api.jikan.moe/v4/${subcommand === 'anime' ? 'anime' : 'manga'}`;
        fetchData(url, 1, search)
            .then(async ({ data }) => {
                logger.info("Creating embed...");
                const { current_page, last_visible_page, items } = data.pagination;
                const searchEmbed = new EmbedBuilder()
                    .setTitle(`${subcommand === 'anime' ? 'Anime' : 'Manga'} search results for '${search}'`)
                    .addFields(
                        { name: 'Total results', value: items.total.toString(), inline: true })
                    .setDescription(createDescription(data))
                    .setFooter({ text: `Page 1/${last_visible_page}` });

                logger.info("Sending embed...");
                await interaction.deleteReply().then(async () => {
                    const message = await interaction.channel.send({ embeds: [searchEmbed] });

                    await message.react('⬅️');
                    await message.react('➡️');

                    logger.info("Preparing reactions and collector for embed...");
                    const filter = (reaction, user) => {
                        return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id !== process.env.CLIENT_ID;
                    };
                    const collector = message.createReactionCollector({ filter, time: ms('5m'), idle: ms('1m'), dispose: true });

                    let page = 1;
                    function updateEmbed(reaction, user) {
                        logger.info(`${reaction.emoji.name} pressed by ${user.tag}`);
                        if (reaction.emoji.name === '➡️' && page < last_visible_page) {
                            page += 1;
                        } else if (reaction.emoji.name === '⬅️' && page > 1) {
                            page -= 1;
                        }

                        logger.info("Fetching relevant page...");
                        fetchData(url, page, search)
                            .then(({ data }) => {
                                searchEmbed
                                    .setDescription(createDescription(data))
                                    .setFooter({ text: `Page ${page}/${last_visible_page}` });
                                message.edit({ embeds: [searchEmbed] });
                            })
                    }

                    collector.on('collect', (reaction, user) => {
                        updateEmbed(reaction, user);
                    });

                    collector.on('remove', (reaction, user) => {
                        updateEmbed(reaction, user);
                    });

                    collector.on('end', collected => {
                        logger.info(`Collected ${collected.size} items`);
                    });
                });
            }).catch(async (error) => {
                logger.error("An error occured");
                await interaction.deleteReply();
                throw error;
            });
    }
};