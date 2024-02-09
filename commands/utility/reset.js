/**
 * Reset the bot messages
 */
import { SlashCommandBuilder } from 'discord.js';
import { init, interval } from '../../functions/index.js';

export const reset = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset DonoTracker\'s messages'),
	execute: async (interaction) => {
		console.log(`${new Date().toLocaleString()}: Received reset request.`);
		clearInterval(interval);
		await interaction.reply({ content: 'Resetting…', ephemeral: true });
		init(interaction.client);

		setTimeout(async () => {
			await interaction.deleteReply();
			console.log(`${new Date().toLocaleString()}: Reset done.`);
		}, 1000);
	},
};
