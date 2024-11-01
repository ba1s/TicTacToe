// server.js
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

const games = {}; // Store game sessions

server.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const { action, gameId, player, move } = data;

        if (action === 'createGame') {
            const newGameId = Date.now().toString();
            games[newGameId] = { players: [ws], board: Array(9).fill(null), turn: 'X' };
            ws.send(JSON.stringify({ action: 'gameCreated', gameId: newGameId, player: 'X' }));
        } else if (action === 'joinGame') {
            const game = games[gameId];
            if (game && game.players.length === 1) {
                game.players.push(ws);
                game.players[1].send(JSON.stringify({ action: 'gameJoined', gameId, player: 'O' }));
                game.players[0].send(JSON.stringify({ action: 'playerJoined', gameId }));
            } else {
                ws.send(JSON.stringify({ action: 'error', message: 'Game full or not found' }));
            }
        } else if (action === 'makeMove') {
            const game = games[gameId];
            if (game && game.board[move] === null && game.turn === player) {
                game.board[move] = player;
                game.turn = player === 'X' ? 'O' : 'X';
                game.players.forEach((playerSocket, idx) => {
                    playerSocket.send(JSON.stringify({ action: 'moveMade', gameId, move, player }));
                });
            }
        }
    });
});