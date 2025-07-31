/**
 * Automatikus rang kiosztás és üdvözlő rendszer új tagoknak
 * Amikor valaki csatlakozik a szerverre, automatikusan megkapja az alapértelmezett rangot
 * és üdvözlő üzenetet kap
 */

const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'guildMemberAdd',
    /**
     * Új tag csatlakozásakor lefutó függvény
     * @param {GuildMember} member - Az új tag
     */
    async execute(member) {
        try {
            console.log(`👋 Új tag csatlakozott: ${member.user.tag} (${member.user.id})`);

            // Automatikus rang kiosztás
            await this.handleAutoRole(member);
            
            // Üdvözlő üzenet küldése
            await this.sendWelcomeMessage(member);

            // Logging ha engedélyezve van
            if (config.logging.enabled && config.logging.events.memberJoin) {
                await this.logMemberJoin(member);
            }

        } catch (error) {
            console.error('❌ Hiba az új tag kezelése során:', error);
        }
    },

    /**
     * Automatikus rang kiosztás kezelése
     * @param {GuildMember} member - Az új tag
     */
    async handleAutoRole(member) {
        try {
            // Ellenőrizzük, hogy be van-e állítva az auto join role
            if (!config.autoJoinRole || config.autoJoinRole === 'YOUR_AUTO_JOIN_ROLE_ID_HERE') {
                console.log('⚠️  Auto join role nincs beállítva a config.json-ban');
                return;
            }

            // Keressük meg a rangot
            const role = member.guild.roles.cache.get(config.autoJoinRole);
            if (!role) {
                console.error(`❌ Rang nem található: ${config.autoJoinRole}`);
                return;
            }

            // Ellenőrizzük, hogy a bot rendelkezik-e a szükséges jogosultságokkal
            if (!member.guild.members.me.permissions.has('ManageRoles')) {
                console.error('❌ A botnak nincs jogosultsága rangok kezeléséhez');
                return;
            }

            // Ellenőrizzük, hogy a bot rangja magasabb-e mint a kiosztandó rang
            if (member.guild.members.me.roles.highest.position <= role.position) {
                console.error(`❌ A bot rangja nem elég magas a(z) ${role.name} rang kiosztásához`);
                return;
            }

            // Rang kiosztása
            await member.roles.add(role, 'Automatikus rang kiosztás új tagnak');
            console.log(`✅ ${role.name} rang kiosztva: ${member.user.tag}`);

        } catch (error) {
            console.error('❌ Hiba az automatikus rang kiosztása során:', error);
        }
    },

    /**
     * Üdvözlő üzenet küldése
     * @param {GuildMember} member - Az új tag
     */
    async sendWelcomeMessage(member) {
        try {
            // Ellenőrizzük, hogy engedélyezve van-e az üdvözlő rendszer
            if (!config.welcomeSystem.enabled) {
                console.log('⚠️  Üdvözlő rendszer kikapcsolva');
                return;
            }

            // Ellenőrizzük a csatorna konfigurációt
            if (!config.welcomeSystem.channelId || config.welcomeSystem.channelId === 'YOUR_WELCOME_CHANNEL_ID_HERE') {
                console.log('⚠️  Üdvözlő csatorna nincs beállítva a config.json-ban');
                return;
            }

            // Keressük meg az üdvözlő csatornát
            const welcomeChannel = member.guild.channels.cache.get(config.welcomeSystem.channelId);
            if (!welcomeChannel) {
                console.error(`❌ Üdvözlő csatorna nem található: ${config.welcomeSystem.channelId}`);
                return;
            }

            // Üdvözlő embed létrehozása
            const welcomeEmbed = new EmbedBuilder()
                .setTitle(config.welcomeSystem.embed.title)
                .setDescription(config.welcomeSystem.embed.description)
                .addFields({
                    name: '\u200B',
                    value: config.welcomeSystem.embed.message.replace('{user}', `<@${member.user.id}>`),
                    inline: false
                })
                .addFields({
                    name: '\u200B',
                    value: `📅 **Csatlakozás:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                    inline: false
                })
                .setColor(config.welcomeSystem.embed.color)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setImage(config.welcomeSystem.embed.image)
                .setTimestamp();

            // Üdvözlő üzenet küldése
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
            console.log(`✅ Üdvözlő üzenet elküldve: ${member.user.tag}`);

        } catch (error) {
            console.error('❌ Hiba az üdvözlő üzenet küldése során:', error);
        }
    },

    /**
     * Tag csatlakozás naplózása
     * @param {GuildMember} member - Az új tag
     */
    async logMemberJoin(member) {
        try {
            const logChannel = member.guild.channels.cache.get(config.logging.channelId);
            if (!logChannel || config.logging.channelId === 'YOUR_LOG_CHANNEL_ID_HERE') {
                return;
            }

            const role = member.guild.roles.cache.get(config.autoJoinRole);
            
            const embed = new EmbedBuilder()
                .setTitle('👋 Új tag csatlakozott')
                .setDescription(`${member.user.tag} csatlakozott a szerverre`)
                .addFields(
                    { name: '👤 Felhasználó', value: `<@${member.user.id}>`, inline: true },
                    { name: '🏷️ Kiosztott rang', value: role ? role.name : 'Nincs', inline: true },
                    { name: '📅 Csatlakozás ideje', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setColor('#00FF00')
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('⚠️  Hiba a log üzenet küldése során:', error);
        }
    }
};
