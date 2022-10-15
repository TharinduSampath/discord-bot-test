require('dotenv').config();
const { REST, Routes } = require('discord.js');
const prompt = require('prompt-sync')({ sigint: true });

const rest = new REST({ version: 10 }).setToken(process.env.TOKEN);
main();

//A main function
function main() {
    console.log("Welcome to the delete command tool.");
    console.log("1. Delete specific command");
    console.log("2. Delete all commands");
    let input = prompt("Please enter the number of the function to run : ");

    try {
        input = Number(input);
        switch (input) {
            case 1:
                deleteCommandById();
                break;
            case 2:
                deleteAllCommands();
                break;
        }

    } catch (err) {
        console.log("Invalid input!", err);
        return;
    }

    return;
}


//Delete specific Id
function deleteCommandById() {
    const commandId = prompt("Please enter the id of the command to be deleted : ");
    console.log("Deleting command...");
    rest.delete(Routes.applicationCommands(process.env.CLIENT_ID, commandId))
        .then(data => { console.log("Command succesfully deleted. ", data); })
        .catch(console.error);
}

//Delete all
function deleteAllCommands() {
    console.log("Deleting all commands...");
    rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
        .then(data => { console.log("All commands succesfully deleted.", data); })
        .catch(console.error);
}















