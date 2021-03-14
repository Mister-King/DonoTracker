import fs from 'fs';
const Settings = JSON.parse(fs.readFileSync('config.json', 'utf8'));

export const deleteMessages = client => {
    console.log('Deleting all DonoTracker messages...');
    const channel = client.channels.cache.get(Settings.channel);

    channel.messages.fetch()
        .then(messages => {
            const botMessages = [];
            messages.filter(m => m.author.id === client.user.id).forEach(msg => botMessages.push(msg))
            channel.bulkDelete(botMessages)
                .then(() => console.log('Done deleting!'))
                .catch(error => console.log('Something went wrong:\n', error));
        })
        .catch(error => console.log('Something went wrong:\n', error));
}

export const editMessage = (client, message) => {
    console.log('Editing DonoTracker message...');
    const channel = client.channels.cache.get(Settings.channel);
    
    channel.messages.fetch()
    .then(messages => {
        messages.find(m => m.author.id === client.user.id).edit(message)
            .then(() => console.log('Done editing!'))
            .catch(error => console.log('Something went wrong:\n', error));
    })
    .catch(error => console.log('Something went wrong:\n', error));
}

export const sendMessage = (client, message) => {
    console.log('Sending new DonoTracker message...');
    const channel = client.channels.cache.get(Settings.channel);
    channel.send(message)
        .then(() => console.log('Done sending!'))
        .catch(error => console.log('Something went wrong:\n', error));
}
