/**
 * Interakciók kezelése (slash parancsok, gombok, select menük)
 */

const config = require('../config.json');

module.exports = {
    name: 'interactionCreate',
    /**
     * Interakció esemény kezelő függvény
     * @param {Interaction} interaction - Az interakció objektum
     * @param {Client} client - A Discord kliens
     */
    async execute(interaction, client) {
        try {
            // Slash parancsok kezelése
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                
                if (!command) {
                    console.error(`❌ Ismeretlen parancs: ${interaction.commandName}`);
                    return;
                }

                try {
                    console.log(`🔧 Parancs végrehajtása: /${interaction.commandName} - ${interaction.user.tag}`);
                    await command.execute(interaction, client);
                } catch (error) {
                    console.error(`❌ Hiba a parancs végrehajtása során: ${interaction.commandName}`, error);
                    
                    const errorMessage = config.messages.errors.generalError;
                    
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: errorMessage, ephemeral: true });
                    } else {
                        await interaction.reply({ content: errorMessage, ephemeral: true });
                    }
                }
            }
            // Select menu (dropdown) kezelése - Ticket rendszer
            else if (interaction.isStringSelectMenu()) {
                if (interaction.customId === 'ticketCategory') {
                    console.log(`🎫 Ticket kategória választás: ${interaction.values[0]} - ${interaction.user.tag}`);
                    const ticketSystem = require('../modules/ticketSystem');
                    await ticketSystem.handleTicketSelection(interaction);
                }
            }
            // Gombok kezelése - Ticket bezárás
            else if (interaction.isButton()) {
                if (interaction.customId.startsWith('closeTicket')) {
                    console.log(`🗑️ Ticket bezárás kérés: ${interaction.user.tag}`);
                    const ticketSystem = require('../modules/ticketSystem');
                    await ticketSystem.handleTicketClose(interaction);
                }
            }
        } catch (error) {
            console.error('❌ Hiba az interactionCreate esemény kezelése során:', error);
            
            // Próbáljunk válaszolni a felhasználónak, ha még nem történt meg
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ 
                        content: config.messages.errors.generalError, 
                        ephemeral: true 
                    });
                }
            } catch (replyError) {
                console.error('❌ Nem sikerült válaszolni az interakcióra:', replyError);
            }
        }
    }
};
