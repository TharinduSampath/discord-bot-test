require('dotenv').config();
const { Collection, Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');
const logger = require('./util/logger')(module);

//Initialize client
logger.info("Initializing client...");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
    ]
});

//Intializing db connection
logger.info("Initializing database connection...");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

//Dynamically configure commands
logger.info("Configuring commands...");
client.commands = new Collection(); //Attach collection of commands to client.
client.db = db; //Attach database instance to client.
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(fileName => fileName.endsWith('.js'));
commandFiles.forEach(fileName => {
    const commandPath = path.join(commandsPath, fileName);
    const command = require(commandPath);
    client.commands.set(command.data.name, command);
});

//Dynamically congiure events
logger.info("Configuring events...");
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(fileName => fileName.endsWith('.js'));
eventFiles.forEach(fileName => {
    const eventPath = path.join(eventsPath, fileName);
    const event = require(eventPath);

    if (event.once === true) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
});

//Login to discord
logger.info("Logging in client...");
client.login(process.env.TOKEN);