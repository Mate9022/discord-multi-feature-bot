# 🤖 Discord Multi-feature Bot

Egy teljes körű Discord bot magyar nyelven, amely több hasznos funkciót egyesít egy helyen.

## ✨ Funkciók

### 🤖 Automatikus Rang Kiosztás
- Új tagoknak automatikusan kioszt egy előre beállított rangot
- Teljes jogosultság ellenőrzés és hibakezelés
- Részletes naplózás

### 🎫 Ticket Rendszer
- Modern dropdown menüs ticket rendszer
- Testreszabható kategóriák
- Automatikus csatorna létrehozás `ticket-felhasználónév` névvel
- Egyszerű ticket bezárás gombbal
- Jogosultság alapú hozzáférés

### 💡 Ötlet Beküldő Rendszer
- `!otlet` paranccsal ötletek beküldése
- Automatikus embed formázás
- ✅ és ❌ reakciók a szavazáshoz
- Külön csatornába továbbítás

### 🎮 Minecraft Szerver Figyelő
- Valós idejű szerver státusz figyelés
- Bot státusz frissítése játékosok számával
- Offline/Online jelzés
- Testreszabható ellenőrzési intervallum

### 🏷️ Rang Kiosztási Rendszer
- `/rang` slash parancs
- Dropdown menüs rang választás
- Moderátorok másoknak is kioszthatnak rangot
- Webhook támogatás (bővíthető)

### 📊 Részletes Naplózás
- Minden esemény naplózása külön csatornába
- Színes embed üzenetek
- Felhasználó információk és időbélyegek

## 🚀 Gyors Indítás

### 1. Telepítés
```bash
npm install
```

### 2. Konfiguráció
1. Másold át a bot token-t a `config.json`-ba
2. Állítsd be a csatorna és rang ID-kat
3. Testreszabhatod az üzeneteket és beállításokat

### 3. Indítás
```bash
npm start
```

## 📋 Követelmények

- **Node.js** v16 vagy újabb
- **Discord Bot Token**
- **Szerver jogosultságok:**
  - Manage Roles
  - Manage Channels
  - Send Messages
  - Use Slash Commands
  - Add Reactions

## 📖 Dokumentáció

Részletes telepítési és konfigurációs útmutató: [`docs/setup.md`](docs/setup.md)

## 🔧 Konfiguráció

Minden beállítás a `config.json` fájlban található:

- 🎨 **Embed színek és szövegek**
- 🏷️ **Rang ID-k és nevek**
- 📝 **Csatorna ID-k**
- ⏰ **Időzítések és intervallumok**
- 🎫 **Ticket kategóriák**
- 🎮 **Minecraft szerver beállítások**

## 📁 Projekt Struktúra

```
├── index.js              # Fő belépési pont
├── config.json           # Konfiguráció
├── package.json          # Függőségek
├── events/               # Event handlerek
│   ├── guildMemberAdd.js # Automatikus rang kiosztás
│   ├── interactionCreate.js # Slash parancsok és gombok
│   └── messageCreate.js  # Üzenet események
├── commands/             # Slash parancsok
│   └── rang.js          # Rang kiosztási parancs
├── modules/              # Funkció modulok
│   ├── ticketSystem.js  # Ticket rendszer
│   ├── ideaSubmission.js # Ötlet beküldés
│   └── serverStatus.js  # Minecraft figyelő
└── docs/                # Dokumentáció
    └── setup.md         # Telepítési útmutató
```

## 🎯 Használat

### Automatikus Funkciók
- **Új tag csatlakozás**: Automatikus rang kiosztás
- **Minecraft figyelő**: Folyamatos szerver státusz frissítés

### Felhasználói Parancsok
- **`!otlet <szöveg>`**: Ötlet beküldése
- **`/rang név:<rang>`**: Rang kérése
- **Ticket rendszer**: Dropdown menü használata

### Moderátori Funkciók
- **`/rang név:<rang> felhasználó:<@user>`**: Rang kiosztása másnak
- **Ticket bezárás**: Bárki bezárhatja a ticket-eket

## 🔒 Biztonság

- ✅ Teljes jogosultság ellenőrzés
- ✅ Input validáció
- ✅ Hibakezelés minden funkcióban
- ✅ Rate limiting védelem
- ✅ Részletes naplózás

## 🛠️ Testreszabás

### Új Ticket Kategória Hozzáadása
```json
{
  "label": "🆕 Új Kategória",
  "value": "new_category",
  "description": "Új kategória leírása"
}
```

### Új Rang Hozzáadása
```json
{
  "rankAssignment": {
    "roles": {
      "ÚjRang": "ROLE_ID_HERE"
    }
  }
}
```

### Üzenetek Testreszabása
Minden üzenet szöveg módosítható a `config.json`-ban.

## 📊 Statisztikák

A bot automatikusan naplózza:
- Új tagok csatlakozását
- Ticket létrehozásokat és bezárásokat
- Ötlet beküldéseket
- Rang kiosztásokat
- Minecraft szerver státusz változásokat

## 🔄 Frissítések

### v1.0.0 - Kezdeti Verzió
- ✅ Minden alapfunkció implementálva
- ✅ Teljes magyar lokalizáció
- ✅ Részletes dokumentáció
- ✅ Hibakezelés és naplózás

## 🤝 Közreműködés

1. Fork-old a projektet
2. Hozz létre egy feature branch-et
3. Commitold a változtatásokat
4. Push-old a branch-et
5. Nyiss egy Pull Request-et

## 📞 Támogatás

- 📖 [Részletes dokumentáció](docs/setup.md)
- 🐛 Issues a GitHub-on
- 💬 Discord szerver támogatás

## 📄 Licenc

MIT License - Szabadon használható és módosítható.

---

**Készítette:** Discord Bot Developer  
**Verzió:** 1.0.0  
**Utolsó frissítés:** 2024

⭐ Ha tetszik a projekt, adj egy csillagot a GitHub-on!
