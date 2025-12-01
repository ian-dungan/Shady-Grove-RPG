// Game Configuration - Replace asset URLs with your own
const GameConfig = {
    // Asset Configuration - easily swap with your own assets
    assets: {
        characters: {
            warrior: { sprite: 'warrior', width: 32, height: 32, frames: 12 },
            mage: { sprite: 'mage', width: 32, height: 32, frames: 12 },
            rogue: { sprite: 'rogue', width: 32, height: 32, frames: 12 },
            cleric: { sprite: 'cleric', width: 32, height: 32, frames: 12 }
        },
        enemies: {
            goblin: { sprite: 'goblin', width: 32, height: 32, hp: 20, atk: 5, gold: 10, xp: 15 },
            orc: { sprite: 'orc', width: 32, height: 32, hp: 40, atk: 10, gold: 25, xp: 30 },
            dragon: { sprite: 'dragon', width: 64, height: 64, hp: 200, atk: 30, gold: 500, xp: 200 },
            skeleton: { sprite: 'skeleton', width: 32, height: 32, hp: 30, atk: 8, gold: 15, xp: 20 },
            darkLord: { sprite: 'darklord', width: 64, height: 64, hp: 500, atk: 50, gold: 1000, xp: 1000 }
        },
        items: {
            healthPotion: { name: 'Health Potion', effect: 'heal', value: 50, price: 25, icon: 'potion_red' },
            manaPotion: { name: 'Mana Potion', effect: 'mana', value: 30, price: 20, icon: 'potion_blue' },
            elixir: { name: 'Elixir', effect: 'fullHeal', value: 999, price: 100, icon: 'potion_gold' },
            ironSword: { name: 'Iron Sword', effect: 'attack', value: 10, price: 150, icon: 'sword_iron' },
            steelSword: { name: 'Steel Sword', effect: 'attack', value: 25, price: 500, icon: 'sword_steel' },
            legendSword: { name: 'Legendary Sword', effect: 'attack', value: 50, price: 0, icon: 'sword_legend' }
        },
        tilesets: {
            grass: 'tileset_grass',
            dungeon: 'tileset_dungeon',
            castle: 'tileset_castle'
        }
    },

    // Class Stats
    classes: {
        warrior: {
            name: 'Warrior',
            baseHP: 100,
            baseMP: 20,
            baseAtk: 15,
            baseDef: 10,
            hpGrowth: 10,
            mpGrowth: 2,
            atkGrowth: 3,
            defGrowth: 2
        },
        mage: {
            name: 'Mage',
            baseHP: 60,
            baseMP: 80,
            baseAtk: 8,
            baseDef: 5,
            hpGrowth: 5,
            mpGrowth: 8,
            atkGrowth: 2,
            defGrowth: 1
        },
        rogue: {
            name: 'Rogue',
            baseHP: 80,
            baseMP: 40,
            baseAtk: 12,
            baseDef: 7,
            hpGrowth: 7,
            mpGrowth: 4,
            atkGrowth: 3,
            defGrowth: 1
        },
        cleric: {
            name: 'Cleric',
            baseHP: 70,
            baseMP: 60,
            baseAtk: 10,
            baseDef: 8,
            hpGrowth: 6,
            mpGrowth: 6,
            atkGrowth: 2,
            defGrowth: 2
        }
    },

    // Story & Quests
    story: {
        title: "Chronicles of the Shattered Crown",
        intro: "The ancient kingdom of Eldoria lies in darkness. The Dark Lord Malachar has shattered the Crown of Light into 5 fragments, spreading chaos across the realm. You are the chosen hero who must retrieve the fragments, defeat the Dark Lord's generals, and restore peace.",
        
        objectives: [
            {
                id: 1,
                name: "Awaken the Hero",
                description: "Leave your village and seek the first crown fragment in the Forest of Whispers",
                location: { x: 150, y: 150 },
                reward: { gold: 100, xp: 50 }
            },
            {
                id: 2,
                name: "The Forest Fragment",
                description: "Defeat the Corrupted Guardian in the Forest Dungeon to claim the first fragment",
                boss: 'orc',
                location: { x: 80, y: 100 },
                reward: { gold: 200, xp: 150, item: 'ironSword' }
            },
            {
                id: 3,
                name: "Mountain's Call",
                description: "Journey to the Frozen Peaks and retrieve the second fragment from the Ice Caverns",
                boss: 'dragon',
                location: { x: 50, y: 50 },
                reward: { gold: 500, xp: 300 }
            },
            {
                id: 4,
                name: "Desert Secrets",
                description: "Cross the Scorching Wastes and enter the Ancient Pyramid to find the third fragment",
                boss: 'skeleton',
                location: { x: 200, y: 250 },
                reward: { gold: 750, xp: 400 }
            },
            {
                id: 5,
                name: "The Sunken City",
                description: "Dive into the depths of the Drowned Temple to recover the fourth fragment",
                boss: 'dragon',
                location: { x: 80, y: 280 },
                reward: { gold: 1000, xp: 500, item: 'steelSword' }
            },
            {
                id: 6,
                name: "The Final Confrontation",
                description: "Storm the Dark Citadel, defeat Malachar, and restore the Crown of Light",
                boss: 'darkLord',
                location: { x: 270, y: 50 },
                reward: { gold: 5000, xp: 2000, item: 'legendSword' }
            }
        ]
    },

    // Dungeon Configurations
    dungeons: [
        { name: 'Forest Dungeon', floors: 3, enemyTypes: ['goblin', 'orc'], boss: 'orc' },
        { name: 'Ice Caverns', floors: 5, enemyTypes: ['skeleton', 'orc'], boss: 'dragon' },
        { name: 'Ancient Pyramid', floors: 4, enemyTypes: ['skeleton', 'goblin'], boss: 'skeleton' },
        { name: 'Drowned Temple', floors: 6, enemyTypes: ['orc', 'skeleton'], boss: 'dragon' },
        { name: 'Dark Citadel', floors: 10, enemyTypes: ['orc', 'dragon', 'skeleton'], boss: 'darkLord' }
    ],

    // WebSocket Configuration
    websocket: {
        url: 'wss://your-render-app.onrender.com', // Replace with your Render WebSocket URL
        reconnectInterval: 3000
    },

    // Game Balance
    balance: {
        levelCap: 50,
        xpCurve: (level) => Math.floor(100 * Math.pow(level, 1.5)),
        goldDropMultiplier: 1.0,
        xpDropMultiplier: 1.0
    }
};

export default GameConfig;
