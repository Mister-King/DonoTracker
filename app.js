require('./vendor/ProgressBar')
const axios = require('axios');
const qs = require('qs');
const { Client, MessageEmbed } = require('discord.js');
const Settings = require('./config.json');

const client = new Client();
const apiURL = 'https://api-m.paypal.com';

const getToken = () => new Promise((resolve, reject) => {
    const config = {
        method: 'post',
        url: `${apiURL}/v1/oauth2/token`,
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
            username: Settings.PPClientID,
            password: Settings.PPSecret
        },
        data: qs.stringify({'grant_type': 'client_credentials'})
    };
    
    axios(config)
        .then(response => {
            resolve(response.data.access_token);
        })
        .catch(error => {
            console.log(error);
            reject(error);
        });
});

const getTransactions = () => new Promise((resolve, reject) => {
    getToken()
        .then(token => {
            const date = new Date();
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
            const config = {
                method: 'get',
                url: `${apiURL}/v1/reporting/transactions`,
                params: {
                    start_date: firstDay,
                    end_date: lastDay
                },
                headers: { 
                  'Accept': 'application/json', 
                  'Authorization': `Bearer ${token}`, 
                  'Content-Type': 'application/json'
                }
              };
        
              axios(config)
                .then(response => {
                    resolve(response.data.transaction_details);
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                });

        })
        .catch(error => {
            console.log(error);
            reject(error);
        });
});

const buildEmbed = () => new Promise((resolve, reject) => {
    const amounts = [];

    getTransactions()
        .then(transactions => {
            transactions.forEach(transaction => {
                amounts.push(transaction.transaction_info.transaction_amount.value);
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
                .setFooter('DonoTracker', 'https://github.com/Mister-King/DonoTracker/raw/master/images/icon.png');

            resolve(embed);
        })
        .catch(error => {
            console.log(error);
            reject(error);
        })
});

const deleteMessages = () => {
    console.log('Deleting all DonoTracker messages...');
    const channel = client.channels.cache.get(Settings.channel);

    channel.messages.fetch()
        .then(messages => {
            const botMessages = [];
            messages.filter(m => m.author.id === client.user.id).forEach(msg => botMessages.push(msg))
            channel.bulkDelete(botMessages)
                .then(() => console.log('Done deleting!'));
        });
}

const editMessage = message => {
    console.log('Editing DonoTracker message...');
    const channel = client.channels.cache.get(Settings.channel);
    
    channel.messages.fetch()
    .then(messages => {
        messages.find(m => m.author.id === client.user.id).edit(message)
            .then(() => console.log('Done editing!'));
    })
}

const sendMessage = message => {
    console.log('Sending new DonoTracker message...');
    const channel = client.channels.cache.get(Settings.channel);
    channel.send(message)
        .then(() => console.log('Done sending!'));
}


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    deleteMessages();
    buildEmbed()
        .then(embed => sendMessage(embed))
        .catch(error => {
            console.log(error);
        });

    setInterval(() => {
        buildEmbed()
            .then(embed => editMessage(embed))
            .catch(error => {
                console.log(error);
            });
    }, 60000);
});

// Instead of reacting to a message, react to webhooks from paypal.
client.on("message", function(message) { 
    if (message.author.bot) return;
    if (!message.content.startsWith(Settings.prefix)) return;

    const commandBody = message.content.slice(Settings.prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'reset') {
        buildEmbed()
            .then(embed => editMessage(embed))
            .catch(error => {
                console.log(error);
            });
    }
});

client.login(Settings.botToken);
