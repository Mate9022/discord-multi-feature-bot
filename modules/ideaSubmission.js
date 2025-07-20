/**
 * Ötlet beküldő rendszer modul
 * Kezeli az ötletek fogadását és továbbítását
 */

const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    /**
     * Ötlet beküldés kezelése
     * @param {Message} message - Az eredeti üzenet
     */
    async handleIdeaSubmission(message) {
        try {
            // Ötlet szöveg kinyerése (prefix eltávolítása)
            const ideaText = message.content.slice(config.prefix.length).trim();
            
            // Ellenőrizzük, hogy van-e szöveg
            if (!ideaText) {
                await message.reply('❌ Kérlek adj meg egy ötletet a parancs után!\n**Használat:** `' + config.prefix + ' Itt az ötleted`');
                return;
            }

            // Szöveg hossz ellenőrzése
            if (ideaText.length > 2000) {
                await message.reply('❌ Az ötlet túl hosszú! Maximum 2000 karakter lehet.');
                return;
            }

            // Ellenőrizzük a csatorna konfigurációt
            if (!config.ideaSubmission.channelId || config.ideaSubmission.channelId === 'YOUR_IDEA_CHANNEL_ID_HERE') {
                await message.reply('❌ Az ötlet csatorna nincs beállítva.');
                console.error('❌ Idea submission channel nincs beállítva a config.json-ban');
                return;
            }

            // Keressük meg az ötlet csatornát
            const ideaChannel = await message.client.channels.fetch(config.ideaSubmission.channelId).catch(() => null);
            if (!ideaChannel) {
                await message.reply('❌ Az ötlet csatorna nem található.');
                console.error(`❌ Idea channel nem található: ${config.ideaSubmission.channelId}`);
                return;
            }

            // Ötlet embed létrehozása
            const embed = new EmbedBuilder()
                .setTitle(config.ideaSubmission.embed.title)
                .setDescription(ideaText)
                .setColor(config.ideaSubmission.embed.color)
                .setAuthor({ 
                    name: message.author.tag, 
                    iconURL: message.author.displayAvatarURL() 
                })
                .setFooter({ text: config.ideaSubmission.embed.footer })
                .setTimestamp();

            // Ötlet küldése a megadott csatornába
            const postedMessage = await ideaChannel.send({ embeds: [embed] });

            // Reakciók hozzáadása
            for (const reaction of config.ideaSubmission.reactions) {
                try {
                    await postedMessage.react(reaction);
                } catch (reactionError) {
                    console.error(`❌ Hiba a reakció hozzáadása során (${reaction}):`, reactionError);
                }
            }

            // Megerősítő üzenet küldése a felhasználónak
            await message.reply(config.ideaSubmission.confirmMessage);

            // Logging
            if (config.logging.enabled && config.logging.events.ideaSubmit) {
                await this.logIdeaSubmission(message.guild, message.author, ideaText, postedMessage);
            }

            console.log(`💡 Ötlet beküldve: ${message.author.tag} - "${ideaText.substring(0, 50)}..."`);

        } catch (error) {
            console.error('❌ Hiba az ötlet beküldése során:', error);
            
            try {
                await message.reply('❌ Hiba történt az ötlet beküldése során. Kérlek próbáld újra később.');
            } catch (replyError) {
                console.error('❌ Nem sikerült válaszolni az üzenetre:', replyError);
            }
        }
    },

    /**
     * Ötlet beküldés naplózása
     * @param {Guild} guild - Discord szerver
     * @param {User} user - Felhasználó
     * @param {string} ideaText - Ötlet szövege
     * @param {Message} postedMessage - Elküldött üzenet
     */
    async logIdeaSubmission(guild, user, ideaText, postedMessage) {
        try {
            if (!config.logging.channelId || config.logging.channelId === 'YOUR_LOG_CHANNEL_ID_HERE') {
                return;
            }

            const logChannel = guild.channels.cache.get(config.logging.channelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('💡 Új ötlet beküldve')
                .addFields(
                    { name: '👤 Felhasználó', value: `<@${user.id}> (${user.tag})`, inline: true },
                    { name: '📝 Ötlet', value: ideaText.length > 100 ? ideaText.substring(0, 100) + '...' : ideaText, inline: false },
                    { name: '🔗 Link', value: `[Ugrás az ötlethez](${postedMessage.url})`, inline: true }
                )
                .setColor('#FF9900')
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Hiba az ötlet log küldése során:', error);
        }
    },

    /**
     * Ötlet statisztikák lekérése (opcionális funkció)
     * @param {Guild} guild - Discord szerver
     * @param {User} user - Felhasználó (opcionális, specifikus felhasználó statisztikái)
     * @returns {Object} Statisztikák objektum
     */
    async getIdeaStats(guild, user = null) {
        try {
            if (!config.ideaSubmission.channelId || config.ideaSubmission.channelId === 'YOUR_IDEA_CHANNEL_ID_HERE') {
                return null;
            }

            const ideaChannel = guild.channels.cache.get(config.ideaSubmission.channelId);
            if (!ideaChannel) return null;

            // Utolsó 100 üzenet lekérése
            const messages = await ideaChannel.messages.fetch({ limit: 100 });
            const ideaMessages = messages.filter(msg => 
                msg.embeds.length > 0 && 
                msg.embeds[0].title === config.ideaSubmission.embed.title
            );

            let stats = {
                totalIdeas: ideaMessages.size,
                totalReactions: 0,
                positiveReactions: 0,
                negativeReactions: 0
            };

            // Ha specifikus felhasználó van megadva
            if (user) {
                const userIdeas = ideaMessages.filter(msg => 
                    msg.embeds[0].author && msg.embeds[0].author.name === user.tag
                );
                stats.userIdeas = userIdeas.size;
            }

            // Reakciók számolása
            ideaMessages.forEach(msg => {
                msg.reactions.cache.forEach(reaction => {
                    if (reaction.emoji.name === '✅') {
                        stats.positiveReactions += reaction.count - 1; // -1 mert a bot is reagált
                    } else if (reaction.emoji.name === '❌') {
                        stats.negativeReactions += reaction.count - 1;
                    }
                    stats.totalReactions += reaction.count - 1;
                });
            });

            return stats;

        } catch (error) {
            console.error('❌ Hiba az ötlet statisztikák lekérése során:', error);
            return null;
        }
    }
};
