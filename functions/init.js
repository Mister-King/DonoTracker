/**
 * Initialise donation monitoring
 */
import { progressBar } from '../vendor/ProgressBar.js';
import { EmbedBuilder } from 'discord.js';
import { deleteMessages, editMessage, getTransactions, sendMessage } from '../utils/index.js';
import Settings from '../config.json' with { type: 'json' };

const costsText = Settings.costs.toString().split('.')[1] ? Settings.costs.toFixed(2) : Settings.costs;

/* -------------------
 * Internal functions
 --------------------*/
const buildEmbed = () => new Promise((resolve, reject) => {
	const amounts = [];

	getTransactions()
		.then(transactions => {
			transactions.forEach(transaction => {
				const transactionInfo = transaction.transaction_info;
				const transactionValue = transactionInfo.transaction_amount.value;
				let netAmount = transactionValue > 0 ? parseFloat(transactionValue) : 0;

				if (transactionInfo.fee_amount) {
					// PayPal prefixes fee value with '-'
					netAmount = netAmount - (transactionInfo.fee_amount.value * -1);
				}

				amounts.push(netAmount);
			});

			const amount = amounts.reduce((a, b) => a + b, 0);
			let percentage = ((amount / Settings.costs) * 100).toFixed(3);

			if (percentage > 100) {
				percentage = 100;
			}

			const embed = new EmbedBuilder()
				.setColor(Settings.color)
				.setTitle('CLICK HERE to donate with PayPal')
				.setURL(Settings.paypalURL)
				.setDescription(Settings.description + '\n\u200B')
				.setThumbnail('https://github.com/Mister-King/DonoTracker/raw/master/images/icon.png')
				.addFields(
					{ name: 'Running Costs', value: `**£${costsText}** per month\n\u200B` },
					{ name: ':moneybag: Donations This Month', value: progressBar(percentage, 100, 16) },
				)
				.setTimestamp()
				.setFooter({ text: 'DonoTracker • Donations take around 3 hours to update', iconURL: 'https://github.com/Mister-King/DonoTracker/raw/master/images/icon.png' });

			resolve(embed);
		})
		.catch(error => {
			console.log(error);
			reject(error);
		});
});

/* -------------------
 * Exported functions
 --------------------*/
export let interval;

/**
 * Clear previous DonoTracker messages, create a new one,
 * and set up 15 minute interval to update the message
 */
export const init = (client) => {
	if (interval) {
		clearInterval(interval);
	}

	const handleSend = isNew => {
		const communicate = isNew ? sendMessage : editMessage;

		if (isNew) { deleteMessages(client); }
		buildEmbed()
			.then(embed => communicate(client, embed))
			.catch(error => console.log(error));
	};

	const isNew = true;
	handleSend(isNew);

	interval = setInterval(() => {
		handleSend();
	}, 60000 * 15);
};