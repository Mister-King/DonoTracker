/**
 * Register and update slash commands
 * Only run this when necessary
 */
import { REST, Routes } from 'discord.js';
import * as Commands from './commands/index.js';
import Settings from './config.json' with { type: 'json' };

const commands = [];

// Get our exported commands
for (const [commandName, command] of Object.entries(Commands)) {
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	}
	else {
		console.log(`[WARNING] The command "${commandName}" is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(Settings.botToken);

// Deploy commands
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(Settings.clientId, Settings.guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		console.error(error);
	}
})();