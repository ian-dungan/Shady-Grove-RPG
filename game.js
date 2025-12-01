import GameConfig from './gameConfig.js';

// ===== STATIC WORLD MAP =====
class StaticWorldMap {
    static createWorldMap(width, height) {
        const worldMap = [];
        
        // Initialize with base terrain
        for (let y = 0; y < height; y++) {
            worldMap[y] = [];
            for (let x = 0; x < width; x++) {
                worldMap[y][x] = this.getBiomeForPosition(x, y, width, height);
            }
        }
        
        // Add rivers
        this.addRivers(worldMap, width, height);
        
        return worldMap;
    }
    
    static addRivers(worldMap, width, height) {
        // Major river from north mountains to south
        const riverStartX = 120;
        let riverX = riverStartX;
        for (let y = 40; y < 280; y++) {
            // Meandering river
            if (y % 20 === 0) {
                riverX += (Math.random() - 0.5) * 10;
                riverX = Math.max(15, Math.min(width - 15, riverX));
            }
            
            // River width 3-5 tiles
            const riverWidth = 3 + Math.floor(Math.random() * 2);
            for (let dx = 0; dx < riverWidth; dx++) {
                const x = Math.floor(riverX) + dx - 1;
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    if (worldMap[y][x] !== 'water') {
                        worldMap[y][x] = 'river';
                    }
                }
            }
        }
        
