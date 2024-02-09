/**
 * Client ready for use
 */
import { Events } from 'discord.js';
import { init } from '../functions/index.js';

export const ready = {
	name: Events.ClientReady,
	once: true,
	execute: (client) => {
		console.log('---- Ready ----');
		console.log(`${new Date().toLocaleString()}: Logged in as ${client.user.tag}`);
		init(client);
	},
};
