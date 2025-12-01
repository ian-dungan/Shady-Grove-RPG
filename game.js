import GameConfig from './gameConfig.js';

// ===== STATIC WORLD MAP =====
class StaticWorldMap {
    static createWorldMap(width, height) {
        const worldMap = [];
        
        for (let y = 0; y < height; y++) {
            worldMap[y] = [];
            for (let x = 0; x < width; x++) {
                worldMap[y][x] = this.getBiomeForPosition(x, y, width, height);
            }
        }
        
        return worldMap;
    }
    
    static getBiomeForPosition(x, y, width, height) {
        // Define regions of the map
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Starting Area - Center (Grassland/Plains)
        if (this.inCircle(x, y, centerX, centerY, 30)) {
            return Math.random() < 0.7 ? 'grassland' : 'plains';
        }
        
        // Northern Mountains & Snow (Top 1/4)
        if (y < height * 0.25) {
            if (y < height * 0.15) {
                return 'snow';
            }
            return Math.random() < 0.6 ? 'mountain' : 'hills';
        }
        
        // Southern Desert (Bottom 1/4)
        if (y > height * 0.75) {
            return Math.random() < 0.8 ? 'desert' : 'plains';
        }
        
        // Western Ocean (Left edge)
        if (x < 15) {
            return y < height * 0.3 || y > height * 0.7 ? 'water' : 'beach';
        }
        if (x < 25 && (y < height * 0.3 || y > height * 0.7)) {
            return 'beach';
        }
        
        // Eastern Ocean (Right edge)
        if (x > width - 15) {
            return y < height * 0.3 || y > height * 0.7 ? 'water' : 'beach';
        }
        if (x > width - 25 && (y < height * 0.3 || y > height * 0.7)) {
            return 'beach';
        }
        
        // Dark Forest (Northwest quadrant)
        if (x < centerX - 20 && y > height * 0.3 && y < centerY) {
            return 'forest';
        }
        
        // Light Forest (Northeast quadrant)
        if (x > centerX + 20 && y > height * 0.3 && y < centerY) {
            return Math.random() < 0.6 ? 'forest' : 'grassland';
        }
        
        // Hills Region (Southwest)
        if (x < centerX && y > centerY && y < height * 0.7) {
            return Math.random() < 0.5 ? 'hills' : 'plains';
        }
        
        // Central Lake
        if (this.inCircle(x, y, centerX + 40, centerY - 20, 12)) {
            return 'water';
        }
        if (this.inCircle(x, y, centerX + 40, centerY - 20, 15)) {
            return 'beach';
        }
        
        // Mountain Range (Eastern ridge)
        if (x > width - 60 && x < width - 30 && y > height * 0.25 && y < height * 0.6) {
            return 'mountain';
        }
        
        // Default to grassland
        return 'grassland';
    }
    
    static inCircle(x, y, cx, cy, radius) {
        const dx = x - cx;
        const dy = y - cy;
        return (dx * dx + dy * dy) < (radius * radius);
    }
    
    static inRectangle(x, y, rx, ry, width, height) {
        return x >= rx && x < rx + width && y >= ry && y < ry + height;
    }
}

// ===== TILE RENDERER =====
class TileRenderer {
    static createDetailedTile(scene, biome, x, y) {
        const tileSize = 32;
        const baseX = x * tileSize;
        const baseY = y * tileSize;
        
        // Create a single rectangle for each tile instead of using graphics
        let color1, color2;
        
        switch (biome) {
            case 'water':
                color1 = 0x1a5490;
                color2 = 0x0d3a63;
                break;
            case 'beach':
                color1 = 0xf4d03f;
                color2 = 0xe9c46a;
                break;
            case 'plains':
                color1 = 0x52c234;
                color2 = 0x45a329;
                break;
            case 'grassland':
                color1 = 0x27ae60;
                color2 = 0x229954;
                break;
            case 'forest':
                color1 = 0x196f3d;
                color2 = 0x145a32;
                break;
            case 'hills':
                color1 = 0x7d6608;
                color2 = 0x6e5a07;
                break;
            case 'mountain':
                color1 = 0x566573;
                color2 = 0x34495e;
                break;
            case 'desert':
                color1 = 0xf39c12;
                color2 = 0xe67e22;
                break;
            case 'snow':
                color1 = 0xf8f9f9;
                color2 = 0xecf0f1;
                break;
            default:
                color1 = 0x27ae60;
                color2 = 0x229954;
        }
        
        // Use checkerboard pattern
        const useColor1 = (x + y) % 2 === 0;
        const tile = scene.add.rectangle(
            baseX + tileSize/2,
            baseY + tileSize/2,
            tileSize,
            tileSize,
            useColor1 ? color1 : color2
        );
        tile.setDepth(-50);
    }
}

