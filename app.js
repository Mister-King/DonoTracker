const { Client } = require('discord.js');
const Settings = require('./config.json');

const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", function(message) { 
    if (message.author.bot) return;
    if (!message.content.startsWith(Settings.prefix)) return;

    const commandBody = message.content.slice(Settings.prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        console.log('Ping was received');
    }
}); 

client.login(Settings.botToken);
