# Discord Multi-feature Bot - Telepítési és Konfigurációs Útmutató

## 📋 Áttekintés

Ez a Discord bot a következő funkciókat tartalmazza:

- **🤖 Automatikus rang kiosztás**: Új tagoknak automatikusan kioszt egy előre beállított rangot
- **👋 Üdvözlő és kilépő rendszer**: Szép embed üzenetek új tagoknak és kilépőknek külön csatornákban
- **🎫 Ticket rendszer**: Testreszabható ticket rendszer dropdown menüvel és kategóriákkal
- **💡 Ötlet beküldő rendszer**: `!otlet` paranccsal ötletek beküldése és szavazás
- **🎮 Minecraft szerver figyelő**: Szerver státusz figyelése és bot státusz frissítése
- **🏷️ Rang kiosztási rendszer**: `/rang` slash parancs rangok kiosztásához
- **📊 Részletes naplózás**: Minden esemény naplózása külön csatornába

## 🚀 Gyors Telepítés

### 1. Előfeltételek

- **Node.js** v16 vagy újabb verzió
- **Discord Developer Account**
- **Discord szerver** ahol tesztelni tudod a botot

### 2. Bot Létrehozása Discord Developer Portalon

1. Menj a [Discord Developer Portal](https://discord.com/developers/applications)-ra
2. Kattints a **"New Application"** gombra
3. Add meg a bot nevét és kattints **"Create"**
4. Bal oldali menüben kattints a **"Bot"** fülre
5. Kattints **"Add Bot"** majd **"Yes, do it!"**
6. **Fontos beállítások:**
   - ✅ **Privileged Gateway Intents** alatt kapcsold be:
     - `SERVER MEMBERS INTENT`
     - `MESSAGE CONTENT INTENT`
   - 📋 Másold ki a **Token**-t (ezt fogod használni a config.json-ban)

### 3. Bot Meghívása Szerverre

1. Developer Portal-ban menj a **"OAuth2"** > **"URL Generator"** fülre
2. **Scopes** alatt válaszd ki:
   - ✅ `bot`
   - ✅ `applications.commands`
3. **Bot Permissions** alatt válaszd ki:
   - ✅ `Send Messages`
   - ✅ `Use Slash Commands`
   - ✅ `Manage Roles`
   - ✅ `Manage Channels`
   - ✅ `Read Message History`
   - ✅ `Add Reactions`
   - ✅ `Embed Links`
   - ✅ `Attach Files`
4. Másold ki a generált URL-t és nyisd meg böngészőben
5. Válaszd ki a szervert és kattints **"Authorize"**

### 4. Projekt Telepítése

```bash
# Függőségek telepítése
npm install

# Bot indítása
npm start
```

## ⚙️ Konfiguráció

### config.json Beállítása

Nyisd meg a `config.json` fájlt és állítsd be a következő értékeket:

#### 🔑 Alapvető Beállítások

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN_HERE",     // Bot token a Developer Portal-ról
  "guildId": "YOUR_GUILD_ID_HERE",            // Szerver ID (fejlesztéshez)
  "prefix": "!otlet"                          // Ötlet parancs prefix
}
```

#### 🏷️ Automatikus Rang Kiosztás

```json
{
  "autoJoinRole": "ROLE_ID_HERE"              // Új tagoknak kiosztandó rang ID
}
```

**Rang ID megszerzése:**
1. Discord-ban kapcsold be a Developer Mode-ot (User Settings > Advanced > Developer Mode)
2. Jobb klikk a rangra > Copy ID

#### 👋 Üdvözlő és Kilépő Rendszer

```json
{
  "welcomeSystem": {
    "enabled": true,                          // Üdvözlő rendszer engedélyezése
    "channelId": "WELCOME_CHANNEL_ID_HERE",   // Üdvözlő csatorna ID
    "embed": {
      "title": "🎉 Üdvözlünk a szerveren!",
      "description": "───────────────────────────",
      "message": "Szia {user}! Örülünk, hogy csatlakoztál hozzánk.",
      "color": "#00FF00",
      "image": "https://images.pexels.com/photos/1222278/pexels-photo-1222278.jpeg"
    }
  },
  "leaveSystem": {
    "enabled": true,                          // Kilépő rendszer engedélyezése
    "channelId": "LEAVE_CHANNEL_ID_HERE",     // Kilépő csatorna ID
    "embed": {
      "title": "👋 Viszlát!",
      "description": "───────────────────────────",
      "message": "{user} elhagyta a szervert.",
      "color": "#FF6B6B",
      "image": "https://images.pexels.com/photos/1557238/pexels-photo-1557238.jpeg"
    }
  }
}
```

**Csatorna ID megszerzése:**
1. Discord-ban kapcsold be a Developer Mode-ot
2. Jobb klikk a csatornára > Copy ID

#### 🎫 Ticket Rendszer

```json
{
  "ticket": {
    "channelId": "TICKET_CHANNEL_ID_HERE",    // Csatorna ahol a ticket menü lesz
    "categoryId": "TICKET_CATEGORY_ID_HERE",  // Kategória ID a ticket csatornáknak
    "categories": [                           // Testreszabható kategóriák
      {
        "label": "🛠️ Technikai támogatás",
        "value": "technical",
        "description": "Technikai problémák és hibák"
      }
    ]
  }
}
```

#### 💡 Ötlet Rendszer

```json
{
  "ideaSubmission": {
    "channelId": "IDEA_CHANNEL_ID_HERE"       // Csatorna ahova az ötletek kerülnek
  }
}
```

#### 🎮 Minecraft Szerver Figyelő

```json
{
  "minecraft": {
    "enabled": true,                          // Engedélyezve/letiltva
    "host": "your-server.com",                // Szerver címe
    "port": 25565,                            // Szerver portja
    "statusInterval": 60000                   // Ellenőrzési gyakoriság (ms)
  }
}
```

#### 🏷️ Rang Kiosztási Rendszer

```json
{
  "rankAssignment": {
    "roles": {
      "VIP": "VIP_ROLE_ID_HERE",
      "Premium": "PREMIUM_ROLE_ID_HERE",
      "Member": "MEMBER_ROLE_ID_HERE"
    }
  }
}
```

#### 📊 Naplózás

```json
{
  "logging": {
    "enabled": true,
    "channelId": "LOG_CHANNEL_ID_HERE",       // Log csatorna ID
    "events": {
      "memberJoin": true,
      "ticketCreate": true,
      "ticketClose": true,
      "ideaSubmit": true,
      "rankAssign": true
    }
  }
}
```

## 🎯 Funkciók Használata

### 🤖 Automatikus Rang Kiosztás

- **Működés**: Automatikusan fut, amikor új tag csatlakozik
- **Beállítás**: `autoJoinRole` ID beállítása a config.json-ban
- **Jogosultságok**: Bot-nak `Manage Roles` jogosultság kell

### 👋 Üdvözlő és Kilépő Rendszer

- **Üdvözlő üzenetek**: Automatikusan küldi, amikor új tag csatlakozik
- **Kilépő üzenetek**: Automatikusan küldi, amikor tag elhagyja a szervert
- **Beállítás**: `welcomeSystem` és `leaveSystem` csatorna ID-k beállítása
- **Testreszabás**: Embed címek, színek, üzenetek és képek módosíthatók
- **Jogosultságok**: Bot-nak `Send Messages` és `Embed Links` jogosultság kell

### 🎫 Ticket Rendszer

1. **Ticket menü küldése**: Automatikusan elküldi a bot indításakor
2. **Ticket nyitása**: Felhasználók a dropdown menüből választanak kategóriát
3. **Ticket bezárása**: Bárki kattinthat a piros "Ticket bezárása" gombra

**Testreszabás:**
- Kategóriák módosítása a `config.json`-ban
- Embed színek és szövegek változtatása
- Jogosultságok beállítása ticket csatornákhoz

### 💡 Ötlet Beküldő Rendszer

**Használat:**
```
!otlet Ez egy fantasztikus ötlet a szerver fejlesztésére!
```

**Funkciók:**
- Automatikus embed formázás
- ✅ és ❌ reakciók hozzáadása
- Ötlet továbbítása külön csatornába

### 🎮 Minecraft Szerver Figyelő

**Bot státusz példák:**
- `🟢 12 játékos online` (ha a szerver elérhető)
- `🔴 Szerver offline` (ha a szerver nem elérhető)

**Beállítások:**
- `statusInterval`: Ellenőrzési gyakoriság milliszekundumban
- `host` és `port`: Szerver címe és portja

### 🏷️ Rang Kiosztási Rendszer

**Slash parancs használata:**
```
/rang név:VIP
/rang név:Premium felhasználó:@valaki
```

**Funkciók:**
- Saját rang kérése
- Moderátorok másoknak is kioszthatnak rangot
- Automatikus jogosultság ellenőrzés

## 🔧 Hibaelhárítás

### Gyakori Problémák

#### ❌ "Missing Permissions" hiba

**Megoldás:**
1. Ellenőrizd, hogy a bot rangja magasabb-e mint a kezelendő rangok
2. Bot jogosultságai:
   - `Manage Roles`
   - `Manage Channels`
   - `Send Messages`
   - `Use Slash Commands`

#### ❌ "Channel not found" hiba

**Megoldás:**
1. Ellenőrizd a csatorna ID-kat a config.json-ban
2. Győződj meg róla, hogy a bot látja a csatornákat
3. Developer Mode bekapcsolása és ID-k újra másolása

#### ❌ Slash parancsok nem jelennek meg

**Megoldás:**
1. Várj 1-2 órát (globális parancsok regisztrálása lassú)
2. Guild-specifikus parancsokhoz add meg a `guildId`-t
3. Bot újraindítása

#### ❌ Minecraft szerver nem elérhető

**Megoldás:**
1. Ellenőrizd a szerver címét és portját
2. Győződj meg róla, hogy a szerver fut
3. Tűzfal beállítások ellenőrzése

### Debug Módok

#### Console Logok

A bot részletes logokat ír a konzolra:
```
✅ Event betöltve: guildMemberAdd
🎫 Ticket menü sikeresen elküldve
💡 Ötlet beküldve: User#1234 - "Ez egy ötlet..."
```

#### Teszt Parancsok

Teszteld a funkciókat lépésről lépésre:

1. **Automatikus rang**: Hívj meg egy teszt felhasználót
2. **Ticket rendszer**: Próbáld ki a dropdown menüt
3. **Ötlet rendszer**: Küldj egy `!otlet teszt` üzenetet
4. **Rang kiosztás**: Használd a `/rang` parancsot

## 🔒 Biztonsági Megjegyzések

### Token Biztonság

- ❌ **SOHA** ne oszd meg a bot token-t
- ❌ **SOHA** ne commitold a token-t git repository-ba
- ✅ Használj környezeti változókat production környezetben

### Jogosultságok

- Csak a szükséges jogosultságokat add meg a bot-nak
- Rendszeresen ellenőrizd a bot tevékenységét
- Korlátozd a rang kiosztási jogosultságokat

## 🚀 Production Telepítés

### Környezeti Változók

Hozz létre egy `.env` fájlt:
```env
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_guild_id_here
```

### PM2 Használata

```bash
# PM2 telepítése
npm install -g pm2