// ===== SPRITE GENERATOR (condensed) =====
class SpriteGenerator {
    static createCharacterSprite(scene, className) {
        const graphics = scene.add.graphics();
        const colors = {
            warrior: { primary: 0xc0392b, secondary: 0xe74c3c, accent: 0xf39c12 },
            mage: { primary: 0x2980b9, secondary: 0x3498db, accent: 0x9b59b6 },
            rogue: { primary: 0x27ae60, secondary: 0x2ecc71, accent: 0x16a085 },
            cleric: { primary: 0xf39c12, secondary: 0xf1c40f, accent: 0xecf0f1 }
        };
        const color = colors[className] || colors.warrior;
        
        graphics.fillStyle(color.primary);
        graphics.fillRect(4, 8, 24, 20);
        graphics.fillStyle(0xfdbcb4);
        graphics.fillRect(8, 0, 16, 12);
        graphics.fillStyle(color.secondary);
        graphics.fillRect(0, 12, 6, 12);
        graphics.fillRect(26, 12, 6, 12);
        graphics.fillRect(8, 28, 6, 4);
        graphics.fillRect(18, 28, 6, 4);
        graphics.fillStyle(color.accent);
        graphics.fillRect(12, 12, 8, 8);
        
        graphics.generateTexture(`char_${className}`, 32, 32);
        graphics.destroy();
    }
    
    static createEnemySprite(scene, type) {
        const graphics = scene.add.graphics();
        const enemies = {
            goblin: { color: 0x27ae60, size: 32, eyes: 0xff0000 },
            orc: { color: 0x16a085, size: 32, eyes: 0xffa500 },
            skeleton: { color: 0xecf0f1, size: 32, eyes: 0x000000 },
            dragon: { color: 0xe74c3c, size: 64, eyes: 0xffd700 },
            darkLord: { color: 0x8e44ad, size: 64, eyes: 0xff0000 }
        };
        const enemy = enemies[type] || enemies.goblin;
        const s = enemy.size;
        
        graphics.fillStyle(enemy.color);
        graphics.fillRect(s * 0.25, s * 0.3, s * 0.5, s * 0.6);
        graphics.fillCircle(s * 0.5, s * 0.25, s * 0.2);
        graphics.fillStyle(enemy.eyes);
        graphics.fillCircle(s * 0.4, s * 0.22, s * 0.06);
        graphics.fillCircle(s * 0.6, s * 0.22, s * 0.06);
        
        if (type === 'dragon' || type === 'darkLord') {
            graphics.fillStyle(0x2c3e50);
            graphics.fillTriangle(s * 0.3, s * 0.15, s * 0.35, s * 0.05, s * 0.4, s * 0.15);
            graphics.fillTriangle(s * 0.6, s * 0.15, s * 0.65, s * 0.05, s * 0.7, s * 0.15);
        }
        
        graphics.generateTexture(`enemy_${type}`, s, s);
        graphics.destroy();
    }
    
    static createParticle(scene, color) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture(`particle_${color}`, 8, 8);
        graphics.destroy();
    }
}

// ===== PLAYER CLASS (same as before) =====
class Player {
    constructor(className) {
        const classData = GameConfig.classes[className];
        this.className = className;
        this.name = classData.name;
        this.level = 1;
        this.xp = 0;
        this.gold = 100;
        
        this.maxHP = classData.baseHP;
        this.currentHP = this.maxHP;
        this.maxMP = classData.baseMP;
        this.currentMP = this.maxMP;
        this.attack = classData.baseAtk;
        this.defense = classData.baseDef;
        
        this.hpGrowth = classData.hpGrowth;
        this.mpGrowth = classData.mpGrowth;
        this.atkGrowth = classData.atkGrowth;
        this.defGrowth = classData.defGrowth;
        
        this.inventory = [
            { ...GameConfig.assets.items.healthPotion, quantity: 3 },
            { ...GameConfig.assets.items.manaPotion, quantity: 2 }
        ];
        
        this.equipment = { weapon: null, armor: null };
        this.completedQuests = [];
        this.currentQuest = 0;
    }
    
    gainXP(amount) {
        this.xp += amount;
        const xpNeeded = GameConfig.balance.xpCurve(this.level);
        while (this.xp >= xpNeeded && this.level < GameConfig.balance.levelCap) {
            this.levelUp();
        }
        updateUI();
    }
    
    levelUp() {
        this.level++;
        this.maxHP += this.hpGrowth;
        this.maxMP += this.mpGrowth;
        this.attack += this.atkGrowth;
        this.defense += this.defGrowth;
        this.currentHP = this.maxHP;
        this.currentMP = this.maxMP;
        showMessage(`🎊 LEVEL UP! Now Level ${this.level}!`, 'gold');
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - Math.floor(this.defense / 2));
        this.currentHP = Math.max(0, this.currentHP - actualDamage);
        updateUI();
        return actualDamage;
    }
    
    heal(amount) {
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
        updateUI();
    }
    
    restoreMana(amount) {
        this.currentMP = Math.min(this.maxMP, this.currentMP + amount);
        updateUI();
    }
    
    addGold(amount) {
        this.gold += amount;
        updateUI();
    }
    
    addItem(item) {
        const existing = this.inventory.find(i => i.name === item.name);
        if (existing) {
            existing.quantity++;
        } else {
            this.inventory.push({ ...item, quantity: 1 });
        }
    }
    
    useItem(itemName) {
        const item = this.inventory.find(i => i.name === itemName);
        if (!item || item.quantity <= 0) return false;
        
        switch (item.effect) {
            case 'heal':
                this.heal(item.value);
                showMessage(`✨ ${item.name} +${item.value} HP!`, 'green');
                break;
            case 'mana':
                this.restoreMana(item.value);
                showMessage(`💎 ${item.name} +${item.value} MP!`, 'blue');
                break;
            case 'fullHeal':
                this.currentHP = this.maxHP;
                this.currentMP = this.maxMP;
                showMessage(`⭐ ${item.name}! Fully Restored!`, 'gold');
                break;
        }
        
        item.quantity--;
        if (item.quantity <= 0) {
            this.inventory = this.inventory.filter(i => i.name !== itemName);
        }
        updateUI();
        return true;
    }
}

