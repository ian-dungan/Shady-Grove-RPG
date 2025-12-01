import GameConfig from './gameConfig.js';

// ===== PLAYER CLASS =====
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
        
        this.equipment = {
            weapon: null,
            armor: null
        };
        
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
        
        showMessage(`Level Up! Now level ${this.level}!`);
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
                showMessage(`Used ${item.name}. Restored ${item.value} HP!`);
                break;
            case 'mana':
                this.restoreMana(item.value);
                showMessage(`Used ${item.name}. Restored ${item.value} MP!`);
                break;
            case 'fullHeal':
                this.currentHP = this.maxHP;
                this.currentMP = this.maxMP;
                showMessage(`Used ${item.name}. Fully restored!`);
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
        
        showMessage(`You attack for ${damage} damage!`);
        
        if (killed) {
            this.victory();
        } else {
            this.turn = 'enemy';
            this.scene.time.delayedCall(1000, () => this.enemyAttack());
        }
    }
    
    enemyAttack() {
        if (!this.active) return;
        
        const damage = Math.floor(this.enemy.attack * (0.8 + Math.random() * 0.4));
        this.player.takeDamage(damage);
        
        showMessage(`Enemy attacks for ${damage} damage!`);
        
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
        showMessage(`Victory! Gained ${this.enemy.xpDrop} XP and ${this.enemy.goldDrop} gold!`);
        
        this.scene.time.delayedCall(2000, () => {
            this.scene.endCombat(true);
        });
    }
    
    defeat() {
        this.active = false;
        showMessage('You have been defeated...');
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
        this.player = null;
        this.combat = null;
        this.inCombat = false;
        this.ws = null;
    }
    
    create() {
        // Create player (class selection would happen here)
        this.player = new Player('warrior');
        window.gamePlayer = this.player;
        
        // Create simple world
        this.createWorld();
        
        // Create player sprite
        this.createPlayerSprite();
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.actionKey = this.input.keyboard.addKey('SPACE');
        
        // Connect WebSocket
        this.connectWebSocket();
        
        updateUI();
        showMessage(GameConfig.story.intro);
    }
    
    createWorld() {
        // Create a simple tile-based world (32x32 tiles)
        this.worldWidth = 32;
        this.worldHeight = 32;
        this.tileSize = 32;
        
        // Draw simple grass tiles
        const graphics = this.add.graphics();
        for (let y = 0; y < this.worldHeight; y++) {
            for (let x = 0; x < this.worldWidth; x++) {
                const color = (x + y) % 2 === 0 ? 0x228B22 : 0x2E8B57;
                graphics.fillStyle(color, 1);
                graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
        
        // Add some trees randomly
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.worldWidth * this.tileSize;
            const y = Math.random() * this.worldHeight * this.tileSize;
            const tree = this.add.circle(x, y, 12, 0x228B22);
            tree.setStrokeStyle(2, 0x654321);
        }
        
        // Add quest markers
        GameConfig.story.objectives.forEach((quest, index) => {
            if (index === this.player.currentQuest) {
                const marker = this.add.circle(
                    quest.location.x * this.tileSize,
                    quest.location.y * this.tileSize,
                    16,
                    0xFFD700
                );
                marker.setStrokeStyle(2, 0xFFFFFF);
                marker.questId = quest.id;
                this.physics.add.existing(marker);
                this.physics.add.overlap(this.playerSprite, marker, () => this.triggerQuest(quest));
            }
        });
    }
    
    createPlayerSprite() {
        // Create simple player sprite
        this.playerSprite = this.add.circle(5 * this.tileSize, 5 * this.tileSize, 14, 0x3498db);
        this.playerSprite.setStrokeStyle(2, 0xFFFFFF);
        this.physics.add.existing(this.playerSprite);
        this.playerSprite.body.setCollideWorldBounds(true);
        
        // Camera follow
        this.cameras.main.startFollow(this.playerSprite);
        this.cameras.main.setBounds(0, 0, this.worldWidth * this.tileSize, this.worldHeight * this.tileSize);
    }
    
    update() {
        if (this.inCombat) return;
        
        const speed = 160;
        this.playerSprite.body.setVelocity(0);
        
        if (this.cursors.left.isDown) {
            this.playerSprite.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.playerSprite.body.setVelocityX(speed);
        }
        
        if (this.cursors.up.isDown) {
            this.playerSprite.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.playerSprite.body.setVelocityY(speed);
        }
        
        // Random encounters
        if (Math.random() < 0.001 && !this.inCombat) {
            this.startRandomEncounter();
        }
    }
    
    startRandomEncounter() {
        this.inCombat = true;
        const enemyTypes = ['goblin', 'orc', 'skeleton'];
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        const enemy = new Enemy(randomType);
        showMessage(`A wild ${randomType} appears!`);
        
        this.combat = new CombatSystem(this, this.player, enemy);
        
        // Create combat UI
        this.createCombatUI(enemy);
    }
    
    createCombatUI(enemy) {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        this.combatBg = this.add.rectangle(centerX, centerY, 600, 400, 0x000000, 0.9);
        this.combatBg.setScrollFactor(0);
        this.combatBg.setDepth(100);
        
        this.enemyText = this.add.text(centerX, centerY - 100, `${enemy.type.toUpperCase()}\nHP: ${enemy.currentHP}/${enemy.maxHP}`, {
            fontSize: '24px',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
        
        const attackBtn = this.add.text(centerX - 80, centerY + 80, '⚔ Attack', {
            fontSize: '20px',
            backgroundColor: '#34495e',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setInteractive();
        
        attackBtn.on('pointerdown', () => {
            if (this.combat && this.combat.turn === 'player') {
                this.combat.playerAttack();
                this.updateCombatUI();
            }
        });
        
        const itemBtn = this.add.text(centerX + 80, centerY + 80, '🧪 Item', {
            fontSize: '20px',
            backgroundColor: '#34495e',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setInteractive();
        
        itemBtn.on('pointerdown', () => {
            if (this.combat && this.combat.turn === 'player') {
                this.player.useItem('Health Potion');
            }
        });
        
        this.combatButtons = [attackBtn, itemBtn];
    }
    
    updateCombatUI() {
        if (this.enemyText && this.combat) {
            this.enemyText.setText(`${this.combat.enemy.type.toUpperCase()}\nHP: ${this.combat.enemy.currentHP}/${this.combat.enemy.maxHP}`);
        }
    }
    
    endCombat(victory) {
        this.inCombat = false;
        if (this.combatBg) this.combatBg.destroy();
        if (this.enemyText) this.enemyText.destroy();
        this.combatButtons.forEach(btn => btn.destroy());
        this.combat = null;
    }
    
    triggerQuest(quest) {
        showMessage(`Quest: ${quest.name}\n${quest.description}`);
        
        if (quest.boss) {
            this.startBossFight(quest);
        } else {
            this.completeQuest(quest);
        }
    }
    
    startBossFight(quest) {
        this.inCombat = true;
        const enemy = new Enemy(quest.boss);
        showMessage(`Boss Battle: ${quest.boss.toUpperCase()}!`);
        
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
        
        showMessage(`Quest Complete!\nReward: ${quest.reward.gold} gold, ${quest.reward.xp} XP`);
    }
    
    connectWebSocket() {
        try {
            this.ws = new WebSocket(GameConfig.websocket.url);
            
            this.ws.onopen = () => {
                console.log('Connected to game server');
                this.ws.send(JSON.stringify({ type: 'join', player: this.player.name }));
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Server message:', data);
            };
            
            this.ws.onerror = () => {
                console.log('WebSocket error - playing offline');
            };
        } catch (e) {
            console.log('WebSocket unavailable - playing offline');
        }
    }
}

// ===== UI FUNCTIONS =====
function updateUI() {
    const player = window.gamePlayer;
    if (!player) return;
    
    document.getElementById('char-name').textContent = `${player.name} (${player.className})`;
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

function showMessage(text) {
    console.log(text);
    // You can add a toast notification here
}

window.openInventory = function() {
    const player = window.gamePlayer;
    let html = '<h2>Inventory</h2>';
    
    if (player.inventory.length === 0) {
        html += '<p>Empty</p>';
    } else {
        player.inventory.forEach(item => {
            html += `<div class="item-slot" onclick="window.gamePlayer.useItem('${item.name}')">
                <strong>${item.name}</strong> x${item.quantity}<br>
                <small>${item.effect}: ${item.value}</small>
            </div>`;
        });
    }
    
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal').classList.add('active');
};

window.openQuests = function() {
    const player = window.gamePlayer;
    let html = '<h2>Quests</h2>';
    
    GameConfig.story.objectives.forEach((quest, index) => {
        const status = player.completedQuests.includes(quest.id) ? '✓ Complete' : 
                      index === player.currentQuest ? '→ Active' : '○ Locked';
        html += `<div class="item-slot">
            <strong>${status} ${quest.name}</strong><br>
            <small>${quest.description}</small>
        </div>`;
    });
    
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal').classList.add('active');
};

window.openStats = function() {
    const player = window.gamePlayer;
    let html = `<h2>Character Stats</h2>
        <p><strong>Class:</strong> ${player.name}</p>
        <p><strong>Level:</strong> ${player.level}</p>
        <p><strong>HP:</strong> ${player.currentHP}/${player.maxHP}</p>
        <p><strong>MP:</strong> ${player.currentMP}/${player.maxMP}</p>
        <p><strong>Attack:</strong> ${player.attack}</p>
        <p><strong>Defense:</strong> ${player.defense}</p>
        <p><strong>Gold:</strong> ${player.gold}</p>
        <p><strong>XP:</strong> ${player.xp}/${GameConfig.balance.xpCurve(player.level)}</p>
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
    scene: [GameScene]
};

const game = new Phaser.Game(config);
