const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("Replies with user info."),
    async execute(interaction) {
        await interaction.reply(`User ID : ${interaction.user.id} \nUser Name : ${interaction.user.username} \nUser Tag : ${interaction.user.tag} \n`);
    }
};