// ===== ENEMY CLASS =====
class Enemy {
    constructor(type) {
        const data = GameConfig.assets.enemies[type];
        this.type = type;
        this.maxHP = data.hp;
        this.currentHP = this.maxHP;
        this.attack = data.atk;
        this.goldDrop = data.gold;
        this.xpDrop = data.xp;
    }
    
    takeDamage(damage) {
        this.currentHP = Math.max(0, this.currentHP - damage);
        return this.currentHP <= 0;
    }
}

// ===== COMBAT SYSTEM =====
class CombatSystem {
    constructor(scene, player, enemy) {
        this.scene = scene;
        this.player = player;
        this.enemy = enemy;
        this.turn = 'player';
        this.active = true;
    }
    
    playerAttack() {
        if (this.turn !== 'player' || !this.active) return;
        
        const damage = Math.floor(this.player.attack * (0.8 + Math.random() * 0.4));
        const killed = this.enemy.takeDamage(damage);
        
        this.scene.cameras.main.shake(200, 0.005);
        this.scene.createHitParticles(this.scene.cameras.main.scrollX + 400, this.scene.cameras.main.scrollY + 250, 0xff0000);
        
        showMessage(`⚔️ Attack! ${damage} damage!`, 'red');
        this.scene.showFloatingDamage(this.scene.cameras.main.scrollX + 400, this.scene.cameras.main.scrollY + 250, damage, 'red');
        
        if (killed) {
            this.victory();
        } else {
            this.scene.updateCombatUI();
            this.turn = 'enemy';
            this.scene.time.delayedCall(1000, () => this.enemyAttack());
        }
    }
    
    enemyAttack() {
        if (!this.active) return;
        
        const damage = Math.floor(this.enemy.attack * (0.8 + Math.random() * 0.4));
        this.player.takeDamage(damage);
        
        this.scene.cameras.main.shake(150, 0.004);
        this.scene.createHitParticles(this.scene.cameras.main.scrollX + 400, this.scene.cameras.main.scrollY + 500, 0xff6b6b);
        
        showMessage(`💥 Enemy attacks! ${damage} damage!`, 'orange');
        this.scene.showFloatingDamage(this.scene.cameras.main.scrollX + 400, this.scene.cameras.main.scrollY + 480, damage, 'orange');
        
        if (this.player.currentHP <= 0) {
            this.defeat();
        } else {
            this.turn = 'player';
        }
    }
    
    victory() {
        this.active = false;
        this.player.addGold(this.enemy.goldDrop);
        this.player.gainXP(this.enemy.xpDrop);
        
        this.scene.createVictoryParticles();
        showMessage(`🏆 Victory! +${this.enemy.xpDrop} XP, +${this.enemy.goldDrop} Gold!`, 'gold');
        
        this.scene.time.delayedCall(2500, () => {
            this.scene.endCombat(true);
        });
    }
    
    defeat() {
        this.active = false;
        showMessage('💀 Defeated... Respawning...', 'red');
        this.scene.time.delayedCall(2000, () => {
            this.player.currentHP = Math.floor(this.player.maxHP / 2);
            this.player.gold = Math.floor(this.player.gold * 0.8);
            updateUI();
            this.scene.endCombat(false);
        });
    }
}

