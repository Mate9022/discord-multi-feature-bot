/**
 * Discord Multi-feature Bot
 * Főbb funkciók:
 * - Automatikus join role
 * - Ticket rendszer
 * - Ötlet beküldő rendszer
 * - Minecraft szerver státusz figyelő
 * - Rang kiosztási rendszer
 */

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

// Discord kliens létrehozása a szükséges jogosultságokkal
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,                    // Szerver információk
        GatewayIntentBits.GuildMembers,              // Tag információk (join/leave)
        GatewayIntentBits.GuildMessages,             // Üzenetek olvasása
        GatewayIntentBits.MessageContent,            // Üzenet tartalom olvasása
        GatewayIntentBits.GuildMessageReactions      // Reakciók kezelése
    ]
});

// Parancsok gyűjteménye
client.commands = new Collection();

/**
 * Event handlerek betöltése
 * Az events mappából automatikusan betölti az összes .js fájlt
 */
function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    
    // Ellenőrizzük, hogy létezik-e az events mappa
    if (!fs.existsSync(eventsPath)) {
        console.log('⚠️  Events mappa nem található, létrehozás...');
        fs.mkdirSync(eventsPath, { recursive: true });
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    console.log(`📂 ${eventFiles.length} event fájl betöltése...`);
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
            const event = require(filePath);
            
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            
            console.log(`✅ Event betöltve: ${event.name}`);
        } catch (error) {
            console.error(`❌ Hiba az event betöltése során (${file}):`, error);
        }
    }
}

/**
 * Slash parancsok betöltése
 * A commands mappából automatikusan betölti az összes .js fájlt
 */
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    
    // Ellenőrizzük, hogy létezik-e a commands mappa
    if (!fs.existsSync(commandsPath)) {
        console.log('⚠️  Commands mappa nem található, létrehozás...');
        fs.mkdirSync(commandsPath, { recursive: true });
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    console.log(`📂 ${commandFiles.length} parancs fájl betöltése...`);
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Parancs betöltve: /${command.data.name}`);
            } else {
                console.log(`⚠️  A parancs hiányos: ${file}`);
            }
        } catch (error) {
            console.error(`❌ Hiba a parancs betöltése során (${file}):`, error);
        }
    }
}

/**
 * Slash parancsok regisztrálása Discord-on
 */
async function deployCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    
    if (!fs.existsSync(commandsPath)) {
        console.log('⚠️  Nincs parancs a regisztráláshoz.');
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }

    const rest = new REST().setToken(config.token);

    try {
        console.log(`🔄 ${commands.length} slash parancs regisztrálása...`);

        // Guild-specifikus parancsok regisztrálása (gyorsabb fejlesztéshez)
        if (config.guildId && config.guildId !== 'YOUR_GUILD_ID_HERE') {
            const data = await rest.put(
                Routes.applicationGuildCommands(client.user.id, config.guildId),
                { body: commands },
            );
            console.log(`✅ ${data.length} guild parancs sikeresen regisztrálva.`);
        } else {
            // Globális parancsok regisztrálása (lassabb, de minden szerveren működik)
            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
            console.log(`✅ ${data.length} globális parancs sikeresen regisztrálva.`);
        }
    } catch (error) {
        console.error('❌ Hiba a parancsok regisztrálása során:', error);
    }
}

/**
 * Minecraft szerver státusz figyelő indítása
 */
function startMinecraftMonitor() {
    if (!config.minecraft.enabled) {
        console.log('⚠️  Minecraft szerver figyelő kikapcsolva.');
        return;
    }

    try {
        const { startServerStatusMonitor } = require('./modules/serverStatus');
        startServerStatusMonitor(client, config.minecraft);
        console.log('✅ Minecraft szerver figyelő elindítva.');
    } catch (error) {
        console.error('❌ Hiba a Minecraft figyelő indítása során:', error);
    }
}

/**
 * Ticket rendszer inicializálása
 */
async function initializeTicketSystem() {
    try {
        const ticketSystem = require('./modules/ticketSystem');
        // Várunk egy kicsit, hogy a bot teljesen betöltődjön
        setTimeout(async () => {
            await ticketSystem.sendTicketMenu(client);
        }, 5000);
        console.log('✅ Ticket rendszer inicializálva.');
    } catch (error) {
        console.error('❌ Hiba a ticket rendszer inicializálása során:', error);
    }
}

/**
 * Bot indítási folyamat
 */
async function startBot() {
    console.log('🤖 Discord Multi-feature Bot indítása...\n');

    // Konfiguráció ellenőrzése
    if (!config.token || config.token === 'YOUR_DISCORD_BOT_TOKEN_HERE') {
        console.error('❌ HIBA: Bot token nincs beállítva a config.json fájlban!');
        process.exit(1);
    }

    // Modulok betöltése
    loadEvents();
    loadCommands();

    // Bot bejelentkezés
    try {
        await client.login(config.token);
    } catch (error) {
        console.error('❌ HIBA: Nem sikerült bejelentkezni:', error);
        process.exit(1);
    }
}

/**
 * Bot ready event - amikor a bot teljesen betöltődött
 */
client.once('ready', async () => {
    console.log(`\n🎉 ${client.user.tag} sikeresen online!`);
    console.log(`📊 Szerverek száma: ${client.guilds.cache.size}`);
    console.log(`👥 Felhasználók száma: ${client.users.cache.size}`);
    
    // Slash parancsok regisztrálása
    await deployCommands();
    
    // Minecraft figyelő indítása
    startMinecraftMonitor();
    
    // Ticket rendszer inicializálása
    await initializeTicketSystem();
    
    console.log('\n✅ Bot teljesen betöltődött és készen áll a használatra!\n');
});

/**
 * Hibakezelés
 */
process.on('unhandledRejection', error => {
    console.error('❌ Kezeletlen Promise elutasítás:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Kezeletlen kivétel:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Bot leállítása...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Bot leállítása...');
    client.destroy();
    process.exit(0);
});

// Bot indítása
startBot();
