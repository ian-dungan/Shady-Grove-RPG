const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Game WebSocket Server Running\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected players
const players = new Map();

wss.on('connection', (ws) => {
    console.log('New player connected');
    
    let playerId = null;
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'join':
                    playerId = Date.now() + Math.random();
                    players.set(playerId, {
                        id: playerId,
                        name: data.player,
                        ws: ws
                    });
                    
                    ws.send(JSON.stringify({
                        type: 'joined',
                        playerId: playerId,
                        playerCount: players.size
                    }));
                    
                    // Broadcast to all
                    broadcast({
                        type: 'playerJoined',
                        player: data.player,
                        playerCount: players.size
                    }, playerId);
                    break;
                    
                case 'move':
                    // Broadcast player movement
                    broadcast({
                        type: 'playerMove',
                        playerId: playerId,
                        x: data.x,
                        y: data.y
                    }, playerId);
                    break;
                    
                case 'combat':
                    // Broadcast combat events
                    broadcast({
                        type: 'combatEvent',
                        playerId: playerId,
                        event: data.event
                    }, playerId);
                    break;
                    
                case 'chat':
                    // Broadcast chat messages
                    const player = players.get(playerId);
                    broadcast({
                        type: 'chat',
                        player: player ? player.name : 'Unknown',
                        message: data.message
                    });
                    break;
            }
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });
    
    ws.on('close', () => {
        if (playerId) {
            const player = players.get(playerId);
            players.delete(playerId);
            
            broadcast({
                type: 'playerLeft',
                player: player ? player.name : 'Unknown',
                playerCount: players.size
            });
        }
        console.log('Player disconnected');
    });
});

function broadcast(data, excludeId = null) {
    const message = JSON.stringify(data);
    players.forEach((player, id) => {
        if (id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(message);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Game server listening on port ${PORT}`);
});
