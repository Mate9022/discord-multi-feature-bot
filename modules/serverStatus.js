/**
 * Minecraft szerver státusz figyelő modul
 * Rendszeresen ellenőrzi a Minecraft szerver állapotát és frissíti a bot státuszát
 */

const { status } = require('minecraft-server-util');
const { ActivityType } = require('discord.js');
const config = require('../config.json');

module.exports = {
    /**
     * Szerver státusz figyelő indítása
     * @param {Client} client - Discord kliens
     * @param {Object} minecraftConfig - Minecraft konfiguráció
     */
    startServerStatusMonitor(client, minecraftConfig) {
        console.log('🎮 Minecraft szerver figyelő indítása...');

        // Ellenőrizzük a konfigurációt
        if (!minecraftConfig.enabled) {
            console.log('⚠️  Minecraft szerver figyelő kikapcsolva');
            return;
        }

        if (!minecraftConfig.host || minecraftConfig.host === 'your-minecraft-server.com') {
            console.log('⚠️  Minecraft szerver host nincs beállítva');
            return;
        }

        /**
         * Státusz frissítő függvény
         */
        async function updateServerStatus() {
            try {
                console.log(`🔍 Minecraft szerver ellenőrzése: ${minecraftConfig.host}:${minecraftConfig.port}`);

                // Szerver státusz lekérése
                const result = await status(minecraftConfig.host, minecraftConfig.port, {
                    timeout: 5000,
                    enableSRV: true
                });

                // Online státusz beállítása
                const onlineMessage = minecraftConfig.statusMessages.online
                    .replace('{players}', result.onlinePlayers)
                    .replace('{maxPlayers}', result.maxPlayers);

                await client.user.setPresence({
                    activities: [{
                        name: onlineMessage,
                        type: ActivityType.Playing
                    }],
                    status: 'online'
                });

                console.log(`✅ Minecraft szerver online: ${result.onlinePlayers}/${result.maxPlayers} játékos`);

                // Részletes információk logolása
                if (result.version) {
                    console.log(`📋 Szerver verzió: ${result.version.name}`);
                }
                if (result.motd) {
                    console.log(`📝 MOTD: ${result.motd.clean}`);
                }

            } catch (error) {
                console.error('❌ Minecraft szerver elérhetetlen:', error.message);

                // Offline státusz beállítása
                await client.user.setPresence({
                    activities: [{
                        name: minecraftConfig.statusMessages.offline,
                        type: ActivityType.Playing
                    }],
                    status: 'idle'
                });

                // Különböző hibatípusok kezelése
                if (error.code === 'ENOTFOUND') {
                    console.log('🔍 DNS hiba: A szerver címe nem található');
                } else if (error.code === 'ECONNREFUSED') {
                    console.log('🔍 Kapcsolat elutasítva: A szerver nem fut vagy nem elérhető');
                } else if (error.code === 'ETIMEDOUT') {
                    console.log('🔍 Időtúllépés: A szerver nem válaszol időben');
                }
            }
        }

        /**
         * Hiba esetén státusz frissítése
         */
        async function setErrorStatus() {
            try {
                await client.user.setPresence({
                    activities: [{
                        name: minecraftConfig.statusMessages.error,
                        type: ActivityType.Playing
                    }],
                    status: 'dnd'
                });
            } catch (error) {
                console.error('❌ Hiba a státusz beállítása során:', error);
            }
        }

        // Első ellenőrzés azonnal
        updateServerStatus().catch(() => setErrorStatus());

        // Rendszeres ellenőrzés beállítása
        const interval = setInterval(() => {
            updateServerStatus().catch(() => setErrorStatus());
        }, minecraftConfig.statusInterval);

        console.log(`✅ Minecraft szerver figyelő elindítva (${minecraftConfig.statusInterval / 1000}s intervallum)`);

        // Interval visszaadása a későbbi törléshez
        return interval;
    },

    /**
     * Szerver információk lekérése (manuális ellenőrzéshez)
     * @param {string} host - Szerver címe
     * @param {number} port - Szerver portja
     * @returns {Object|null} Szerver információk vagy null hiba esetén
     */
    async getServerInfo(host, port = 25565) {
        try {
            const result = await status(host, port, {
                timeout: 5000,
                enableSRV: true
            });

            return {
                online: true,
                players: {
                    online: result.onlinePlayers,
                    max: result.maxPlayers,
                    list: result.samplePlayers || []
                },
                version: result.version ? result.version.name : 'Ismeretlen',
                motd: result.motd ? result.motd.clean : 'Nincs MOTD',
                ping: result.roundTripLatency || 0,
                favicon: result.favicon || null
            };

        } catch (error) {
            console.error(`❌ Hiba a szerver információk lekérése során (${host}:${port}):`, error.message);
            
            return {
                online: false,
                error: error.message,
                errorCode: error.code
            };
        }
    },

    /**
     * Több szerver státuszának ellenőrzése
     * @param {Array} servers - Szerverek listája [{host, port, name}]
     * @returns {Array} Szerverek státusza
     */
    async checkMultipleServers(servers) {
        const results = [];

        for (const server of servers) {
            const info = await this.getServerInfo(server.host, server.port || 25565);
            results.push({
                name: server.name || `${server.host}:${server.port || 25565}`,
                host: server.host,
                port: server.port || 25565,
                ...info
            });
        }

        return results;
    },

    /**
     * Szerver státusz embed létrehozása
     * @param {Object} serverInfo - Szerver információk
     * @param {string} serverName - Szerver neve
     * @returns {EmbedBuilder} Discord embed
     */
    createServerStatusEmbed(serverInfo, serverName = 'Minecraft Szerver') {
        const { EmbedBuilder } = require('discord.js');

        const embed = new EmbedBuilder()
            .setTitle(`🎮 ${serverName} Státusz`)
            .setTimestamp();

        if (serverInfo.online) {
            embed
                .setColor('#00FF00')
                .setDescription('🟢 **Online**')
                .addFields(
                    { name: '👥 Játékosok', value: `${serverInfo.players.online}/${serverInfo.players.max}`, inline: true },
                    { name: '📋 Verzió', value: serverInfo.version, inline: true },
                    { name: '🏓 Ping', value: `${serverInfo.ping}ms`, inline: true },
                    { name: '📝 MOTD', value: serverInfo.motd || 'Nincs MOTD', inline: false }
                );

            // Játékosok listája (ha van)
            if (serverInfo.players.list && serverInfo.players.list.length > 0) {
                const playerList = serverInfo.players.list
                    .slice(0, 10) // Maximum 10 játékos
                    .map(player => player.name)
                    .join(', ');
                
                embed.addFields({ 
                    name: '🎯 Online játékosok', 
                    value: playerList + (serverInfo.players.list.length > 10 ? '...' : ''), 
                    inline: false 
                });
            }
        } else {
            embed
                .setColor('#FF0000')
                .setDescription('🔴 **Offline**')
                .addFields({ name: '❌ Hiba', value: serverInfo.error || 'Ismeretlen hiba', inline: false });
        }

        return embed;
    }
};
