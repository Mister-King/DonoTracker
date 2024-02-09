/**
 * Main bot functionality
 */
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import * as Events from './events/index.js';
import * as Commands from './commands/index.js';
import Settings from './config.json' with { type: 'json' };

// discord.js setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

/* ---------
 * Commands
 ----------*/
for (const [commandName, command] of Object.entries(Commands)) {
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command "${commandName}" is missing a required "data" or "execute" property.`);
	}
}

/* -------
 * Events
 --------*/
for (const event of Object.values(Events)) {
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


/* -------------
 * Client Login
 --------------*/
client.login(Settings.botToken);
