const Levels = require("discord-xp");
const { MessageEmbed } = require('discord.js');
const { Client, Intents, Message, DiscordAPIError } = require('discord.js');




const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });



Levels.setURL("Use Your Own");



const config = require('./config.json')

var xp = config.xpamount;
const prefix = config.prefix;





client.on("messageCreate", async (message) =>{
    if (message.author.bot) return;
    if (message.content.length < 10) return;
    const user = await Levels.fetch(message.author.id, message.guild.id); // Selects the target from the database.
    if (user.level<10){
        give = xp-100
    } else{
        give = xp
    }
    const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, give);
    var role50 = message.guild.roles.cache.find(role => role.name === "Pupper | Level 50");
    var role25 = message.guild.roles.cache.find(role => role.name === "Pupper | Level 25");
    var role15 = message.guild.roles.cache.find(role => role.name === "Pupper | Level 15");
    var role10 = message.guild.roles.cache.find(role => role.name === "Pupper | Level 10");
    var role6 = message.guild.roles.cache.find(role => role.name === "Pupper | Level 6");
    var role3 = message.guild.roles.cache.find(role => role.name === "Pupper | Level 3");
    var role1 = message.guild.roles.cache.find(role => role.name === "Pupper | Level 1");

    if (hasLeveledUp) {
        const user = await Levels.fetch(message.author.id, message.guild.id);
        let member = message.mentions.members.first();
        if (user.level>=50){
            await message.member.roles.add(role50);
            await message.member.roles.remove(role25);
        } else if (user.level >= 25){
            await message.member.roles.add(role25);
            await message.member.roles.remove(role15);
        }else if (user.level >= 15){
            await message.member.roles.add(role15);
            await message.member.roles.remove(role10);

        }else if (user.level >= 10){
            await message.member.roles.add(role10);
            await message.member.roles.remove(role6);

        }else if (user.level >= 6){
            await message.member.roles.add(role6);
            await message.member.roles.remove(role3);

        }else if (user.level >= 3){
            await message.member.roles.add(role3);
            await message.member.roles.remove(role1);
        }else if (user.level >= 1){
            await message.member.roles.add(role1);
        }

    }

});

client.on("messageCreate", async (message) => {
    if (message.content.startsWith("!setup")){
        if (message.member.roles.cache.some(role => role.name === 'XP Bot')){
            xp = message.content.substr(7);
            console.log("Xp amount was changed to " + xp);
            message.channel.send(`You now get ${xp} xp per message!`)
        }
    }
    else if (message.content === (prefix+"checkamount")){
        console.log(xp)
    }
    

}
);
client.on("messageCreate", async (message) => {
    if (message.member.roles.cache.some(role => role.name === 'XP Bot')){
        if (message.content === (prefix+"reset")){
            Levels.deleteGuild(message.guild.id)
            console.log(message.author+" reseted everyone's rank")
            
        } else if (message.content.startsWith(prefix+"add ")){

            try {
                list = message.content.split(" ")
                user = list[1];
                amount = list[2];    
                Levels.appendXp(user, message.guild.id, amount);
            } catch (error) {
                console.error(error);
            }
            console.log(message.author.tag + " added " + amount + "xp to " + user)
        } else if (message.content.startsWith(prefix+"remove ")){

            try{
                list = message.content.split(" ")
                user = list[1];
                amount = list[2];    
                Levels.subtractXp(user, message.guild.id, amount);
            } catch (TypeError){
                console.error(error);
            }
            console.log(message.author.tag + " removed " + amount + "xp from " + user)

        } else if (message.content.startsWith(prefix+"levelFor")){
            let amount = Levels.xpFor(message.content.substr(9))
            console.log(amount);
        }

    }
})
client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;
    
    if (message.content === (prefix + "rank") || message.content === (prefix + "level")) {
        const target = message.mentions.users.first() || message.author; // Grab the target.
        const user = await Levels.fetch(target.id, message.guild.id); // Selects the target from the database.
        if (!user) return message.channel.send("Seems like this user has not earned any xp so far."); // If there isnt such user in the database, we send a message in general.
        message.channel.send(`> **${target.tag}** is currently level ${user.level}, you are ${Levels.xpFor(user.level+1)-user.xp}xp away from the next level.`);
    } else if(message.content === (prefix + "xp")){
        const target = message.mentions.users.first() || message.author; // Grab the target.
        const user = await Levels.fetch(target.id, message.guild.id); // Selects the target from the database.
        if (!user) return message.channel.send("Seems like this user has not earned any xp so far."); // If there isnt such user in the database, we send a message in general.
        message.channel.send(`> **${target.tag}** has ${user.xp} xp`);
    
    } else if (message.content === (prefix + "leaderboard") || message.content === "!lb") {
        const rawLeaderboard = await Levels.fetchLeaderboard(message.guild.id, 10); // We grab top 10 users with most xp in the current server.
        const leaderboard = await Levels.computeLeaderboard(client, rawLeaderboard, true); // We process the leaderboard.
        //const lb = leaderboard.map(e => `${e.position}. ${e.username}#${e.discriminator}\nLevel: ${e.level}\nXP: ${e.xp.toLocaleString()}`); // We map the outputs.
        if (rawLeaderboard.length < 1) {    
            message.channel.send("Nobody's in leaderboard yet.");
        } else{
            const newEmbed = new MessageEmbed()

            .setColor("#304281")    
            .setTitle("Datadogs XP Leaderboards")
            
            .setFooter('Brought to you by DataDogs', 'https://media.discordapp.net/attachments/906711814006521919/906714479037915186/9FD16F62-04F4-4AC7-A265-411CEA227C00.png')
            for (let i = 0; i < rawLeaderboard.length && i<9; i++){
                let name = leaderboard[i].username + "#" + leaderboard[i].discriminator
                newEmbed.addFields(
                    {name: (i+1).toString(), value: (name + " - " + leaderboard[i].xp +"xp")}
                )
            }
            message.channel.send({ embeds: [newEmbed] });
        }



}

});