        // Second river from east to west
        const riverStartY = 180;
        let riverY = riverStartY;
        for (let x = 200; x < 280; x++) {
            if (x % 15 === 0) {
                riverY += (Math.random() - 0.5) * 8;
                riverY = Math.max(150, Math.min(210, riverY));
            }
            
            const riverWidth = 2 + Math.floor(Math.random() * 2);
            for (let dy = 0; dy < riverWidth; dy++) {
                const y = Math.floor(riverY) + dy;
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    if (worldMap[y][x] !== 'water') {
                        worldMap[y][x] = 'river';
                    }
                }
            }
        }
        
        // Add bridges where roads cross rivers
        this.addBridge(worldMap, 120, 150, 3, true);  // Vertical bridge
        this.addBridge(worldMap, 220, 180, 3, false); // Horizontal bridge
    }
    
    static addBridge(worldMap, x, y, length, vertical) {
        if (vertical) {
            for (let dy = 0; dy < length; dy++) {
                if (y + dy < worldMap.length && x < worldMap[0].length) {
                    worldMap[y + dy][x] = 'bridge';
                }
            }
        } else {
            for (let dx = 0; dx < length; dx++) {
                if (y < worldMap.length && x + dx < worldMap[0].length) {
                    worldMap[y][x + dx] = 'bridge';
                }
            }
        }
    }
    
    static getBiomeForPosition(x, y, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Starting Area - Center (Grassland/Plains)
        if (this.inCircle(x, y, centerX, centerY, 35)) {
            return Math.random() < 0.7 ? 'grassland' : 'plains';
        }
        
        // NORTHERN MOUNTAINS - Large mountain range
        if (y < height * 0.25) {
            if (y < height * 0.12) {
                return 'snow';
            }
            // Mountain peaks
            const mountainNoise = Math.sin(x * 0.15) * Math.cos(y * 0.2);
            if (mountainNoise > 0.3 || y < height * 0.18) {
                return 'mountain';
            }
            return Math.random() < 0.6 ? 'hills' : 'mountain';
        }
        
        // SOUTHERN DESERT - Vast desert region
        if (y > height * 0.72) {
            return Math.random() < 0.85 ? 'desert' : 'plains';
        }
        
        // WESTERN OCEAN
        if (x < 12) {
            return 'water';
        }
        if (x < 25) {
            return (y < height * 0.25 || y > height * 0.7) ? 'beach' : 'plains';
        }
        
        // EASTERN OCEAN  
        if (x > width - 12) {
            return 'water';
        }
        if (x > width - 25) {
            return (y < height * 0.25 || y > height * 0.7) ? 'beach' : 'grassland';
        }
        
        // DARK FOREST - Dense western forest
        if (x < centerX - 25 && y > height * 0.28 && y < centerY + 20) {
            return 'forest';
        }
        
        // LIGHT FOREST - Eastern forest
        if (x > centerX + 35 && y > height * 0.28 && y < centerY + 15) {
            return Math.random() < 0.7 ? 'forest' : 'grassland';
        }
        
        // HILLS REGION - Southwest hills
        if (x < centerX - 10 && y > centerY + 10 && y < height * 0.7) {
            return Math.random() < 0.6 ? 'hills' : 'plains';
        }
        
        // MOUNTAIN RANGE - Eastern ridge
        if (x > width - 70 && x < width - 28 && y > height * 0.22 && y < height * 0.58) {
            const peakPattern = Math.sin(y * 0.2) * Math.cos(x * 0.15);
            if (peakPattern > 0.4) {
                return 'mountain';
            }
            return Math.random() < 0.5 ? 'mountain' : 'hills';
        }
        
        // CENTRAL LAKES
        if (this.inCircle(x, y, centerX + 45, centerY - 25, 14)) {
            return 'water';
        }
        if (this.inCircle(x, y, centerX + 45, centerY - 25, 18)) {
            return 'beach';
        }
        
        if (this.inCircle(x, y, centerX - 30, centerY + 40, 10)) {
            return 'water';
        }
        if (this.inCircle(x, y, centerX - 30, centerY + 40, 13)) {
            return 'beach';
        }
        
        // Default grassland/plains mix
        return Math.random() < 0.6 ? 'grassland' : 'plains';
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
    static createDetailedTile(scene, biome, x, y, variant = 0) {
        const tileSize = 32;
        const baseX = x * tileSize;
        const baseY = y * tileSize;
        
        const graphics = scene.add.graphics();
        
        switch (biome) {
            case 'water':
                this.drawWater(graphics, baseX, baseY, tileSize, x, y);
                break;
            case 'beach':
                this.drawBeach(graphics, baseX, baseY, tileSize, x, y);
                break;
            case 'plains':
                this.drawPlains(graphics, baseX, baseY, tileSize, x, y);
                break;
            case 'grassland':
                this.drawGrassland(graphics, baseX, baseY, tileSize, x, y);
                break;
            case 'forest':
                this.drawForest(graphics, baseX, baseY, tileSize, x, y);
                break;
            case 'hills':
                this.drawHills(graphics, baseX, baseY, tileSize, x, y);
                break;
            case 'mountain':
                this.drawMountain(graphics, baseX, baseY, tileSize, x, y);
                break;
            case 'desert':
                this.drawDesert(graphics, baseX, baseY, tileSize, x, y);
                break;
            case 'snow':
                this.drawSnow(graphics, baseX, baseY, tileSize, x, y);
                break;
            case 'river':
                this.drawRiver(graphics, baseX, baseY, tileSize, x, y);
                break;
            case 'bridge':
                this.drawBridge(graphics, baseX, baseY, tileSize, x, y);
                break;
        }
        
        // Generate texture and destroy graphics
        graphics.generateTexture(`tile_${x}_${y}`, tileSize, tileSize);
        const tile = scene.add.image(baseX + tileSize/2, baseY + tileSize/2, `tile_${x}_${y}`);
        tile.setDepth(-50);
        graphics.destroy();
    }
    
    static drawWater(g, x, y, size, tileX, tileY) {
        // Deep blue water with waves
        g.fillGradientStyle(0x1a5490, 0x1a5490, 0x0d3a63, 0x0d3a63, 1);
        g.fillRect(0, 0, size, size);
        
        // Animated wave pattern
        const wave1 = Math.sin((tileX + tileY) * 0.5) * 3;
        const wave2 = Math.sin((tileX - tileY) * 0.3) * 2;
        
        g.fillStyle(0x2874b5, 0.4);
        g.fillRect(0, size * 0.3 + wave1, size, 3);
        g.fillRect(0, size * 0.6 + wave2, size, 2);
        
        // Foam highlights
        if ((tileX + tileY) % 5 === 0) {
            g.fillStyle(0x85c1e9, 0.3);
            g.fillCircle(size * 0.7, size * 0.3, 4);
        }
    }
    
    static drawRiver(g, x, y, size, tileX, tileY) {
        // Lighter blue for rivers
        g.fillGradientStyle(0x3498db, 0x3498db, 0x2980b9, 0x2980b9, 1);
        g.fillRect(0, 0, size, size);
        
        // Flow lines
        g.fillStyle(0x5dade2, 0.5);
        const flow = tileY * 2;
        g.fillRect(0, (flow % size), size, 2);
        g.fillRect(0, ((flow + 15) % size), size, 1);
        
        // Sparkles
        if ((tileX * tileY) % 7 === 0) {
            g.fillStyle(0xffffff, 0.6);
            g.fillCircle(size * 0.3, size * 0.4, 2);
        }
    }
    
    static drawBeach(g, x, y, size, tileX, tileY) {
        // Sandy gradient
        g.fillGradientStyle(0xf4d03f, 0xf4d03f, 0xe9c46a, 0xe67e22, 1);
        g.fillRect(0, 0, size, size);
        
        // Sand texture
        const rand = (tileX * 73 + tileY * 37) % 100;
        for (let i = 0; i < 8; i++) {
            g.fillStyle(0xf1c40f, 0.2);
            const px = ((tileX + i) * 13) % size;
            const py = ((tileY + i) * 17) % size;
            g.fillCircle(px, py, 1);
        }
        
        // Shells
        if (rand < 15) {
            g.fillStyle(0xffffff, 0.6);
            g.fillCircle(size * 0.6, size * 0.4, 3);
            g.fillStyle(0xd5dbdb, 0.4);
            g.fillCircle(size * 0.62, size * 0.42, 2);
        }
    }
    
    static drawPlains(g, x, y, size, tileX, tileY) {
        // Light green grass
        g.fillGradientStyle(0x52c234, 0x52c234, 0x45a329, 0x3d8b21, 1);
        g.fillRect(0, 0, size, size);
        
        // Grass blades
        g.fillStyle(0x5dce3e, 0.4);
        for (let i = 0; i < 6; i++) {
            const gx = ((tileX + i) * 11) % size;
            const gy = size - 6 + Math.sin(tileX + i) * 2;
            g.fillRect(gx, gy, 1, 6);
        }
        
        // Flowers
        if ((tileX + tileY) % 11 === 0) {
            g.fillStyle(0xff69b4, 0.8);
            g.fillCircle(size * 0.7, size * 0.3, 2);
            g.fillStyle(0xffd700, 0.8);
            g.fillCircle(size * 0.7, size * 0.3, 1);
        }
    }
    
    static drawGrassland(g, x, y, size, tileX, tileY) {
        // Rich grass
        g.fillGradientStyle(0x27ae60, 0x27ae60, 0x229954, 0x1e7d45, 1);
        g.fillRect(0, 0, size, size);
        
        // Dark grass patches
        const pattern = (tileX * tileY) % 4;
        g.fillStyle(0x1e8449, 0.3);
        if (pattern === 0) {
            g.fillRect(size * 0.5, 0, size * 0.5, size * 0.5);
        } else if (pattern === 1) {
            g.fillRect(0, size * 0.5, size * 0.5, size * 0.5);
        }
        
        // Tall grass
        g.fillStyle(0x2ecc71, 0.5);
        for (let i = 0; i < 4; i++) {
            const gx = ((tileX * 7 + i) * 13) % size;
            const gy = size - 4;
            g.fillRect(gx, gy, 2, 4);
        }
    }
    
    static drawForest(g, x, y, size, tileX, tileY) {
        // Dark forest floor
        g.fillGradientStyle(0x196f3d, 0x196f3d, 0x145a32, 0x0e3d23, 1);
        g.fillRect(0, 0, size, size);
        
        // Undergrowth
        g.fillStyle(0x229954, 0.5);
        g.fillRect(0, size * 0.7, size, size * 0.3);
        
        // Shadows from trees
        g.fillStyle(0x0b2e13, 0.4);
        const shadowX = ((tileX * 23) % size);
        const shadowY = ((tileY * 19) % size);
        g.fillCircle(shadowX, shadowY, 12);
        
        // Moss patches
        if ((tileX + tileY) % 7 === 0) {
            g.fillStyle(0x27ae60, 0.6);
            g.fillCircle(size * 0.3, size * 0.6, 6);
        }
    }
    
    static drawHills(g, x, y, size, tileX, tileY) {
        // Earthy browns
        g.fillGradientStyle(0x7d6608, 0x7d6608, 0x6e5a07, 0x5d4a06, 1);
        g.fillRect(0, 0, size, size);
        
        // Hill contours
        g.lineStyle(2, 0x8b7209, 0.4);
        const curve1 = Math.sin(tileX * 0.3) * 6;
        const curve2 = Math.sin(tileY * 0.4) * 4;
        g.strokeRect(0, size * 0.4 + curve1, size, 2);
        g.strokeRect(0, size * 0.6 + curve2, size, 1);
        
        // Grass on hills
        g.fillStyle(0x52c234, 0.5);
        g.fillRect(0, 0, size, size * 0.3);
        
        // Rocks
        if ((tileX * tileY) % 13 === 0) {
            g.fillStyle(0x5d6d7e, 0.8);
            g.fillCircle(size * 0.6, size * 0.5, 4);
        }
    }
    
    static drawMountain(g, x, y, size, tileX, tileY) {
        // Rocky gray
        g.fillGradientStyle(0x566573, 0x566573, 0x34495e, 0x2c3e50, 1);
        g.fillRect(0, 0, size, size);
        
        // Rock face
        g.fillStyle(0x273746, 0.6);
        g.beginPath();
        g.moveTo(0, size);
        g.lineTo(size * 0.5, size * 0.2);
        g.lineTo(size, size);
        g.closePath();
        g.fillPath();
        
        // Highlights
        g.fillStyle(0x85929e, 0.4);
        g.fillTriangle(
            size * 0.3, size * 0.5,
            size * 0.5, size * 0.2,
            size * 0.6, size * 0.5
        );
        
        // Snow cap
        if (tileY < 60) {
            g.fillStyle(0xffffff, 0.8);
            g.fillTriangle(
                size * 0.4, size * 0.3,
                size * 0.5, size * 0.2,
                size * 0.6, size * 0.3
            );
        }
        
        // Cracks
        g.lineStyle(1, 0x1a252f, 0.5);
        g.lineTo(size * 0.3, size * 0.6, size * 0.4, size);
        g.strokePath();
    }
    
    static drawDesert(g, x, y, size, tileX, tileY) {
        // Sandy yellows
        g.fillGradientStyle(0xf39c12, 0xf39c12, 0xe67e22, 0xd35400, 1);
        g.fillRect(0, 0, size, size);
        
        // Sand dunes
        g.fillStyle(0xd68910, 0.4);
        const dune1 = Math.sin(tileX * 0.4) * 8;
        const dune2 = Math.sin(tileY * 0.3) * 6;
        g.fillEllipse(size * 0.5, size * 0.5 + dune1, size * 0.6, size * 0.3);
        
        // Sand ripples
        g.lineStyle(1, 0xca6f1e, 0.3);
        for (let i = 0; i < 3; i++) {
            g.strokeRect(0, i * size/3 + dune2, size, 1);
        }
        
        // Sparse vegetation
        if ((tileX + tileY) % 17 === 0) {
            g.fillStyle(0x7d6608, 0.6);
            g.fillRect(size * 0.7, size * 0.6, 2, 4);
        }
    }
    
    static drawSnow(g, x, y, size, tileX, tileY) {
        // Pure white snow
        g.fillGradientStyle(0xffffff, 0xffffff, 0xecf0f1, 0xd5dbdb, 1);
        g.fillRect(0, 0, size, size);
        
        // Snow drifts
        g.fillStyle(0xe8f4f8, 0.6);
        const drift = Math.sin(tileX * 0.5) * 4;
        g.fillEllipse(size * 0.5, size * 0.7 + drift, size * 0.7, size * 0.4);
        
        // Sparkles
        for (let i = 0; i < 4; i++) {
            g.fillStyle(0xffffff, 0.9);
            const sx = ((tileX + i) * 7) % size;
            const sy = ((tileY + i) * 11) % size;
            g.fillCircle(sx, sy, 1);
        }
        
        // Footprint shadows
        if ((tileX * tileY) % 19 === 0) {
            g.fillStyle(0xbdc3c7, 0.3);
            g.fillCircle(size * 0.4, size * 0.5, 5);
        }
    }
    
    static drawBridge(g, x, y, size, tileX, tileY) {
        // Water underneath
        g.fillStyle(0x3498db);
        g.fillRect(0, 0, size, size);
        
        // Wooden bridge
        g.fillStyle(0x8b4513);
        g.fillRect(0, size * 0.3, size, size * 0.4);
        
        // Planks
        g.fillStyle(0x654321, 0.5);
        for (let i = 0; i < 5; i++) {
            g.fillRect(i * size/5, size * 0.3, 2, size * 0.4);
        }
        
        // Rope rails
        g.lineStyle(2, 0x654321, 0.8);
        g.lineTo(0, size * 0.35, size, size * 0.35);
        g.lineTo(0, size * 0.65, size, size * 0.65);
        g.strokePath();
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
        // Fixed locations for major structures - MANY MORE
        const structures = [
            // Starting area
            { x: 150, y: 150, type: 'capital', name: 'Capital City' },
            
            // Northern region
            { x: 50, y: 35, type: 'castle', name: 'Ice Fortress' },
            { x: 90, y: 50, type: 'town', name: 'Northvale' },
            { x: 180, y: 45, type: 'village', name: 'Frostpeak Village' },
            
            // Eastern region
            { x: 240, y: 80, type: 'town', name: 'Eastport' },
            { x: 260, y: 120, type: 'village', name: 'Mountain Rest' },
            { x: 220, y: 180, type: 'city', name: 'Trade City' },
            
            // Western region
            { x: 60, y: 100, type: 'dungeon', name: 'Forest Catacombs' },
            { x: 40, y: 140, type: 'village', name: 'Woodhaven' },
            { x: 70, y: 180, type: 'town', name: 'Rivertown' },
            
            // Central region
            { x: 120, y: 120, type: 'village', name: 'Greenfields' },
            { x: 190, y: 130, type: 'town', name: 'Crossroads' },
            { x: 170, y: 180, type: 'village', name: 'Meadowbrook' },
            
            // Southern region
            { x: 200, y: 245, type: 'dungeon', name: 'Desert Ruins' },
            { x: 150, y: 260, type: 'town', name: 'Oasis Town' },
            { x: 100, y: 250, type: 'village', name: 'Sandstone' },
            
            // Quest locations
            { x: 80, y: 100, type: 'dungeon', name: 'Ancient Temple' },
            { x: 80, y: 270, type: 'temple', name: 'Water Shrine' },
            { x: 270, y: 50, type: 'castle', name: 'Dark Citadel' },
            
            // Additional settlements
            { x: 120, y: 200, type: 'village', name: 'Hillcrest' },
            { x: 200, y: 160, type: 'village', name: 'Pinegrove' },
            { x: 140, y: 90, type: 'village', name: 'Lakeside' }
        ];
        
        structures.forEach(struct => {
            this.addStructure(struct.x, struct.y, struct.type, struct.name);
        });
    }
    
    addStructure(tileX, tileY, type, name) {
        const x = tileX * this.tileSize;
        const y = tileY * this.tileSize;
        
        if (type === 'capital') {
            // Large capital city - 8x8 grid
            const size = 8;
            for (let dy = 0; dy < size; dy++) {
                for (let dx = 0; dx < size; dx++) {
                    const houseX = x + dx * 36;
                    const houseY = y + dy * 36;
                    
                    // Varied building heights
                    const isLarge = (dx + dy) % 3 === 0;
                    const buildingHeight = isLarge ? 40 : 32;
                    const color = isLarge ? 0xa0522d : 0x8b4513;
                    
                    const house = this.add.rectangle(houseX, houseY, 32, buildingHeight, color);
                    house.setStrokeStyle(2, 0x654321);
                    house.setDepth(10);
                    
                    // Windows
                    for (let w = 0; w < (isLarge ? 3 : 2); w++) {
                        const window = this.add.rectangle(
                            houseX - 8 + w * 8,
                            houseY - (isLarge ? 12 : 8),
                            5, 6, 0xffd700
                        );
                        window.setDepth(11);
                    }
                    
                    // Roof
                    const roof = this.add.triangle(
                        houseX, houseY - buildingHeight/2 - 10,
                        0, 20, 16, 0, 32, 20,
                        isLarge ? 0x8b0000 : 0xc0392b
                    );
                    roof.setDepth(11);
                }
            }
            
            // Castle in center
            const centerX = x + size * 18;
            const centerY = y + size * 18;
            const castle = this.add.rectangle(centerX, centerY, 100, 100, 0x7f8c8d);
            castle.setStrokeStyle(5, 0x2c3e50);
            castle.setDepth(15);
            
            // Four towers
            for (let i = 0; i < 4; i++) {
                const tx = centerX + (i % 2) * 90 - 45;
                const ty = centerY + Math.floor(i / 2) * 90 - 45;
                const tower = this.add.rectangle(tx, ty, 25, 50, 0x566573);
                tower.setDepth(16);
                const towerTop = this.add.triangle(tx, ty - 32, 0, 18, 13, 0, 26, 18, 0x8b0000);
                towerTop.setDepth(17);
            }
            
            // City walls
            const wallRect = this.add.rectangle(x + size * 18, y + size * 18, size * 40, size * 40);
            wallRect.setStrokeStyle(4, 0x5d6d7e);
            wallRect.setDepth(9);
            wallRect.isFilled = false;
            
            const sign = this.add.text(x + size * 18, y - 50, name, {
                fontSize: '16px',
                color: '#ffd700',
                backgroundColor: '#8b0000',
                padding: { x: 15, y: 8 },
                fontStyle: 'bold'
            });
            sign.setOrigin(0.5);
            sign.setDepth(25);
            
        } else if (type === 'city') {
            // Medium city - 6x6 grid
            const size = 6;
            for (let dy = 0; dy < size; dy++) {
                for (let dx = 0; dx < size; dx++) {
                    const houseX = x + dx * 38;
                    const houseY = y + dy * 38;
                    
                    const house = this.add.rectangle(houseX, houseY, 32, 36, 0x8b4513);
                    house.setStrokeStyle(2, 0x654321);
                    house.setDepth(10);
                    
                    // Windows
                    const window1 = this.add.rectangle(houseX - 6, houseY - 8, 5, 6, 0xffd700);
                    const window2 = this.add.rectangle(houseX + 6, houseY - 8, 5, 6, 0xffd700);
                    window1.setDepth(11);
                    window2.setDepth(11);
                    
                    const roof = this.add.triangle(
                        houseX, houseY - 24,
                        0, 20, 16, 0, 32, 20,
                        0xc0392b
                    );
                    roof.setDepth(11);
                    
                    const door = this.add.rectangle(houseX, houseY + 10, 8, 14, 0x4a2511);
                    door.setDepth(11);
                }
            }
            
            const sign = this.add.text(x + size * 19, y - 40, name, {
                fontSize: '14px',
                color: '#ffd700',
                backgroundColor: '#2c3e50',
                padding: { x: 12, y: 6 },
                fontStyle: 'bold'
            });
            sign.setOrigin(0.5);
            sign.setDepth(20);
            
        } else if (type === 'town') {
            // Town - 5x5 grid with more detail
            const size = 5;
            for (let dy = 0; dy < size; dy++) {
                for (let dx = 0; dx < size; dx++) {
                    const houseX = x + dx * 40;
                    const houseY = y + dy * 40;
                    
                    const house = this.add.rectangle(houseX, houseY, 32, 32, 0x8b4513);
                    house.setStrokeStyle(2, 0x654321);
                    house.setDepth(10);
                    
                    // Window
                    const window = this.add.rectangle(houseX, houseY - 6, 6, 6, 0xffd700);
                    window.setDepth(11);
                    
                    const roof = this.add.triangle(
                        houseX, houseY - 20,
                        0, 20, 16, 0, 32, 20,
                        0xc0392b
                    );
                    roof.setDepth(11);
                    
                    const door = this.add.rectangle(houseX, houseY + 8, 8, 12, 0x654321);
                    door.setDepth(11);
                    
                    // Chimney
                    if ((dx + dy) % 3 === 0) {
                        const chimney = this.add.rectangle(houseX + 10, houseY - 25, 4, 8, 0x5d4a06);
                        chimney.setDepth(12);
                    }
                }
            }
            
            // Town square in center
            const centerSquare = this.add.rectangle(x + 100, y + 100, 40, 40, 0x8b7209);
            centerSquare.setDepth(9);
            
            // Fountain
            const fountain = this.add.circle(x + 100, y + 100, 12, 0x3498db);
            fountain.setStrokeStyle(2, 0x85c1e9);
            fountain.setDepth(10);
            
            const sign = this.add.text(x + 100, y - 35, name, {
                fontSize: '13px',
                color: '#ffd700',
                backgroundColor: '#2c3e50',
                padding: { x: 10, y: 5 }
            });
            sign.setOrigin(0.5);
            sign.setDepth(20);
            
        } else if (type === 'village') {
            // Small village - 3x3 with character
            const size = 3;
            for (let dy = 0; dy < size; dy++) {
                for (let dx = 0; dx < size; dx++) {
                    const houseX = x + dx * 40;
                    const houseY = y + dy * 40;
                    
                    const house = this.add.rectangle(houseX, houseY, 28, 28, 0x8b4513);
                    house.setStrokeStyle(2, 0x654321);
                    house.setDepth(10);
                    
                    const roof = this.add.triangle(
                        houseX, houseY - 18,
                        0, 16, 14, 0, 28, 16,
                        0xc0392b
                    );
                    roof.setDepth(11);
                    
                    const door = this.add.rectangle(houseX, houseY + 6, 7, 10, 0x654321);
                    door.setDepth(11);
                }
            }
            
            const sign = this.add.text(x + 40, y - 30, name, {
                fontSize: '11px',
                color: '#ffd700',
                backgroundColor: '#2c3e50',
                padding: { x: 8, y: 4 }
            });
            sign.setOrigin(0.5);
            sign.setDepth(20);
            
        } else if (type === 'castle') {
            // Impressive castle structure
            const castle = this.add.rectangle(x, y, 100, 100, 0x7f8c8d);
            castle.setStrokeStyle(5, 0x2c3e50);
            castle.setDepth(10);
            
            // Main keep
            const keep = this.add.rectangle(x, y, 60, 80, 0x566573);
            keep.setDepth(11);
            
            // Four corner towers
            for (let i = 0; i < 4; i++) {
                const tx = x + (i % 2) * 80 - 40;
                const ty = y + Math.floor(i / 2) * 80 - 40;
                const tower = this.add.rectangle(tx, ty, 24, 50, 0x566573);
                tower.setStrokeStyle(3, 0x34495e);
                tower.setDepth(12);
                
                const towerTop = this.add.triangle(tx, ty - 32, 0, 18, 12, 0, 24, 18, 0xc0392b);
                towerTop.setDepth(13);
                
                // Windows in tower
                for (let w = 0; w < 3; w++) {
                    const window = this.add.rectangle(tx, ty - 15 + w * 15, 6, 8, 0xffd700);
                    window.setDepth(13);
                }
            }
            
            // Gate
            const gate = this.add.rectangle(x, y + 35, 30, 25, 0x2c3e50);
            gate.setDepth(13);
            
            // Battlements
            for (let i = 0; i < 8; i++) {
                const bx = x - 45 + i * 13;
                const battlement = this.add.rectangle(bx, y - 52, 8, 8, 0x7f8c8d);
                battlement.setDepth(13);
            }
            
            const sign = this.add.text(x, y - 70, name, {
                fontSize: '14px',
                color: '#ffd700',
                backgroundColor: '#2c3e50',
                padding: { x: 12, y: 6 },
                fontStyle: 'bold'
            });
            sign.setOrigin(0.5);
            sign.setDepth(20);
            
        } else if (type === 'dungeon') {
            // Ominous dungeon entrance
            const platform = this.add.rectangle(x, y + 10, 80, 20, 0x34495e);
            platform.setDepth(10);
            
            const entrance = this.add.rectangle(x, y, 60, 60, 0x2c3e50);
            entrance.setStrokeStyle(4, 0x1a252f);
            entrance.setDepth(10);
            
            // Dark doorway
            const door = this.add.rectangle(x, y + 5, 40, 50, 0x000000);
            door.setDepth(11);
            
            // Stone pillars
            const leftPillar = this.add.rectangle(x - 25, y, 10, 60, 0x566573);
            const rightPillar = this.add.rectangle(x + 25, y, 10, 60, 0x566573);
            leftPillar.setDepth(11);
            rightPillar.setDepth(11);
            
            // Skull decorations
            const skull1 = this.add.circle(x - 25, y - 25, 6, 0xecf0f1);
            const skull2 = this.add.circle(x + 25, y - 25, 6, 0xecf0f1);
            skull1.setDepth(12);
            skull2.setDepth(12);
            
            // Evil glow
            const glow = this.add.circle(x, y, 35, 0xff0000, 0.2);
            glow.setDepth(9);
            
            const sign = this.add.text(x, y - 50, name, {
                fontSize: '12px',
                color: '#ff6b6b',
                backgroundColor: '#1a252f',
                padding: { x: 10, y: 5 },
                fontStyle: 'bold'
            });
            sign.setOrigin(0.5);
            sign.setDepth(20);
            
        } else if (type === 'temple') {
            // Sacred temple structure
            const base = this.add.rectangle(x, y + 10, 90, 30, 0x3498db);
            base.setDepth(10);
            
            const temple = this.add.rectangle(x, y, 70, 70, 0x3498db);
            temple.setStrokeStyle(4, 0x2980b9);
            temple.setDepth(10);
            
            // Roof
            const roof = this.add.triangle(x, y - 45, 0, 25, 40, 0, 80, 25, 0x5dade2);
            roof.setDepth(11);
            
            // Columns
            for (let i = 0; i < 5; i++) {
                const col = this.add.rectangle(x - 30 + i * 15, y + 15, 7, 50, 0xecf0f1);
                col.setStrokeStyle(1, 0xbdc3c7);
                col.setDepth(11);
            }
            
            // Entrance
            const entrance = this.add.rectangle(x, y + 10, 30, 40, 0x2980b9);
            entrance.setDepth(12);
            
            // Sacred symbol
            const symbol = this.add.circle(x, y - 15, 8, 0xffd700);
            symbol.setStrokeStyle(2, 0xf39c12);
            symbol.setDepth(12);
            
            // Holy glow
            const glow = this.add.circle(x, y, 40, 0xffd700, 0.15);
            glow.setDepth(9);
            
            const sign = this.add.text(x, y - 60, name, {
                fontSize: '12px',
                color: '#3498db',
                backgroundColor: '#ecf0f1',
                padding: { x: 10, y: 5 }
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
            
            // Varied encounter rates by biome
            let encounterRate = 0.0005;
            if (biome === 'forest') encounterRate = 0.0012;
            if (biome === 'mountain') encounterRate = 0.001;
            if (biome === 'desert') encounterRate = 0.0008;
            if (biome === 'hills') encounterRate = 0.0007;
            if (biome === 'water' || biome === 'beach' || biome === 'river' || biome === 'bridge') encounterRate = 0;
            
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
