const WebSocket = require('ws');
const http = require('http');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3000;
const HEARTBEAT_INTERVAL = 30000;

function generatePlayerId() {
    try {
        return randomUUID();
    } catch (error) {
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
}

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Game WebSocket Server Running\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected players
const players = new Map();

function sanitizePlayerName(name) {
    if (typeof name !== 'string') return 'Player';
    return name.trim().slice(0, 50) || 'Player';
}

function sanitizeChatMessage(message) {
    if (typeof message !== 'string') return '';
    return message.trim().slice(0, 280);
}

function sanitizeCombatEvent(event) {
    if (typeof event !== 'string') return '';
    return event.trim().slice(0, 200);
}

function sendError(ws, message, code = 'bad_request') {
    ws.send(
        JSON.stringify({
            type: 'error',
            code,
            message
        })
    );
}

function ensurePlayerJoined(ws, playerId) {
    if (playerId) return true;
    sendError(ws, 'Join the game before sending actions.', 'not_joined');
    return false;
}

wss.on('connection', (ws) => {
    console.log('New player connected');

    let playerId = null;

    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'join':
                    if (playerId) {
                        sendError(ws, 'Already joined.', 'conflict');
                        return;
                    }

                    playerId = generatePlayerId();
                    const playerName = sanitizePlayerName(data.player);
                    players.set(playerId, {
                        id: playerId,
                        name: playerName,
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
                        player: playerName,
                        playerCount: players.size
                    }, playerId);
                    break;

                case 'move':
                    if (!ensurePlayerJoined(ws, playerId)) return;

                    if (!Number.isFinite(data.x) || !Number.isFinite(data.y)) {
                        sendError(ws, 'Movement requires numeric coordinates.');
                        return;
                    }

                    // Broadcast player movement
                    broadcast({
                        type: 'playerMove',
                        playerId: playerId,
                        x: data.x,
                        y: data.y
                    }, playerId);
                    break;

                case 'combat':
                    if (!ensurePlayerJoined(ws, playerId)) return;

                    const combatEvent = sanitizeCombatEvent(data.event);
                    if (!combatEvent) {
                        sendError(ws, 'Combat event description required.');
                        return;
                    }

                    // Broadcast combat events
                    broadcast({
                        type: 'combatEvent',
                        playerId: playerId,
                        event: combatEvent
                    }, playerId);
                    break;

                case 'chat':
                    if (!ensurePlayerJoined(ws, playerId)) return;

                    // Broadcast chat messages
                    const player = players.get(playerId);
                    const messageText = sanitizeChatMessage(data.message);
                    if (!messageText) return;
                    broadcast({
                        type: 'chat',
                        player: player ? player.name : 'Unknown',
                        message: messageText
                    });
                    break;
                default:
                    sendError(ws, 'Unknown message type.', 'unsupported');
            }
        } catch (e) {
            console.error('Error parsing message:', e);
            sendError(ws, 'Invalid message format.');
        }
    });

    ws.on('close', () => {
        removePlayer(playerId);
        console.log('Player disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        removePlayer(playerId);
    });
});

const heartbeat = setInterval(() => {
    wss.clients.forEach((client) => {
        if (client.isAlive === false) {
            client.terminate();
            return;
        }

        client.isAlive = false;
        client.ping();
    });
}, HEARTBEAT_INTERVAL);

function removePlayer(playerId) {
    if (!playerId) return;
    const player = players.get(playerId);
    if (!player) return;

    players.delete(playerId);
    broadcast({
        type: 'playerLeft',
        player: player ? player.name : 'Unknown',
        playerCount: players.size
    });
}

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

wss.on('close', () => {
    clearInterval(heartbeat);
});