# Bot indítása PM2-vel
pm2 start index.js --name "discord-bot"

# Automatikus újraindítás beállítása
pm2 startup
pm2 save
```

### Docker Használata

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "index.js"]
```

## 📞 Támogatás

### Hasznos Linkek

- [Discord.js Dokumentáció](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Node.js Letöltés](https://nodejs.org/)

### Gyakori Kérdések

**Q: Hogyan változtathatom meg a bot prefix-ét?**
A: Módosítsd a `prefix` értékét a `config.json`-ban.

**Q: Lehet több Minecraft szervert figyelni?**
A: Jelenleg egy szerver támogatott, de a kód könnyen bővíthető.

**Q: Hogyan adhatok hozzá új ticket kategóriát?**
A: Bővítsd a `config.json` `ticket.categories` tömbjét.

**Q: Működik a bot több szerveren?**
A: Igen, de minden szerveren külön konfigurációt igényel.

---

## 📝 Changelog

### v1.0.0
- ✅ Automatikus rang kiosztás
- ✅ Üdvözlő és kilépő rendszer modern embed-ekkel
- ✅ Ticket rendszer dropdown menüvel
- ✅ Ötlet beküldő rendszer
- ✅ Minecraft szerver figyelő
- ✅ Rang kiosztási slash parancs
- ✅ Részletes naplózás
- ✅ Teljes konfiguráció támogatás

---

**Készítette:** Discord Bot Developer  
**Utolsó frissítés:** 2024  
**Verzió:** 1.0.0
