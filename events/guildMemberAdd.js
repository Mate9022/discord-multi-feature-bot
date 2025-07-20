/**
 * Automatikus rang kiosztás új tagoknak
 * Amikor valaki csatlakozik a szerverre, automatikusan megkapja az alapértelmezett rangot
 */

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

            // Logging ha engedélyezve van
            if (config.logging.enabled && config.logging.events.memberJoin) {
                try {
                    const logChannel = member.guild.channels.cache.get(config.logging.channelId);
                    if (logChannel && config.logging.channelId !== 'YOUR_LOG_CHANNEL_ID_HERE') {
                        const { EmbedBuilder } = require('discord.js');
                        
                        const embed = new EmbedBuilder()
                            .setTitle('👋 Új tag csatlakozott')
                            .setDescription(`${member.user.tag} csatlakozott a szerverre`)
                            .addFields(
                                { name: '👤 Felhasználó', value: `<@${member.user.id}>`, inline: true },
                                { name: '🏷️ Kiosztott rang', value: role.name, inline: true },
                                { name: '📅 Csatlakozás ideje', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                            )
                            .setColor('#00FF00')
                            .setThumbnail(member.user.displayAvatarURL())
                            .setTimestamp();

                        await logChannel.send({ embeds: [embed] });
                    }
                } catch (logError) {
                    console.error('⚠️  Hiba a log üzenet küldése során:', logError);
                }
            }

        } catch (error) {
            console.error('❌ Hiba az automatikus rang kiosztása során:', error);
        }
    }
};