// ===== MAIN GAME SCENE =====
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    create() {
        this.player = new Player('warrior');
        window.gamePlayer = this.player;
        
        // Generate sprites
        SpriteGenerator.createCharacterSprite(this, 'warrior');
        SpriteGenerator.createCharacterSprite(this, 'mage');
        SpriteGenerator.createCharacterSprite(this, 'rogue');
        SpriteGenerator.createCharacterSprite(this, 'cleric');
        
        SpriteGenerator.createEnemySprite(this, 'goblin');
        SpriteGenerator.createEnemySprite(this, 'orc');
        SpriteGenerator.createEnemySprite(this, 'skeleton');
        SpriteGenerator.createEnemySprite(this, 'dragon');
        SpriteGenerator.createEnemySprite(this, 'darkLord');
        
        SpriteGenerator.createParticle(this, 0xff0000);
        SpriteGenerator.createParticle(this, 0x00ff00);
        SpriteGenerator.createParticle(this, 0x0000ff);
        SpriteGenerator.createParticle(this, 0xffd700);
        
        this.createMassiveWorld();
        this.createPlayerSprite();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.actionKey = this.input.keyboard.addKey('SPACE');
        
        this.connectWebSocket();
        
        updateUI();
        showMessage('🗡️ Chronicles of the Shattered Crown - Explore the vast world!', 'cyan');
    }
    
    createMassiveWorld() {
        // MASSIVE WORLD - 300x300 tiles (STATIC MAP)
        this.worldWidth = 300;
        this.worldHeight = 300;
        this.tileSize = 32;
        
        console.log('Generating static world: ' + this.worldWidth + 'x' + this.worldHeight + ' tiles...');
        
        // Generate STATIC terrain map
        this.worldMap = StaticWorldMap.createWorldMap(this.worldWidth, this.worldHeight);
        
        // Render tiles
        this.renderStaticWorld();
        
        // Add world decorations in FIXED positions
        this.addStaticDecorations();
        
        // Place quest markers
        this.placeQuestMarkers();
        
        console.log('Static world loaded!');
    }
    
    renderStaticWorld() {
        const chunkSize = 20;
        const chunksX = Math.ceil(this.worldWidth / chunkSize);
        const chunksY = Math.ceil(this.worldHeight / chunkSize);
        
        for (let cy = 0; cy < chunksY; cy++) {
            for (let cx = 0; cx < chunksX; cx++) {
                const startX = cx * chunkSize;
                const startY = cy * chunkSize;
                const endX = Math.min(startX + chunkSize, this.worldWidth);
                const endY = Math.min(startY + chunkSize, this.worldHeight);
                
                for (let y = startY; y < endY; y++) {
                    for (let x = startX; x < endX; x++) {
                        const biome = this.worldMap[y][x];
                        TileRenderer.createDetailedTile(this, biome, x, y);
                    }
                }
            }
        }
    }
    
    addStaticDecorations() {
        // Fixed seed for consistent decoration placement
        const seed = 12345;
        let randomIndex = 0;
        
        const seededRandom = () => {
            randomIndex++;
            const x = Math.sin(randomIndex * seed) * 10000;
            return x - Math.floor(x);
        };
        
        // Add decorations in fixed positions based on biome
        for (let i = 0; i < 2000; i++) {
            const x = Math.floor(seededRandom() * this.worldWidth);
            const y = Math.floor(seededRandom() * this.worldHeight);
            const biome = this.worldMap[y][x];
            
            const worldX = x * this.tileSize + this.tileSize/2;
            const worldY = y * this.tileSize + this.tileSize/2;
            
            if (biome === 'forest') {
                this.addTree(worldX, worldY, 'dark');
            } else if (biome === 'grassland' && seededRandom() < 0.3) {
                this.addTree(worldX, worldY, 'light');
            } else if (biome === 'mountain' && seededRandom() < 0.5) {
                this.addRock(worldX, worldY);
            } else if (biome === 'desert' && seededRandom() < 0.3) {
                this.addCactus(worldX, worldY);
            } else if (biome === 'snow' && seededRandom() < 0.4) {
                this.addIceCrystal(worldX, worldY);
            }
        }
        
        // Add fixed structures
        this.addStaticStructures();
    }
    
    addTree(x, y, type) {
        const trunk = this.add.rectangle(x, y + 10, 8, 20, 0x654321);
        const leafColor = type === 'dark' ? 0x1e7d3d : 0x27ae60;
        const leaves = this.add.circle(x, y - 6, 14, leafColor);
        leaves.setStrokeStyle(2, leafColor - 0x111111);
        trunk.setDepth(5);
        leaves.setDepth(5);
        
        this.tweens.add({
            targets: [trunk, leaves],
            x: x + Math.random() * 3 - 1.5,
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    addRock(x, y) {
        const rock = this.add.ellipse(x, y, 16, 12, 0x5d6d7e);
        rock.setStrokeStyle(2, 0x34495e);
        rock.setDepth(5);
    }
    
    addCactus(x, y) {
        const cactus = this.add.rectangle(x, y, 6, 24, 0x27ae60);
        cactus.setDepth(5);
        
        // Arms
        const arm1 = this.add.rectangle(x - 4, y - 4, 8, 4, 0x27ae60);
        const arm2 = this.add.rectangle(x + 4, y + 2, 8, 4, 0x27ae60);
        arm1.setDepth(5);
        arm2.setDepth(5);
    }
    
    addIceCrystal(x, y) {
        const crystal = this.add.triangle(x, y - 6, 0, 12, 6, 0, 12, 12, 0x85c1e9);
        crystal.setStrokeStyle(1, 0x5dade2);
        crystal.setDepth(5);
        
        this.tweens.add({
            targets: crystal,
            alpha: 0.7,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }
    
    addStaticStructures() {
        // Fixed locations for major structures
        const structures = [
            { x: 150, y: 150, type: 'village', name: 'Starting Village' },
            { x: 80, y: 100, type: 'dungeon', name: 'Forest Dungeon' },
            { x: 50, y: 40, type: 'castle', name: 'Ice Castle' },
            { x: 200, y: 250, type: 'dungeon', name: 'Desert Pyramid' },
            { x: 80, y: 270, type: 'temple', name: 'Water Temple' },
            { x: 270, y: 50, type: 'castle', name: 'Dark Citadel' },
            { x: 220, y: 180, type: 'town', name: 'Trade City' },
            { x: 60, y: 180, type: 'village', name: 'Forest Village' }
        ];
        
        structures.forEach(struct => {
            this.addStructure(struct.x, struct.y, struct.type, struct.name);
        });
    }
    
    addStructure(tileX, tileY, type, name) {
        const x = tileX * this.tileSize;
        const y = tileY * this.tileSize;
        
        if (type === 'village' || type === 'town') {
            const size = type === 'town' ? 5 : 3;
            for (let dy = 0; dy < size; dy++) {
                for (let dx = 0; dx < size; dx++) {
                    const houseX = x + dx * 40;
                    const houseY = y + dy * 40;
                    
                    // House body
                    const house = this.add.rectangle(houseX, houseY, 32, 32, 0x8b4513);
                    house.setStrokeStyle(2, 0x654321);
                    house.setDepth(10);
                    
                    // Roof
                    const roof = this.add.triangle(
                        houseX, houseY - 20,
                        0, 20, 16, 0, 32, 20,
                        0xc0392b
                    );
                    roof.setDepth(11);
                    
                    // Door
                    const door = this.add.rectangle(houseX, houseY + 8, 8, 12, 0x654321);
                    door.setDepth(11);
                }
            }
            
            // Add sign with name
            const sign = this.add.text(x + 20, y - 40, name || type.toUpperCase(), {
                fontSize: '11px',
                color: '#ffd700',
                backgroundColor: '#2c3e50',
                padding: { x: 8, y: 4 }
            });
            sign.setDepth(20);
            
        } else if (type === 'castle') {
            // Large castle structure
            const castle = this.add.rectangle(x, y, 80, 80, 0x7f8c8d);
            castle.setStrokeStyle(4, 0x2c3e50);
            castle.setDepth(10);
            
            // Towers
            for (let i = 0; i < 4; i++) {
                const tx = x + (i % 2) * 70 - 35;
                const ty = y + Math.floor(i / 2) * 70 - 35;
                const tower = this.add.rectangle(tx, ty, 20, 40, 0x566573);
                tower.setDepth(11);
                
                const towerTop = this.add.triangle(tx, ty - 25, 0, 15, 10, 0, 20, 15, 0xc0392b);
                towerTop.setDepth(12);
            }
            
            // Castle name
            const sign = this.add.text(x, y - 60, name || 'CASTLE', {
                fontSize: '12px',
                color: '#ffd700',
                backgroundColor: '#2c3e50',
                padding: { x: 10, y: 5 }
            });
            sign.setOrigin(0.5);
            sign.setDepth(20);
            
        } else if (type === 'dungeon') {
            // Dark dungeon entrance
            const entrance = this.add.rectangle(x, y, 50, 50, 0x2c3e50);
            entrance.setStrokeStyle(3, 0x1a252f);
            entrance.setDepth(10);
            
            // Door
            const door = this.add.rectangle(x, y, 30, 40, 0x000000);
            door.setDepth(11);
            
            // Pillars
            const leftPillar = this.add.rectangle(x - 20, y, 8, 50, 0x566573);
            const rightPillar = this.add.rectangle(x + 20, y, 8, 50, 0x566573);
            leftPillar.setDepth(11);
            rightPillar.setDepth(11);
            
            // Sign
            const sign = this.add.text(x, y - 40, name || 'DUNGEON', {
                fontSize: '11px',
                color: '#ff6b6b',
                backgroundColor: '#1a252f',
                padding: { x: 8, y: 4 }
            });
            sign.setOrigin(0.5);
            sign.setDepth(20);
            
        } else if (type === 'temple') {
            // Temple structure
            const temple = this.add.rectangle(x, y, 60, 60, 0x3498db);
            temple.setStrokeStyle(3, 0x2980b9);
            temple.setDepth(10);
            
            // Roof
            const roof = this.add.triangle(x, y - 40, 0, 20, 30, 0, 60, 20, 0x5dade2);
            roof.setDepth(11);
            
            // Columns
            for (let i = 0; i < 3; i++) {
                const col = this.add.rectangle(x - 20 + i * 20, y + 10, 6, 40, 0xecf0f1);
                col.setDepth(11);
            }
            
            // Sign
            const sign = this.add.text(x, y - 50, name || 'TEMPLE', {
                fontSize: '11px',
                color: '#3498db',
                backgroundColor: '#ecf0f1',
                padding: { x: 8, y: 4 }
            });
            sign.setOrigin(0.5);
            sign.setDepth(20);
        }
    }
    
    placeQuestMarkers() {
        GameConfig.story.objectives.forEach((quest, index) => {
            if (index === this.player.currentQuest) {
                const x = quest.location.x * this.tileSize;
                const y = quest.location.y * this.tileSize;
                
                const marker = this.add.circle(x, y, 24, 0xffd700);
                marker.setStrokeStyle(4, 0xf39c12);
                marker.questId = quest.id;
                marker.setDepth(15);
                
                this.physics.add.existing(marker);
                this.physics.add.overlap(this.playerSprite, marker, () => this.triggerQuest(quest));
                
                this.tweens.add({
                    targets: marker,
                    scale: 1.4,
                    alpha: 0.5,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                const emitter = this.add.particles(x, y, `particle_${0xffd700}`, {
                    speed: { min: 30, max: 50 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 0.6, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 1200,
                    frequency: 150,
                    quantity: 1
                });
                emitter.setDepth(16);
            }
        });
    }
    
    createPlayerSprite() {
        // Start player in the center of the map
        const startX = (this.worldWidth / 2) * this.tileSize;
        const startY = (this.worldHeight / 2) * this.tileSize;
        
        this.playerSprite = this.add.sprite(startX, startY, `char_${this.player.className}`);
        this.playerSprite.setScale(1.5);
        this.physics.add.existing(this.playerSprite);
        this.playerSprite.body.setSize(24, 28);
        this.playerSprite.setDepth(50);
        
        this.playerShadow = this.add.ellipse(startX, startY + 20, 28, 10, 0x000000, 0.4);
        this.playerShadow.setDepth(49);
        
        this.playerGlow = this.add.circle(startX, startY, 24, 0x3498db, 0.15);
        this.playerGlow.setDepth(48);
        
        this.tweens.add({
            targets: this.playerGlow,
            scale: 1.3,
            alpha: 0.08,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.worldWidth * this.tileSize, this.worldHeight * this.tileSize);
        this.cameras.main.setZoom(1);
    }
    
    update() {
        if (this.inCombat) return;
        
        const speed = 200;
        this.playerSprite.body.setVelocity(0);
        
        let moving = false;
        if (this.cursors.left.isDown) {
            this.playerSprite.body.setVelocityX(-speed);
            this.playerSprite.setFlipX(true);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.playerSprite.body.setVelocityX(speed);
            this.playerSprite.setFlipX(false);
            moving = true;
        }
        
        if (this.cursors.up.isDown) {
            this.playerSprite.body.setVelocityY(-speed);
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.playerSprite.body.setVelocityY(speed);
            moving = true;
        }
        
        if (moving) {
            this.playerSprite.y += Math.sin(Date.now() / 100) * 0.6;
        }
        
        this.playerShadow.x = this.playerSprite.x;
        this.playerShadow.y = this.playerSprite.y + 20;
        this.playerGlow.x = this.playerSprite.x;
        this.playerGlow.y = this.playerSprite.y;
        
        // Random encounters based on biome
        const tileX = Math.floor(this.playerSprite.x / this.tileSize);
        const tileY = Math.floor(this.playerSprite.y / this.tileSize);
        
        if (tileY >= 0 && tileY < this.worldHeight && tileX >= 0 && tileX < this.worldWidth) {
            const biome = this.worldMap[tileY][tileX];
            
            // Higher encounter rate in forests and mountains
            let encounterRate = 0.0005;
            if (biome === 'forest' || biome === 'mountain') encounterRate = 0.001;
            if (biome === 'water' || biome === 'beach') encounterRate = 0;
            
            if (Math.random() < encounterRate && !this.inCombat) {
                this.startRandomEncounter();
            }
        }
    }
    
    startRandomEncounter() {
        this.inCombat = true;
        const enemyTypes = ['goblin', 'orc', 'skeleton'];
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        const enemy = new Enemy(randomType);
        this.currentEnemy = enemy;
        
        showMessage(`⚠️ Wild ${randomType.toUpperCase()} appeared!`, 'red');
        this.cameras.main.flash(500, 255, 0, 0);
        
        this.combat = new CombatSystem(this, this.player, enemy);
        this.createCombatUI(enemy);
    }
    
    createCombatUI(enemy) {
        const centerX = this.cameras.main.scrollX + 400;
        const centerY = this.cameras.main.scrollY + 300;
        
        this.combatBg = this.add.rectangle(centerX, centerY, 800, 600, 0x000000, 0.9);
        this.combatBg.setScrollFactor(0);
        this.combatBg.setDepth(100);
        
        const panel = this.add.rectangle(centerX, centerY, 700, 450, 0x1a1a2e);
        panel.setStrokeStyle(4, 0x4a4a6a);
        panel.setScrollFactor(0);
        panel.setDepth(101);
        
        this.enemySprite = this.add.sprite(centerX, centerY - 80, `enemy_${enemy.type}`);
        this.enemySprite.setScale(2.5);
        this.enemySprite.setScrollFactor(0);
        this.enemySprite.setDepth(102);
        
        this.tweens.add({
            targets: this.enemySprite,
            scaleY: 2.6,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.enemyText = this.add.text(centerX, centerY - 150, enemy.type.toUpperCase(), {
            fontSize: '28px',
            color: '#ff6b6b',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(103);
        
        this.enemyHPBar = this.add.rectangle(centerX, centerY - 120, 300, 24, 0x1a1a2e);
        this.enemyHPBar.setStrokeStyle(3, 0x666);
        this.enemyHPBar.setScrollFactor(0);
        this.enemyHPBar.setDepth(103);
        
        this.enemyHPFill = this.add.rectangle(centerX, centerY - 120, 300, 24, 0xe74c3c);
        this.enemyHPFill.setScrollFactor(0);
        this.enemyHPFill.setDepth(104);
        
        this.enemyHPText = this.add.text(centerX, centerY - 120, `${enemy.currentHP}/${enemy.maxHP}`, {
            fontSize: '16px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(105);
        
        const btnY = centerY + 100;
        
        const attackBtn = this.createCombatButton(centerX - 180, btnY, '⚔️ ATTACK', 0xe74c3c);
        attackBtn.on('pointerdown', () => {
            if (this.combat && this.combat.turn === 'player') {
                this.combat.playerAttack();
            }
        });
        
        const itemBtn = this.createCombatButton(centerX - 60, btnY, '🧪 ITEM', 0x3498db);
        itemBtn.on('pointerdown', () => {
            if (this.combat && this.combat.turn === 'player') {
                this.player.useItem('Health Potion');
            }
        });
        
        const skillBtn = this.createCombatButton(centerX + 60, btnY, '✨ SKILL', 0x9b59b6);
        const runBtn = this.createCombatButton(centerX + 180, btnY, '🏃 RUN', 0x95a5a6);
        
        this.combatButtons = [attackBtn, itemBtn, skillBtn, runBtn];
    }
    
    createCombatButton(x, y, text, color) {
        const btn = this.add.text(x, y, text, {
            fontSize: '18px',
            backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
            padding: { x: 18, y: 12 },
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(106).setInteractive();
        
        btn.on('pointerover', () => {
            btn.setScale(1.1);
            btn.setBackgroundColor(`#${(color + 0x222222).toString(16).padStart(6, '0')}`);
        });
        
        btn.on('pointerout', () => {
            btn.setScale(1);
            btn.setBackgroundColor(`#${color.toString(16).padStart(6, '0')}`);
        });
        
        return btn;
    }
    
    updateCombatUI() {
        if (this.enemyHPFill && this.currentEnemy) {
            const hpPercent = this.currentEnemy.currentHP / this.currentEnemy.maxHP;
            this.tweens.add({
                targets: this.enemyHPFill,
                scaleX: hpPercent,
                duration: 300,
                ease: 'Power2'
            });
            this.enemyHPText.setText(`${this.currentEnemy.currentHP}/${this.currentEnemy.maxHP}`);
        }
    }
    
    showFloatingDamage(x, y, damage, color) {
        const colorMap = {
            red: '#ff4444',
            orange: '#ff9944',
            green: '#44ff44',
            gold: '#ffd700'
        };
        
        const text = this.add.text(x, y, `-${damage}`, {
            fontSize: '36px',
            color: colorMap[color] || '#ffffff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        
        this.tweens.add({
            targets: text,
            y: y - 100,
            alpha: 0,
            scale: 1.8,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }
    
    createHitParticles(x, y, color) {
        const emitter = this.add.particles(x, y, `particle_${color}`, {
            speed: { min: 120, max: 250 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 600,
            quantity: 25,
            frequency: -1
        });
        emitter.setScrollFactor(0);
        emitter.setDepth(150);
        emitter.explode();
        
        this.time.delayedCall(700, () => emitter.destroy());
    }
    
    createVictoryParticles() {
        const centerX = this.cameras.main.scrollX + 400;
        const centerY = this.cameras.main.scrollY + 300;
        
        for (let i = 0; i < 4; i++) {
            this.time.delayedCall(i * 150, () => {
                const emitter = this.add.particles(centerX, centerY, `particle_${0xffd700}`, {
                    speed: { min: 180, max: 350 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 1.5, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 1200,
                    quantity: 35,
                    frequency: -1
                });
                emitter.setScrollFactor(0);
                emitter.setDepth(150);
                emitter.explode();
                
                this.time.delayedCall(1300, () => emitter.destroy());
            });
        }
    }
    
    endCombat(victory) {
        this.inCombat = false;
        if (this.combatBg) this.combatBg.destroy();
        if (this.enemySprite) this.enemySprite.destroy();
        if (this.enemyText) this.enemyText.destroy();
        if (this.enemyHPBar) this.enemyHPBar.destroy();
        if (this.enemyHPFill) this.enemyHPFill.destroy();
        if (this.enemyHPText) this.enemyHPText.destroy();
        this.combatButtons.forEach(btn => btn.destroy());
        this.combat = null;
        this.currentEnemy = null;
        
        if (victory) {
            this.cameras.main.flash(400, 0, 255, 0);
        }
    }
    
    triggerQuest(quest) {
        showMessage(`📜 ${quest.name}: ${quest.description}`, 'gold');
        
        if (quest.boss) {
            this.startBossFight(quest);
        } else {
            this.completeQuest(quest);
        }
    }
    
    startBossFight(quest) {
        this.inCombat = true;
        const enemy = new Enemy(quest.boss);
        this.currentEnemy = enemy;
        
        showMessage(`💀 BOSS BATTLE: ${quest.boss.toUpperCase()}!`, 'red');
        this.cameras.main.flash(1000, 255, 0, 0);
        this.cameras.main.shake(500, 0.012);
        
        this.combat = new CombatSystem(this, this.player, enemy);
        this.createCombatUI(enemy);
    }
    
    completeQuest(quest) {
        this.player.addGold(quest.reward.gold);
        this.player.gainXP(quest.reward.xp);
        if (quest.reward.item) {
            this.player.addItem(GameConfig.assets.items[quest.reward.item]);
        }
        this.player.completedQuests.push(quest.id);
        this.player.currentQuest++;
        
        this.cameras.main.flash(600, 255, 215, 0);
        showMessage(`✅ Quest Complete! +${quest.reward.gold}g, +${quest.reward.xp}xp`, 'gold');
    }
    
    connectWebSocket() {
        try {
            this.ws = new WebSocket(GameConfig.websocket.url);
            this.ws.onopen = () => {
                console.log('Connected to server');
                this.ws.send(JSON.stringify({ type: 'join', player: this.player.name }));
            };
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Server:', data);
            };
            this.ws.onerror = () => console.log('Playing offline');
        } catch (e) {
            console.log('Offline mode');
        }
    }
}

// ===== UI FUNCTIONS =====
function updateUI() {
    const player = window.gamePlayer;
    if (!player) return;
    
    document.getElementById('char-name').textContent = player.name;
    document.getElementById('hp-text').textContent = `${player.currentHP}/${player.maxHP}`;
    document.getElementById('mp-text').textContent = `${player.currentMP}/${player.maxMP}`;
    document.getElementById('level').textContent = player.level;
    document.getElementById('gold').textContent = player.gold;
    
    const xpNeeded = GameConfig.balance.xpCurve(player.level);
    document.getElementById('xp-text').textContent = `${player.xp}/${xpNeeded}`;
    
    document.getElementById('hp-bar').style.width = `${(player.currentHP / player.maxHP) * 100}%`;
    document.getElementById('mp-bar').style.width = `${(player.currentMP / player.maxMP) * 100}%`;
    document.getElementById('xp-bar').style.width = `${(player.xp / xpNeeded) * 100}%`;
}

function showMessage(text, color = 'white') {
    console.log(text);
    const toast = document.getElementById('message-toast');
    if (!toast) return;
    toast.textContent = text;
    toast.className = 'show';
    toast.style.color = color;
    
    setTimeout(() => {
        toast.className = '';
    }, 3000);
}

window.openInventory = function() {
    const player = window.gamePlayer;
    let html = '<h2>📦 INVENTORY</h2>';
    
    if (player.inventory.length === 0) {
        html += '<p style="color: #95a5a6;">Your inventory is empty.</p>';
    } else {
        player.inventory.forEach(item => {
            html += `<div class="item-slot" onclick="window.gamePlayer.useItem('${item.name}')">
                <strong style="color: #3498db;">${item.name}</strong> <span style="color: #f39c12;">x${item.quantity}</span><br>
                <small style="color: #95a5a6;">${item.effect}: ${item.value} | Price: ${item.price}g</small>
            </div>`;
        });
    }
    
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal').classList.add('active');
};

window.openQuests = function() {
    const player = window.gamePlayer;
    let html = '<h2>📜 QUESTS</h2>';
    
    GameConfig.story.objectives.forEach((quest, index) => {
        const status = player.completedQuests.includes(quest.id) ? '✅' : 
                      index === player.currentQuest ? '🔥' : '🔒';
        const color = player.completedQuests.includes(quest.id) ? '#2ecc71' : 
                     index === player.currentQuest ? '#f39c12' : '#95a5a6';
        html += `<div class="item-slot">
            <strong style="color: ${color};">${status} ${quest.name}</strong><br>
            <small style="color: #95a5a6;">${quest.description}</small><br>
            <small style="color: #f39c12;">Reward: ${quest.reward.gold}g, ${quest.reward.xp}xp</small>
        </div>`;
    });
    
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal').classList.add('active');
};

window.openStats = function() {
    const player = window.gamePlayer;
    let html = `<h2>⚔️ CHARACTER</h2>
        <div class="item-slot">
            <p><strong style="color: #3498db;">Class:</strong> ${player.name}</p>
            <p><strong style="color: #e74c3c;">Level:</strong> ${player.level}</p>
            <p><strong style="color: #e74c3c;">HP:</strong> ${player.currentHP}/${player.maxHP}</p>
            <p><strong style="color: #3498db;">MP:</strong> ${player.currentMP}/${player.maxMP}</p>
            <p><strong style="color: #f39c12;">Attack:</strong> ${player.attack}</p>
            <p><strong style="color: #95a5a6;">Defense:</strong> ${player.defense}</p>
            <p><strong style="color: #f1c40f;">Gold:</strong> ${player.gold}</p>
            <p><strong style="color: #2ecc71;">XP:</strong> ${player.xp}/${GameConfig.balance.xpCurve(player.level)}</p>
        </div>
    `;
    
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal').classList.add('active');
};

window.closeModal = function() {
    document.getElementById('modal').classList.remove('active');
};

// ===== PHASER CONFIG =====
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene],
    backgroundColor: '#0a0a1e'
};

const game = new Phaser.Game(config);
