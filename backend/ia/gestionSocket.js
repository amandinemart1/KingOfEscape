const {GameManager} = require('../logic/GameManager.js').gameManager;
let game;
let aiPlay = 2;

function initSocket(io) {
    const gameSocket = io.of("/api/game");

    gameSocket.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('setup', (set) => {
            game = new GameManager(set.positionPlayer, set.aiPlay);

            aiPlay = set.aiPlay;
            if (set.aiPlay === 1) {
                let move = game.playIA();
                let position = game.getOtherPlayer(false);
                socket.emit('updateBoard', {ia: move, position: position});
            }
        });


        socket.on('move', (position) => {
            let newCoordinate = position;
            let isMove = game.moveCharacters(position);

            if (isMove) {
                if (game.isEndGame()) {
                    socket.emit('endGame', 'ok');
                }
                socket.emit('updateBoardInTurn', {move: newCoordinate});
            }
            else {
                socket.emit('move', {status: 'Fail', error: 'Mouvement impossible'});
            }
        });

        socket.on('endTurn', () => {
            game.update(game.isPlayerOne());
            let move = game.playIA();
            let position = game.getOtherPlayer(game.isPlayerOne());
            socket.emit('updateBoard', {ia: move, position: position});
        });

        socket.on('placeWall', (json) => {
            let isPlace = game.placeWall(json.value);

            if (isPlace) {
                socket.emit('updateBoardInTurn', {wall : json.value});
            }
            else {
                socket.emit('placeWall', {status: 'Fail', error: 'Mur impossible'});
            }
        });
    });


}



exports.initSocket = {initSocket};