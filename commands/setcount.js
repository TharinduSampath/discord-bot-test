const { SlashCommandBuilder } = require("discord.js");
const logger = require("../util/logger")(module);
const { FieldValue } = require('firebase-admin/firestore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setcount")
        .setDescription("Set your anime or manga completed count")
        .addSubcommand(subcommand => subcommand
            .setName("anime")
            .setDescription("Set your anime completed count")
            .addNumberOption(option => option
                .setRequired(true)
                .setName("number")
                .setDescription("Number to set")))
        .addSubcommand(subcommand => subcommand
            .setName("manga")
            .setDescription("Set your manga completed count")
            .addNumberOption(option => option
                .setRequired(true)
                .setName("number")
                .setDescription("Number to set"))),
    async execute(interaction) {
        const pendingDefer = Promise.all([interaction.deferReply()]); //Start to defer.

        logger.info("Resolving interaction variables...");
        const subcommand = interaction.options._subcommand;
        const hoistedOptions = interaction.options._hoistedOptions;
        const { id, discriminator, avatar, username } = interaction.user;
        const newNumber = hoistedOptions.find(obj => obj.name === 'number')?.value || '-1';

        await pendingDefer; //Wait to finish here, after running some synchronous funcs

        if (newNumber < 0) {
            logger.error("Invalid value for number option.");
            interaction.editReply('Invalid value for number option. Please try again.');
            return;
        }

        logger.info("Getting from database...");
        const docRef = interaction.client.db.collection('profile').doc(id);
        const profileDoc = await docRef.get();
        if (!profileDoc.exists) {
            interaction.editReply('You have not created a profile yet. Please run the **/profile** command to create one.');
            return;
        } else {
            logger.info("Updating profile...");
            const profileData = profileDoc.data();
            const { animeCount, mangaCount } = profileData;
            const oldNumber = profileData[subcommand === 'anime' ? 'animeCount' : 'mangaCount'];
            if (subcommand === 'anime') { docRef.update({ animeCount: newNumber, bothCount: mangaCount + newNumber }); }
            else { docRef.update({ mangaCount: newNumber, bothCount: newNumber + animeCount }); }
            interaction.editReply(`Succesfully set <@${id}>'s ${subcommand} count from ${oldNumber || 0} to ${newNumber}`);
        }
    }
}