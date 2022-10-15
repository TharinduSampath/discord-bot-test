const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Replies with server info."),
    async execute(interaction) {
        await interaction.reply(`Server ID : ${interaction.guild} \nTotal Members : ${interaction.guild.memberCount} \nCreated At :  ${interaction.guild.createdAt} \nVerification Level : ${interaction.guild.verificationLevel} \n`);
    }
};