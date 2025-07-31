/**
 * Kilépő rendszer
 * Amikor valaki elhagyja a szervert, búcsúzó üzenetet küld
 */

const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'guildMemberRemove',
    /**
     * Tag kilépésekor lefutó függvény
     * @param {GuildMember} member - A kilépő tag
     */
    async execute(member) {
        try {
            console.log(`👋 Tag elhagyta a szervert: ${member.user.tag} (${member.user.id})`);

            // Kilépő üzenet küldése
            await this.sendLeaveMessage(member);

            // Logging ha engedélyezve van
            if (config.logging.enabled && config.logging.events.memberLeave) {
                await this.logMemberLeave(member);
            }

        } catch (error) {
            console.error('❌ Hiba a kilépő tag kezelése során:', error);
        }
    },

    /**
     * Kilépő üzenet küldése
     * @param {GuildMember} member - A kilépő tag
     */
    async sendLeaveMessage(member) {
        try {
            // Ellenőrizzük, hogy engedélyezve van-e a kilépő rendszer
            if (!config.leaveSystem.enabled) {
                console.log('⚠️  Kilépő rendszer kikapcsolva');
                return;
            }

            // Ellenőrizzük a csatorna konfigurációt
            if (!config.leaveSystem.channelId || config.leaveSystem.channelId === 'YOUR_LEAVE_CHANNEL_ID_HERE') {
                console.log('⚠️  Kilépő csatorna nincs beállítva a config.json-ban');
                return;
            }

            // Keressük meg a kilépő csatornát
            const leaveChannel = member.guild.channels.cache.get(config.leaveSystem.channelId);
            if (!leaveChannel) {
                console.error(`❌ Kilépő csatorna nem található: ${config.leaveSystem.channelId}`);
                return;
            }

            // Kilépő embed létrehozása
            const leaveEmbed = new EmbedBuilder()
                .setTitle(config.leaveSystem.embed.title)
                .setDescription(config.leaveSystem.embed.description)
                .addFields({
                    name: '\u200B',
                    value: config.leaveSystem.embed.message.replace('{user}', `**${member.user.tag}**`),
                    inline: false
                })
                .addFields({
                    name: '\u200B',
                    value: `📅 **Kilépés:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                    inline: false
                })
                .setColor(config.leaveSystem.embed.color)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setImage(config.leaveSystem.embed.image)
                .setTimestamp();

            // Kilépő üzenet küldése
            await leaveChannel.send({ embeds: [leaveEmbed] });
            console.log(`✅ Kilépő üzenet elküldve: ${member.user.tag}`);

        } catch (error) {
            console.error('❌ Hiba a kilépő üzenet küldése során:', error);
        }
    },

    /**
     * Tag kilépés naplózása
     * @param {GuildMember} member - A kilépő tag
     */
    async logMemberLeave(member) {
        try {
            const logChannel = member.guild.channels.cache.get(config.logging.channelId);
            if (!logChannel || config.logging.channelId === 'YOUR_LOG_CHANNEL_ID_HERE') {
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('👋 Tag elhagyta a szervert')
                .setDescription(`${member.user.tag} elhagyta a szervert`)
                .addFields(
                    { name: '👤 Felhasználó', value: `${member.user.tag} (${member.user.id})`, inline: true },
                    { name: '📅 Kilépés ideje', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '⏱️ Szerveren töltött idő', value: this.calculateMembershipDuration(member), inline: false }
                )
                .setColor('#FF6B6B')
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('⚠️  Hiba a kilépő log üzenet küldése során:', error);
        }
    },

    /**
     * Szerveren töltött idő kiszámítása
     * @param {GuildMember} member - A tag
     * @returns {string} Formázott időtartam
     */
    calculateMembershipDuration(member) {
        try {
            const joinedAt = member.joinedAt;
            if (!joinedAt) return 'Ismeretlen';

            const now = new Date();
            const diffMs = now - joinedAt;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            if (diffDays > 0) {
                return `${diffDays} nap, ${diffHours} óra`;
            } else if (diffHours > 0) {
                return `${diffHours} óra, ${diffMinutes} perc`;
            } else {
                return `${diffMinutes} perc`;
            }
        } catch (error) {
            console.error('❌ Hiba az időtartam számítása során:', error);
            return 'Ismeretlen';
        }
    }
};
