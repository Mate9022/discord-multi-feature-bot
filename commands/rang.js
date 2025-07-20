/**
 * Rang kiosztási slash parancs
 * Lehetővé teszi a felhasználók számára, hogy rangokat kérjenek
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rang')
        .setDescription('Rang kérése vagy kiosztása')
        .addStringOption(option =>
            option.setName('név')
                .setDescription('A kérni kívánt rang neve')
                .setRequired(true)
                .addChoices(
                    // Dinamikusan generáljuk a választási lehetőségeket a config alapján
                    ...Object.keys(config.rankAssignment.roles).map(rankName => ({
                        name: rankName,
                        value: rankName
                    }))
                )
        )
        .addUserOption(option =>
            option.setName('felhasználó')
                .setDescription('Felhasználó akinek a rangot kiosztod (csak moderátoroknak)')
                .setRequired(false)
        ),

    /**
     * Parancs végrehajtása
     * @param {ChatInputCommandInteraction} interaction - Slash parancs interakció
     * @param {Client} client - Discord kliens
     */
    async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const rankName = interaction.options.getString('név');
            const targetUser = interaction.options.getUser('felhasználó');
            const member = targetUser ? interaction.guild.members.cache.get(targetUser.id) : interaction.member;

            // Ellenőrizzük, hogy létezik-e a rang
            const roleId = config.rankAssignment.roles[rankName];
            if (!roleId || roleId === `YOUR_${rankName.toUpperCase()}_ROLE_ID_HERE`) {
                const message = config.rankAssignment.messages.notFound.replace('{rank}', rankName);
                await interaction.editReply({ content: message });
                return;
            }

            // Keressük meg a rangot
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) {
                console.error(`❌ Rang nem található a szerveren: ${roleId}`);
                await interaction.editReply({ content: config.messages.errors.roleNotFound });
                return;
            }

            // Ha más felhasználónak osztunk rangot, ellenőrizzük a jogosultságokat
            if (targetUser && targetUser.id !== interaction.user.id) {
                // Ellenőrizzük, hogy a parancsot kiadó rendelkezik-e moderátori jogosultságokkal
                if (!interaction.member.permissions.has('ManageRoles')) {
                    await interaction.editReply({ content: config.rankAssignment.messages.noPermission });
                    return;
                }

                // Ellenőrizzük, hogy a cél felhasználó létezik-e a szerveren
                if (!member) {
                    await interaction.editReply({ content: '❌ A felhasználó nem található a szerveren.' });
                    return;
                }
            }

            // Ellenőrizzük a bot jogosultságait
            if (!interaction.guild.members.me.permissions.has('ManageRoles')) {
                await interaction.editReply({ content: config.messages.errors.missingPermissions });
                return;
            }

            // Ellenőrizzük, hogy a bot rangja magasabb-e
            if (interaction.guild.members.me.roles.highest.position <= role.position) {
                await interaction.editReply({ 
                    content: `❌ A bot rangja nem elég magas a(z) **${role.name}** rang kiosztásához.` 
                });
                return;
            }

            // Ellenőrizzük, hogy a felhasználó már rendelkezik-e ezzel a ranggal
            if (member.roles.cache.has(roleId)) {
                await interaction.editReply({ 
                    content: `ℹ️ ${targetUser ? `<@${targetUser.id}>` : 'Te'} már rendelkezel a(z) **${role.name}** ranggal.` 
                });
                return;
            }

            // Rang kiosztása
            await member.roles.add(role, `Rang kiosztva ${interaction.user.tag} által`);

            // Sikeres üzenet
            const successMessage = config.rankAssignment.messages.success
                .replace('{rank}', role.name)
                .replace('{user}', targetUser ? `<@${targetUser.id}>` : 'te');

            await interaction.editReply({ content: successMessage });

            // Részletes embed a rang kiosztásról
            const embed = new EmbedBuilder()
                .setTitle('✅ Rang sikeresen kiosztva')
                .addFields(
                    { name: '👤 Felhasználó', value: `<@${member.user.id}>`, inline: true },
                    { name: '🏷️ Rang', value: role.name, inline: true },
                    { name: '👮 Kiosztó', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setColor(role.color || '#00FF00')
                .setTimestamp();

            // Ha nem saját magának osztotta ki, küldjünk egy nyilvános üzenetet is
            if (targetUser && targetUser.id !== interaction.user.id) {
                await interaction.followUp({ embeds: [embed], ephemeral: false });
            }

            // Logging
            if (config.logging.enabled && config.logging.events.rankAssign) {
                await this.logRankAssignment(interaction.guild, interaction.user, member.user, role);
            }

            console.log(`🏷️ Rang kiosztva: ${role.name} -> ${member.user.tag} (${interaction.user.tag} által)`);

        } catch (error) {
            console.error('❌ Hiba a rang kiosztása során:', error);
            
            const errorMessage = config.rankAssignment.messages.error;
            
            if (!interaction.replied) {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.editReply({ content: errorMessage });
            }
        }
    },

    /**
     * Rang kiosztás naplózása
     * @param {Guild} guild - Discord szerver
     * @param {User} assigner - Kiosztó felhasználó
     * @param {User} target - Cél felhasználó
     * @param {Role} role - Kiosztott rang
     */
    async logRankAssignment(guild, assigner, target, role) {
        try {
            if (!config.logging.channelId || config.logging.channelId === 'YOUR_LOG_CHANNEL_ID_HERE') {
                return;
            }

            const logChannel = guild.channels.cache.get(config.logging.channelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('🏷️ Rang kiosztva')
                .addFields(
                    { name: '👤 Felhasználó', value: `<@${target.id}> (${target.tag})`, inline: true },
                    { name: '🏷️ Rang', value: role.name, inline: true },
                    { name: '👮 Kiosztó', value: `<@${assigner.id}> (${assigner.tag})`, inline: true }
                )
                .setColor(role.color || '#00FF00')
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Hiba a rang log küldése során:', error);
        }
    }
};
