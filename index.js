const Discord = require('discord.js')
const token = require("./token.json")
const bdd = require("./bdd.json");
const fs = require("fs");
const { stringify } = require('querystring');
const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION']});
bot.commands = new Discord.Collection()
config = require('./config.json')
const moment = require('moment')

bot.on("ready", async () =>{
    console.log("Bot En Ligne")
    bot.user.setStatus("online");
    bot.user.setActivity("!help | Mange des ramens");
})

bot.on('channelCreate', channel => {
    if (!channel.guild) return
    const muteRole = channel.guild.roles.cache.find(role => role.name === '🔒・Muted')
    if (!muteRole) return
    channel.createOverwrite(muteRole, {
        SEND_MESSAGES: false,
        CONNECT: false,
        ADD_REACTIONS: false
    })
})

bot.on("message", async message => {

    if (message.author.bot) return;

    let commande = message.content.trim().split(" ")[0].slice(1)
    let args = message.content.trim().split(" ").slice(1);
    
    if (message.content.startsWith("!info")) {
        if(message.mentions.users.first()) {
            user = message.mentions.users.first();
       } else{
            user = message.author;
        }
        const member = message.guild.member(user);

        const embed = new Discord.MessageEmbed() 
        .setColor('#329da8')
        .setThumbnail(user.avatarURL)
        .setTitle(`Information sur ${user.username}#${user.discriminator} :`)
        .addField('ID du compte:', `${user.id}`, true)
        .addField('Pseudo sur le serveur :', `${member.nickname ? member.nickname : 'Aucun'}`, true)
        .addField('A crée son compte le :', `${moment.utc(user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true)
        .addField('A rejoint le serveur le :', `${moment.utc(member.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true)
        .addField('Joue a :', `${user.presence.game ? user.presence.game.name : 'Rien'}`, true)
        .addField('Roles :', member.roles.cache.map(roles => `${roles.name}`).join(', '), true)
        .addField(`En réponse a :`,`${message.author.username}#${message.author.discriminator}`)
    message.channel.send(embed)
    }0
    if(message.content.startsWith("!say")){
        if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande.')
        if (!args[0]) return message.channel.send('Veuillez indiquer du texte à envoyer.')
        message.delete()
        message.channel.send(message.content.trim().slice(`!say`.length))
    }
    if(message.content.startsWith("!poll")){
        if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande.')
        const [question, ...choices] = args.join(' ').split(' | ')
        if (!question) return message.channel.send('Veuillez indiquer la question à poser.')
        if (!choices.length) return message.channel.send('Veuillez indiquer au moins 1 choix.')
        if (choices.length > 20) return message.channel.send('Il ne peut pas y avoir plus de 20 choix.')
        message.delete()
        const sent = await message.channel.send(new Discord.MessageEmbed()
            .setTitle(question)
            .setColor('RANDOM')
            .setDescription(choices.map((choice, i) => `${reactions[i]} ${choice}`).join('\n\n')))
        for (i = 0; i < choices.length; i++) await sent.react(reactions[i])
    }

    if(message.content.startsWith("!unmute")){
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande.')
        const member = message.mentions.members.first()
        if (!member) return message.channel.send('Veuillez mentionner le membre à unmute.')
        if (member.id === message.guild.ownerID) return message.channel.send('Vous ne pouvez unmute le propriétaire du serveur.')
        if (message.member.roles.highest.comparePositionTo(member.roles.highest) < 1 && message.author.id !== message.guild.ownerID) return message.channel.send('Vous ne pouvez pas unmute un membre au desssus de vous.')
        if (!member.manageable) return message.channel.send('Le bot ne peut pas unmute ce membre.')
        const reason = args.slice(1).join(' ') || 'Aucune raison fournie.'
        const muteRole = message.guild.roles.cache.find(role => role.name === '🔒・Muted')
        if (!muteRole) return message.channel.send('Il n\'y a pas de muterole.')
        await member.roles.remove(muteRole)
        message.channel.send(`${member} a été unmute !`)
    }
    if(message.content.startsWith("!mute")){
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande.')
        const member = message.mentions.members.first()
        if (!member) return message.channel.send('Veuillez mentionner le membre à mute.')
        if (member.id === message.guild.ownerID) return message.channel.send('Vous ne pouvez mute le propriétaire du serveur.')
        if (message.member.roles.highest.comparePositionTo(member.roles.highest) < 1 && message.author.id !== message.guild.ownerID) return message.channel.send('Vous ne pouvez pas mute ce membre.')
        if (!member.manageable) return message.channel.send('Le bot ne peut pas mute ce membre.')
        const reason = args.slice(1).join(' ') || 'Aucune raison fournie.'
        let muteRole = message.guild.roles.cache.find(role => role.name === '🔒・Muted')
        if (!muteRole) {
            muteRole = await message.guild.roles.create({
                data: {
                    name: 'Muted',
                    permissions: 0
                }
            })
            message.guild.channels.cache.forEach(channel => channel.createOverwrite(muteRole, {
                SEND_MESSAGES: false,
                CONNECT: false,
                ADD_REACTIONS: false
            }))
        }
        await member.roles.add(muteRole)
        message.channel.send(`${member} a été mute !`)
    }
})

reactions = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹']

bot.on("message", message => {

    if(message.content.startsWith("!clear")){
        // message.delete();
        if(message.member.hasPermission('MANAGE_MESSAGES')){

            let args = message.content.trim().split(/ +/g);

            if(args[1]){
                if(!isNaN(args[1]) && args [1] >= 1 && args[1] <= 99){

                    message.channel.bulkDelete(args[1])

                }
                else{
                    message.channel.send('Vous devez indiquer une valeure entre 1 et 99 !')
                }
            }
            else{
                message.channel.send(`Vous devez indiquer un nombre de messages à supprimer !`)
            }
        }
        else{
            message.channel.send(`Vous devez avoir la permission de gérer les messages pour éxécuter cette commande !`)
        }
    }
})

bot.on("message", async message => {
    if(message.content.startsWith("!ban")){
        message.delete()
        if (!message.member.hasPermission('BAN_MEMBERS')) return;
        let utilisateur = message.mentions.members.first() || message.guild.member(args[0])
        temps = arg[1];
        raison = args.splice(0, 1).join(" ");
        if (!utilisateur) return message.channel.send('Vous devez mentionner un utilisateur !');
        if (!temps || isNaN(temps)) return message.channel.send('Vous devez indiquer un temps en secondes !');
        if (!raison || !args[2]) return message.channel.send('Vous devez indiquer une raison pour ban !');
        message.guild.members.ban(utilisateur.id);
        setTimeout(function () {
            message.guild.members.unban(utilisateur.id);
        }, temps * 1000);

    }
})

bot.on('message', message => {
    if(message.content.startsWith("!helpembed")){
    }
})


bot.on('guildMemberAdd', member => {
    member.guild.channels.cache.find(channel => channel.id === "857247259539537991").send(`${member}`, new Discord.MessageEmbed()
    .setColor('#0a35cf')
    .setTitle(`**Bienvenue à ${member.displayName}**`)
    .setDescription(`Bienvenue ${member} sur **🏮・OtakuLand's !**\n\n N'hésite pas à lire le réglement !`)
    .setImage("https://imgur.com/eBOaUu4.jpg"))
    
})

bot.on("message", message => {
    if(message.content.startsWith("!ping")){
        message.channel.send("Pong  :ping_pong::" + bot.ws.ping + "ms");
    }
    if(message.content.startsWith("!soutient")){
        if(message.member.hasPermission('ADMINISTRATOR')){
            var embed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setTitle('**Soutient**')
            .setDescription('**Si vous souhaitez soutenir le serveur,merci de mettre en bio un lien d\'invitations du serveur ! | Pour obtenir le rôle  @💦 ˙˚ʚ・Soutien !**')
            .setImage('https://imgur.com/h8DSK1F.jpg')

            message.channel.send(embed)

        }
    }
    if(message.content.startsWith("!réglement")){
        if(message.member.hasPermission('ADMINISTRATOR')){
            var embed = new  Discord.MessageEmbed()
            .setColor("#a64a30")
            .setTitle("`Réglement 🏮・OtakuLand's :`")
            .setDescription("\n **Dans les salons écrits** : \n\n\n- Les propos racistes, sexistes, homophobes, vulgaires et tout ce qui tourne autour de la moquerie seront sévèrement sanctionné. \n\n - Les liens sont interdit sur le serveur. \n\n -Évitez tout sujet polémique. (Religion, politique…) \n\n -Les pseudonymes ou noms de jeux inappropriés (pornographie, publicité, insultes …) sont strictement interdits.\n\n Ayez également un pseudonyme facile à mentionner. \n\n - La publicité n’est pas autorisée en message privé ou sur le serveur. \n\n -Prêtez attention aux noms et à la description des salon. \n\n Si quelqu’un enfreint ces règles, vous pouvez nous le rapporter. \n\n\n **Dans les salons vocaux :** \n\n\n -Le changement répétitif de salons vocaux est interdit. \n\n -Le spam auditif ainsi que les screamers audios sont strictement interdits. \n\n -Évitez tout sujet polémique. (Religion, politique…). \n\n -Si quelqu’un enfreint ces règles, vous pouvez nous le rapporter en mp !.")
            .addField("Veuillez cocher le réglement.", "@Otaku Anime 🪐")
    
            message.channel.send(embed)
        }
    }
    if(message.member.hasPermission('ADMINISTRATOR')){
    if(message.content.startsWith("!notif")){
        var embed = new Discord.MessageEmbed()
        .setColor("#03075e")
        .setTitle("**Tu veux être notifié pour ? :**")
        .setDescription("\nNotification Partenariat : :teddy_bear:\n Notification d'annonce peu importante : :mailbox: \n")
        .addField("Veuillez cliquer sur la réaction du rôle demandé.", "@Otaku Anime 🪐")

        message.channel.send(embed).then(msg => {
            msg.react("🧸");
            msg.react("📫");
        });
    }
    }
    if(message.member.hasPermission('ADMINISTRATOR')){
        if(message.content.startsWith("!age")){
            var embed = new Discord.MessageEmbed()
            .setColor("#03075e")
            .setTitle("**Réglement Otaku Anime :**")
            .setDescription("\nMineur : :underage:\n Majeur : :smoking: \n")
            .addField("Veuillez cliquer sur la réaction du rôle demandé.", "@Otaku Anime 🪐")

            message.channel.send(embed).then(msg => {
                msg.react("🔞");
                msg.react("🚬");
            });
        }
    }
    if(message.member.hasPermission('ADMINISTRATOR')){
        if(message.content.startsWith('!sexe')){
            var embed = new Discord.MessageEmbed()
            .setColor("#03075e")
            .setTitle("**Garçon ou Fille ? :**")
            .setDescription("\nFille : :girl:\n Garçon : :boy: \n")
            .addField("Veuillez cliquer sur la réaction du rôle demandé.", "@Otaku Anime 🪐")

            message.channel.send(embed).then(msg => {
                msg.react("👦");
                msg.react("👧");
            });
        }
    }
        if(message.member.hasPermission('ADMINISTRATOR')){
        if(message.content.startsWith('!captcha')){
            var embed = new Discord.MessageEmbed()
            .setColor("#03075e")
            .setTitle("**Captcha**")
            .setDescription("Bienvenue très chers villageois , merci d'avoir rejoint \n🏮・OtakuLand's\n\nPour confirmer que vous n'êtes pas un robot veuillez compléter le **captcha**")
            .setImage('https://imgur.com/nw89Zek.jpg')

            message.channel.send(embed)
        }
    }
    if(message.member.hasPermission('ADMINISTRATOR')){
        if(message.content.startsWith('!recrutement')){
            var embed = new Discord.MessageEmbed()
            .setColor("#03075e")
            .setTitle("**Recrutement**")
            .setDescription("__Nous recrutons des staffs pour cela des conditions sont nécessaires pour y rentrer :__\n\n-Avoir minimum 13 ans (histoire de maturité).\n\n-Être actif que se soit à l'écrit oû en vocal.\n\n-Être motivé et savoir quoi faire quand il y a un problème\n\n-Être impartiale et réagir de façon mature devant une situation ou un problème concernant les membres.\n\n**Si vous avez les conditions et vous vous y engager veuillez mp un admin !**")

            message.channel.send(embed)
        }
    }
});

//message.channel.send(`**${message.author}** embrasse ${member} !` + msg[Math.floor(Math.random()*msg.length)])

bot.on("message", async message => {
    if(message.content.startsWith("!kiss")){
        const member = message.mentions.members.first()
        if (!member) return message.channel.send('Veuillez mentionner la personne à embrasser ! ')
        const imgkiss  = ["https://cdn.nekos.life/kiss/kiss_072.gif",
                      "https://cdn.nekos.life/kiss/kiss_045.gif",
                      "https://cdn.nekos.life/kiss/kiss_004.gif",
                      "https://cdn.nekos.life/kiss/kiss_018.gif",
                      "https://cdn.nekos.life/kiss/kiss_012.gif",
                      "https://cdn.nekos.life/kiss/kiss_014.gif",
                      "https://cdn.nekos.life/kiss/kiss_015.gif",
                      "https://cdn.nekos.life/kiss/kiss_017.gif",
                      "https://cdn.nekos.life/kiss/kiss_018.gif",
                      "https://cdn.nekos.life/kiss/kiss_019.gif",
                      "https://cdn.nekos.life/kiss/kiss_020.gif",
                      "https://cdn.nekos.life/kiss/kiss_021.gif",
                      "https://cdn.nekos.life/kiss/kiss_022.gif",
                      "https://cdn.nekos.life/kiss/kiss_023.gif",
                      "https://cdn.nekos.life/kiss/kiss_024.gif",
                      "https://cdn.nekos.life/kiss/kiss_025.gif",
                      "https://cdn.nekos.life/kiss/kiss_026.gif",
                      "https://cdn.nekos.life/kiss/kiss_027.gif",
                      "https://cdn.nekos.life/kiss/kiss_028.gif",
                      "https://cdn.nekos.life/kiss/kiss_029.gif",
                      "https://cdn.nekos.life/kiss/kiss_030.gif",
                      "https://cdn.nekos.life/kiss/kiss_002.gif",
                      "https://cdn.nekos.life/kiss/kiss_003.gif",
                      "https://cdn.nekos.life/kiss/kiss_004.gif",
                      "https://cdn.nekos.life/kiss/kiss_005.gif",
                      "https://cdn.nekos.life/kiss/kiss_006.gif",
                      "https://cdn.nekos.life/kiss/kiss_007.gif",
                      "https://cdn.nekos.life/kiss/kiss_008.gif",
                      "https://cdn.nekos.life/kiss/kiss_009.gif",
                      "https://cdn.nekos.life/kiss/kiss_010.gif",
                      "https://cdn.nekos.life/kiss/kiss_031.gif",]
        var embed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setDescription(`**${message.author}** a embrassé ${member} !`)
        .setImage(imgkiss[Math.floor(Math.random()*imgkiss.length)])

        message.channel.send(embed)
    }
    if(message.content.startsWith("!hug")){
        const member = message.mentions.members.first()
        if (!member) return message.channel.send('Vous devez mentionner la personne à faire un calin !')
        const imghug = ["https://cdn.nekos.life/hug/hug_001.gif",
                        "https://cdn.nekos.life/hug/hug_002.gif",
                        "https://cdn.nekos.life/hug/hug_003.gif",
                        "https://cdn.nekos.life/hug/hug_004.gif",
                        "https://cdn.nekos.life/hug/hug_005.gif",
                        "https://cdn.nekos.life/hug/hug_006.gif",
                        "https://cdn.nekos.life/hug/hug_007.gif",
                        "https://cdn.nekos.life/hug/hug_008.gif",
                        "https://cdn.nekos.life/hug/hug_009.gif",
                        "https://cdn.nekos.life/hug/hug_010.gif",
                        "https://cdn.nekos.life/hug/hug_011.gif",
                        "https://cdn.nekos.life/hug/hug_012.gif",
                        "https://cdn.nekos.life/hug/hug_013.gif",
                        "https://cdn.nekos.life/hug/hug_014.gif",
                        "https://cdn.nekos.life/hug/hug_015.gif",
                        "https://cdn.nekos.life/hug/hug_016.gif",
                        "https://cdn.nekos.life/hug/hug_017.gif",
                        "https://cdn.nekos.life/hug/hug_018.gif",
                        "https://cdn.nekos.life/hug/hug_019.gif",
                        "https://cdn.nekos.life/hug/hug_020.gif",
                        "https://cdn.nekos.life/hug/hug_021.gif",
                        "https://cdn.nekos.life/hug/hug_022.gif",
                        "https://cdn.nekos.life/hug/hug_023.gif",
                        "https://cdn.nekos.life/hug/hug_024.gif",
                        "https://cdn.nekos.life/hug/hug_025.gif",
                        "https://cdn.nekos.life/hug/hug_026.gif",
                        "https://cdn.nekos.life/hug/hug_027.gif",
                        "https://cdn.nekos.life/hug/hug_028.gif",
                        "https://cdn.nekos.life/hug/hug_029.gif",
                        "https://cdn.nekos.life/hug/hug_030.gif",
                        "https://cdn.nekos.life/hug/hug_031.gif",
                        "https://cdn.nekos.life/hug/hug_032.gif",
                        "https://cdn.nekos.life/hug/hug_033.gif",
                        "https://cdn.nekos.life/hug/hug_034.gif",
                        "https://cdn.nekos.life/hug/hug_035.gif",
                        "https://cdn.nekos.life/hug/hug_036.gif",
                        "https://cdn.nekos.life/hug/hug_037.gif",
                        "https://cdn.nekos.life/hug/hug_038.gif",
                        "https://cdn.nekos.life/hug/hug_039.gif",
                        "https://cdn.nekos.life/hug/hug_040.gif",
                        "https://cdn.nekos.life/hug/hug_041.gif",
                        "https://cdn.nekos.life/hug/hug_042.gif",
                        "https://cdn.nekos.life/hug/hug_043.gif",
                        "https://cdn.nekos.life/hug/hug_044.gif",
                        "https://cdn.nekos.life/hug/hug_045.gif",
                        "https://cdn.nekos.life/hug/hug_046.gif",
                        "https://cdn.nekos.life/hug/hug_047.gif",
                        "https://cdn.nekos.life/hug/hug_048.gif",
                        "https://cdn.nekos.life/hug/hug_049.gif",
                        "https://cdn.nekos.life/hug/hug_050.gif",
                        "https://cdn.nekos.life/hug/hug_051.gif",
                        "https://cdn.nekos.life/hug/hug_052.gif",
                        "https://cdn.nekos.life/hug/hug_053.gif",
                        "https://cdn.nekos.life/hug/hug_054.gif",
                        "https://cdn.nekos.life/hug/hug_055.gif",
                        "https://cdn.nekos.life/hug/hug_056.gif",
                        "https://cdn.nekos.life/hug/hug_057.gif",
                        "https://cdn.nekos.life/hug/hug_058.gif",
                        "https://cdn.nekos.life/hug/hug_059.gif",
                        "https://cdn.nekos.life/hug/hug_060.gif",]

                        var embed = new Discord.MessageEmbed()
                        .setColor('RANDOM')
                        .setDescription(`**${message.author}** a fait un câlin a ${member} !`)
                        .setImage(imghug[Math.floor(Math.random()*imghug.length)])
                
                        message.channel.send(embed)
    }
    if(message.content.startsWith('!tirage_au_sort')){
        if(message.member.hasPermission('ADMINISTRATOR')){
            const tirage = guild.members
            message.channel.send('Le gagnant du disney + est : ' + tirage[Math.floor(Math.random()*tirage.length)])
        }
    }
    if(message.content.startsWith('!love')){
        const member = message.mentions.members.first()
        if (!member) return message.channel.send('Vous devez mentionner la personne avec qui vous voulez savoir la compatibilité !')
        const compatibilitélove = ['0%🤮',
                                   '2%🤮',
                                   '2%🤮',
                                   '3%🤮',
                                   '4%🤮',
                                   '5%🤮',
                                   '6%🤮',
                                   '7%🤮',
                                   '8%🤮',
                                   '9%🤮',
                                   '10%🤮',
                                   '11%🤢',
                                   '12%🤢',
                                   '13%🤢',
                                   '14%🤢',
                                   '15%🤢',
                                   '16%🤢',
                                   '17%🤢',
                                   '18%🤢',
                                   '19%🤢',
                                   '20%🤢',]
                                   var embed = new Discord.MessageEmbed()
                                   .setTitle(`Compatibilité entre ${message.author} et ${member} :`)
                                   .setColor('#329da8')
                                   .setDescription(`La compatibilité de ${message.author} et ${member} est de ` + compatibilitélove[Math.floor(Math.random()*compatibilitélove.length)])
                                   
                                   message.channel.send(embed)
    }
})

function addRandomInt(member) {
    bdd["coins-utilisateurs"][member.id] = bdd["coins-utilisateurs"][member.id] + Math.floor(Math.random() * (4 - 1) + 1);
    Savebdd();
}

function Savebdd() {
    fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
        if (err) message.channel.send("Une erreur est survenue.");
    });
}

bot.on("message", message => {
    if(message.content.startsWith('!help')){
        message.channel.send('**Voici mes commandes** :\n\nCommandes **Fun**: `!kiss, !hug, !slap, !love`\n\nCommandes de **Modération**: `!ban, !kick, !mute, !info, !clear`\n\nCommandes **Embed**: `!notif, !recrutement, !captcha, !sexe, !age, !réglement, !soutien`')
    }
})

bot.login(process.env.token.token);