import fs from 'fs';
const Settings = JSON.parse(fs.readFileSync('config.json', 'utf8'));

export const deleteMessages = client => {
    const channel = client.channels.cache.get(Settings.channel);

    channel.messages.fetch()
        .then(messages => {
            const botMessages = [];
            messages.filter(m => m.author.id === client.user.id).forEach(msg => botMessages.push(msg))
            channel.bulkDelete(botMessages)
                .then(() => console.log(`${new Date().toLocaleString()}: Deleted DonoTracker messages`))
                .catch(error => console.log(`${new Date().toLocaleString()}: Delete - Something went wrong:\n`, error));
        })
        .catch(error => console.log(`${new Date().toLocaleString()}: Delete (fetch) - Something went wrong:\n`, error));
}

export const editMessage = (client, message) => {
    const channel = client.channels.cache.get(Settings.channel);
    
    channel.messages.fetch()
    .then(messages => {
        messages.find(m => m.author.id === client.user.id).edit(message)
            .then(() => console.log(`${new Date().toLocaleString()}: Updated message embed`))
            .catch(error => console.log(`${new Date().toLocaleString()}: Update - Something went wrong:\n`, error));
    })
    .catch(error => console.log(`${new Date().toLocaleString()}: Update (fetch) - Something went wrong:\n`, error));
}

export const sendMessage = (client, message) => {
    const channel = client.channels.cache.get(Settings.channel);
    channel.send(message)
        .then(() => console.log(`${new Date().toLocaleString()}: Sent new message embed`))
        .catch(error => console.log(`${new Date().toLocaleString()}: Something went wrong:\n`, error));
}
