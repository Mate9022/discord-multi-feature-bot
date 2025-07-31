/**
 * Üzenet események kezelése (ötlet beküldő rendszer)
 */

const config = require('../config.json');

module.exports = {
    name: 'messageCreate',
    /**
     * Üzenet létrehozásakor lefutó függvény
     * @param {Message} message - Az üzenet objektum
     */
    async execute(message) {
        try {
            // Bot üzenetek figyelmen kívül hagyása
            if (message.author.bot) return;

            // Ellenőrizzük, hogy az üzenet az ötlet prefix-szel kezdődik-e
            if (message.content.startsWith(config.prefix)) {
                console.log(`💡 Ötlet beküldés: ${message.author.tag} - ${message.content.substring(0, 50)}...`);
                
                const ideaSubmission = require('../modules/ideaSubmission');
                await ideaSubmission.handleIdeaSubmission(message);
            }
        } catch (error) {
            console.error('❌ Hiba a messageCreate esemény kezelése során:', error);
            
            // Próbáljunk válaszolni a felhasználónak
            try {
                await message.reply(config.messages.errors.generalError);
            } catch (replyError) {
                console.error('❌ Nem sikerült válaszolni az üzenetre:', replyError);
            }
        }
    }
};
