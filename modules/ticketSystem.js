/**
 * Ticket rendszer modul
 * Kezeli a ticket létrehozást, kezelést és bezárást
 */

const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    /**
     * Ticket menü küldése a megadott csatornába
     * @param {Client} client - Discord kliens
     */
    async sendTicketMenu(client) {
        try {
            console.log('🎫 Ticket menü inicializálása...');

            // Ellenőrizzük a konfigurációt
            if (!config.ticket.channelId || config.ticket.channelId === 'YOUR_TICKET_CHANNEL_ID_HERE') {
                console.log('⚠️  Ticket csatorna nincs beállítva a config.json-ban');
                return;
            }

            // Keressük meg a csatornát
            const channel = await client.channels.fetch(config.ticket.channelId).catch(() => null);
            if (!channel) {
                console.error(`❌ Ticket csatorna nem található: ${config.ticket.channelId}`);
                return;
            }

            // Embed létrehozása
            const embed = new EmbedBuilder()
                .setTitle(config.ticket.embed.title)
                .setDescription(config.ticket.embed.description)
                .setColor(config.ticket.embed.color)
                .setFooter({ text: config.ticket.embed.footer })
                .setTimestamp();

            // Select menu létrehozása a kategóriákkal
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('ticketCategory')
                .setPlaceholder('Válassz egy kategóriát...')
                .addOptions(config.ticket.categories.map(category => ({
                    label: category.label,
                    value: category.value,
                    description: category.description
                })));

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Üzenet küldése
            await channel.send({ 
                embeds: [embed], 
                components: [row] 
            });

            console.log('✅ Ticket menü sikeresen elküldve');

        } catch (error) {
            console.error('❌ Hiba a ticket menü küldése során:', error);
        }
    },

    /**
     * Ticket kategória választás kezelése
     * @param {StringSelectMenuInteraction} interaction - Select menu interakció
     */
    async handleTicketSelection(interaction) {
        try {
            // Válasz késleltetése
            await interaction.deferReply({ ephemeral: true });

            const selectedCategory = interaction.values[0];
            const categoryData = config.ticket.categories.find(cat => cat.value === selectedCategory);
            const username = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
            const guild = interaction.guild;

            // Ticket csatorna név generálása
            const channelName = `ticket-${username}`;

            // Ellenőrizzük, hogy már létezik-e ilyen nevű csatorna
            const existingChannel = guild.channels.cache.find(ch => ch.name === channelName);
            if (existingChannel) {
                await interaction.editReply({ 
                    content: `❌ Már van nyitott ticket-ed: ${existingChannel}`, 
                    ephemeral: true 
                });
                return;
            }

            // Ticket csatorna létrehozása
            const ticketChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: config.ticket.categoryId !== 'YOUR_TICKET_CATEGORY_ID_HERE' ? config.ticket.categoryId : null,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: guild.members.me.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }
                ],
                reason: `Ticket létrehozva: ${interaction.user.tag} (${categoryData.label})`
            });

            // Ticket embed létrehozása
            const ticketEmbed = new EmbedBuilder()
                .setTitle(config.ticket.ticketEmbed.title)
                .setDescription(`**Kategória:** ${categoryData.label}\n**Leírás:** ${categoryData.description}\n\n<@${interaction.user.id}>, köszönjük a ticket megnyitását! A csapatunk hamarosan válaszol.`)
                .setColor(config.ticket.ticketEmbed.color)
                .setFooter({ text: config.ticket.ticketEmbed.footer })
                .setTimestamp();

            // Bezáró gomb létrehozása
            const closeButton = new ButtonBuilder()
                .setCustomId(`closeTicket-${ticketChannel.id}`)
                .setLabel(config.ticket.closeButton.label)
                .setStyle(ButtonStyle[config.ticket.closeButton.style]);

            const buttonRow = new ActionRowBuilder().addComponents(closeButton);

            // Üzenet küldése a ticket csatornába
            await ticketChannel.send({ 
                content: `<@${interaction.user.id}>`, 
                embeds: [ticketEmbed], 
                components: [buttonRow] 
            });

            // Válasz a felhasználónak
            await interaction.editReply({ 
                content: `✅ Ticket sikeresen létrehozva: ${ticketChannel}`, 
                ephemeral: true 
            });

            // Logging
            if (config.logging.enabled && config.logging.events.ticketCreate) {
                await this.logTicketEvent(guild, 'create', interaction.user, ticketChannel, categoryData.label);
            }

            console.log(`✅ Ticket létrehozva: ${channelName} - ${interaction.user.tag} (${categoryData.label})`);

        } catch (error) {
            console.error('❌ Hiba a ticket létrehozása során:', error);
            
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: 'Hiba történt a ticket létrehozása során.', 
                    ephemeral: true 
                });
            } else {
                await interaction.editReply({ 
                    content: 'Hiba történt a ticket létrehozása során.', 
                    ephemeral: true 
                });
            }
        }
    },

    /**
     * Ticket bezárás kezelése
     * @param {ButtonInteraction} interaction - Gomb interakció
     */
    async handleTicketClose(interaction) {
        try {
            await interaction.deferReply();

            const channel = interaction.channel;
            
            // Megerősítő embed
            const confirmEmbed = new EmbedBuilder()
                .setTitle('🗑️ Ticket bezárása')
                .setDescription('A ticket 5 másodperc múlva bezáródik...')
                .setColor('#FF0000')
                .setTimestamp();

            await interaction.editReply({ embeds: [confirmEmbed] });

            // Logging
            if (config.logging.enabled && config.logging.events.ticketClose) {
                await this.logTicketEvent(interaction.guild, 'close', interaction.user, channel);
            }

            console.log(`🗑️ Ticket bezárva: ${channel.name} - ${interaction.user.tag}`);

            // 5 másodperc várakozás, majd csatorna törlése
            setTimeout(async () => {
                try {
                    await channel.delete('Ticket bezárva felhasználó által');
                } catch (deleteError) {
                    console.error('❌ Hiba a ticket csatorna törlése során:', deleteError);
                }
            }, 5000);

        } catch (error) {
            console.error('❌ Hiba a ticket bezárása során:', error);
            
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: 'Hiba történt a ticket bezárása során.', 
                    ephemeral: true 
                });
            }
        }
    },

    /**
     * Ticket esemény naplózása
     * @param {Guild} guild - Discord szerver
     * @param {string} action - Művelet típusa (create/close)
     * @param {User} user - Felhasználó
     * @param {Channel} channel - Csatorna
     * @param {string} category - Kategória (opcionális)
     */
    async logTicketEvent(guild, action, user, channel, category = null) {
        try {
            if (!config.logging.channelId || config.logging.channelId === 'YOUR_LOG_CHANNEL_ID_HERE') {
                return;
            }

            const logChannel = guild.channels.cache.get(config.logging.channelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle(`🎫 Ticket ${action === 'create' ? 'létrehozva' : 'bezárva'}`)
                .addFields(
                    { name: '👤 Felhasználó', value: `<@${user.id}> (${user.tag})`, inline: true },
                    { name: '📝 Csatorna', value: channel.name, inline: true }
                )
                .setColor(action === 'create' ? '#00FF00' : '#FF0000')
                .setTimestamp();

            if (category) {
                embed.addFields({ name: '📂 Kategória', value: category, inline: true });
            }

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Hiba a ticket log küldése során:', error);
        }
    }
};
