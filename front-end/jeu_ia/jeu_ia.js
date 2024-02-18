import {createTable, printPlayer, printWall, removePlayer} from "../js/affichage_jeu.js";

let aiPlay = Number.parseInt(prompt('AIPlay', '2'));
let positionPlayer = prompt('PositionPlayer', '51');

const socket = io.connect('/api/game');
let player2Affiche = false;

socket.on('connect', () => {
    console.log('Connecté au serveur.');
    socket.emit('setup', {positionPlayer: positionPlayer, aiPlay: aiPlay});

    socket.on('updateBoardInTurn', (object) => {
        if (object.move !== undefined) {
            removePlayer(aiPlay === 2);
            printPlayer(object.move, aiPlay === 2);
        }
        else {
            printWall(object.wall, aiPlay === 2)
        }

    });

    socket.on('updateBoard', (data) => {
        removePlayer(aiPlay === 1);
        console.log(data);

        if (data.ia.action === 'move') {
            if (data.position !== undefined) {
                printPlayer(data.ia.value, aiPlay !== 2);
            }
        }
        else {
            printWall(data.ia.value, aiPlay !== 2);
        }

        window.alert('C\'est à vous de jouer');
    });

    socket.on('endGame', () => {
        window.alert('Partie terminée');
    });
});

function move(idDiv) {
    let split = idDiv.split(' ');
    let x = Number.parseInt(split[2]);
    let y = Number.parseInt(split[1]);
    let newCoordinate = String(y * 10 + x);
    socket.emit('move', newCoordinate);

}

function endTurn() {
    socket.emit('endTurn');
}

function placeWall(idDiv) {
    let split = idDiv.split(' ');
    let letter = split[0];
    let x = Number.parseInt(split[2]);
    let y = Number.parseInt(split[1]);
    let wall = {action: "wall", value: [String(y * 10 + x), letter === 'V'? 1 : 0]};
    socket.emit('placeWall', wall);
}


// A modifier quand on choisira le numéro du joueur
createTable(positionPlayer, aiPlay === 2, move, placeWall);

export {endTurn};