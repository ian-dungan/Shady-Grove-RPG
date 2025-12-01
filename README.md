# Chronicles of the Shattered Crown - Browser RPG

Complete 2.5D browser-based SNES-style RPG with classes, combat, quests, inventory, and multiplayer.

## Quick Start

1. **Deploy Server to Render:**
   - Upload `server.js` and `package.json` to Render
   - Set start command: `npm start`
   - Copy your WebSocket URL

2. **Configure Game:**
   - Edit `gameConfig.js` line 83
   - Replace with your Render URL: `url: 'wss://your-app.onrender.com'`

3. **Play:**
   - Open `index.html` in browser
   - Or deploy to GitHub Pages

## Features

✅ 4 Classes (Warrior/Mage/Rogue/Cleric)
✅ Turn-based combat
✅ Level/XP/Gold systems
✅ Full inventory & items
✅ 6-quest story campaign
✅ Random encounters
✅ Boss fights
✅ Easy asset swapping

## Files

- `index.html` - Game page
- `game.js` - Engine with all systems
- `gameConfig.js` - **Customize everything here**
- `server.js` - WebSocket server
- `package.json` - Server deps

## Customize Assets

Edit `gameConfig.js` to swap sprites, items, enemies, quests - everything is config-driven.

## Controls

- Arrow Keys: Move
- Space: Action
- Buttons: Inventory/Quests/Stats

## Story

Retrieve 5 Crown fragments across dungeons to defeat the Dark Lord Malachar and save Eldoria.
