import './vendor/ProgressBar.js';
import fs from 'fs';
import { Client, MessageEmbed } from 'discord.js';
import getTransactions from './utils/paypal.js';
import { deleteMessages, sendMessage, editMessage } from './utils/messages.js';

const Settings = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const client = new Client();

let interval;

const buildEmbed = () => new Promise((resolve, reject) => {
    const amounts = [];

    getTransactions()
        .then(transactions => {
            transactions.forEach(transaction => {
                const transactionInfo = transaction.transaction_info;
                const transactionValue = transactionInfo.transaction_amount.value;
                let netAmount = transactionValue > 0 ? parseFloat(transactionValue) : 0;

                if (transactionInfo.fee_amount) {
                    netAmount =  netAmount - (transactionInfo.fee_amount.value * -1) // Paypal prefixes fee value with '-'
                }

                amounts.push(netAmount);
            });

            const amount = amounts.reduce((a, b) => a + b, 0);
            let percentage = ((amount/Settings.costs) * 100).toFixed(3);

            if (percentage > 100) {
                percentage = 100;
            }

            const embed = new MessageEmbed()
                .setColor(Settings.color)
                .setTitle('CLICK HERE to donate with PayPal')
                .setURL(Settings.paypalURL)
                .setDescription(Settings.description)
                .setThumbnail('https://github.com/Mister-King/DonoTracker/raw/master/images/icon.png')
                .addFields(
                    { name: 'Running Costs', value: `**£${Settings.costs}** per month` },
                    { name: ':moneybag: Donations This Month', value: progressBar(percentage, 100, 16) },
                )
                .setTimestamp()
                .setFooter('DonoTracker | Donations take around 3 hours to update', 'https://github.com/Mister-King/DonoTracker/raw/master/images/icon.png');

            resolve(embed);
        })
        .catch(error => {
            console.log(error);
            reject(error);
        })
});

// Clear previous DonoTracker messages, create a new one,
// and set up 15 minute interval to update the message
const init = () => {
    const handleSend = isNew => {
        const communicate = isNew ? sendMessage : editMessage;
    
        if (isNew) { deleteMessages(client); }
        buildEmbed()
            .then(embed => communicate(client, embed))
            .catch(error => console.log(error));
    }

    const isNew = true;
    handleSend(isNew);

    interval = setInterval(() => {
        handleSend();
    }, 60000 * 15);
}

// Once connected to Discord
client.on('ready', () => {
    client.user.setStatus('invisible');
    console.log(`${new Date().toLocaleString()}: Logged in as ${client.user.tag}`);
    init();
});

// Reset app from a message
client.on("message", function(message) { 
    if (message.author.bot) return;
    if (!message.content.startsWith(Settings.prefix)) return;

    const commandBody = message.content.slice(Settings.prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'reset') {
        clearInterval(interval);
        init();
    }
});

client.login(Settings.botToken);
