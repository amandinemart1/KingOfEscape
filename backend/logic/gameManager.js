const { setup, nextMove, correction, updateBoard } = require('../ia/kingofescape.js');
const { GraphGameManager } = require('./graphGameManager.js').GraphGameManager;
const { GameState } = require('./gameState.js');
const {VisibilityMatrix} = require('./visibilityMatrix.js').visibilityMatrix;

class GameManager {
    constructor(positionPlayer, AIPlay) {
        let position1 = (AIPlay === 1) ? setup() : positionPlayer;
        let position2 = (AIPlay === 2) ? setup() : positionPlayer;
        this.gameState1 = new GameState(position1);
        this.gameState2 = new GameState(position2);
        this.graphe = new GraphGameManager();
        this.actionRealise = undefined;
        this.visibilityMatrix = new VisibilityMatrix(position1, position2);
        this.aiPlay = AIPlay;
        setup(AIPlay);
    }

    playIA() {
        let board = this.getBoard();
        let gameState = {
            opponentWalls: this.aiPlay === 1 ? this.gameState2.ownWall : this.gameState1.ownWall,
            ownWalls: this.aiPlay === 1 ? this.gameState1.ownWall : this.gameState2.ownWall,
            board: board
        };

        let move = nextMove(gameState);

        if (move.action === "move") {
            if (!this.moveCharacters(move.value)) {
                let movePossible = getMovements(this.gameState1.position, this.graphe, this.gameState2.position);
                this.moveCharacters(movePossible[0]);
                move.value = movePossible[0];
                correction(movePossible[0]);
            }
        }
        else {
            if (!this.placeWall(move.value)) {
                let movePossible = getMovements(this.gameState1.position, this.graphe, this.gameState2.position);
                move.action = "move";
                move.value = movePossible[0];
                this.moveCharacters(movePossible[0]);
                correction(movePossible[0]);
            }
        }

        board = this.getBoard();
        gameState = {
            opponentWalls: this.aiPlay === 1 ? this.gameState2.ownWall : this.gameState1.ownWall,
            ownWalls: this.aiPlay === 1 ? this.gameState1.ownWall : this.gameState2.ownWall,
            board: board
        };
        updateBoard(gameState);
        this.update(this.isPlayerOne());
        return move;
    }

    getBoard() {
        let board = [];
        for (let i = 9; i > 0; i--) {
            let index = [];
            for (let j = 1; j < 10; j++) {
                index.push(this.visibilityMatrix.canSeeSquare(String(j * 10 + i), this.aiPlay === 1)? 0 : -1);
            }
            board.push(index);
        }

        let iaPosition = this.aiPlay === 1 ? this.gameState1.position : this.gameState2.position;
        board[9 - Number.parseInt(iaPosition[1])][Number.parseInt(iaPosition[0]) - 1] = 1;

        if (this.getOtherPlayer(this.aiPlay === 1) !== undefined) {
            let otherPlayerPosition = this.gameState2.position;
            board[9 - Number.parseInt(otherPlayerPosition[1])][Number.parseInt(otherPlayerPosition[0]) - 1] = 2;
        }

        return board;
    }


    placeWall(wall) {
        let isPlayerOne = this.isPlayerOne();
        let gameStateActual = isPlayerOne ? this.gameState1 : this.gameState2;

        if (this.actionRealise === undefined && gameStateActual.getRestantWall() > 0) {
            let coordinatePlayer1 = this.gameState1.position;
            let coordinatePlayer2 = this.gameState2.position;
            let isAdded = this.graphe.addWall(wall[0], wall[1], coordinatePlayer1, coordinatePlayer2, isPlayerOne);

            if (isAdded) {
                gameStateActual.addWall(wall[0], wall[1]);
                this.actionRealise = wall;
                this.visibilityMatrix.updateMatrixWall(wall[0], isPlayerOne);
                return true;
            }
        }

        return false;
    }

    moveCharacters(newCoordinate) {
        if (this.actionRealise === undefined) {
            if (this.verifyMoves(newCoordinate)) {
                let boolPlayerOne = this.isPlayerOne();
                let gameStateActual = boolPlayerOne ? this.gameState1 : this.gameState2;

                this.visibilityMatrix.updateMoveCharacter(gameStateActual.position, newCoordinate, boolPlayerOne);
                gameStateActual.changePosition(newCoordinate);
                this.actionRealise = newCoordinate;
                return true;
            }
        }

        return false;
    }

    verifyMoves(newCoordinate) {
        let boolPlayerOne = this.isPlayerOne();
        let gameStateActual = boolPlayerOne ? this.gameState1 : this.gameState2;
        let otherGameState = boolPlayerOne ? this.gameState2 : this.gameState1;

        return verifyMoves(newCoordinate, gameStateActual.position, this.graphe, otherGameState.position)
    }

    update(isPlayerOne) {
        let gameStateActual = isPlayerOne ? this.gameState1 : this.gameState2;
        this.actionRealise = undefined;
        gameStateActual.turn++;
    }

    getOtherPlayer(isPlayerOne) {
        let gameStateActual = isPlayerOne ? this.gameState1 : this.gameState2;
        let gameStateOther = isPlayerOne ? this.gameState2 : this.gameState1;
        let coordinatePlayerActual = gameStateActual.position;
        let coordinatePlayerOther = gameStateOther.position;
        let playerActualX = Number.parseInt(coordinatePlayerActual[1]);
        let playerOtherX = Number.parseInt(coordinatePlayerOther[1]);
        let playerActualY = Number.parseInt(coordinatePlayerActual[0]);
        let playerOtherY = Number.parseInt(coordinatePlayerOther[0]);

        if ((playerActualY === playerOtherY &&
                (playerActualX === playerOtherX + 1 || coordinatePlayerActual.x === playerOtherX - 1))
            || (playerActualX === playerOtherX &&
                (playerActualY === playerOtherY + 1 || playerActualY === playerOtherY - 1))){
            return gameStateOther.position;
        }
        else if (this.visibilityMatrix.canSeeSquare(coordinatePlayerOther, this.isPlayerOne())) {
            return gameStateOther.position;
        }

        return undefined;
    }

    isPlayerOne() {
        return this.gameState1.turn === this.gameState2.turn;
    }

    isEndGame() {
        console.log("endGame", this.gameState1.position, this.gameState2.position);
        return this.gameState1.position[1] === '9'
            || this.gameState2.position[1] === '1'
            || (this.gameState1.turn >= 100 && this.gameState2.turn >= 100);
    }
}


function getMovements(coordinate, graph, secondPlayerCoordinate) {
    let x = Number.parseInt(coordinate[1]);
    let y = Number.parseInt(coordinate[0]);
    let movements = [];
    let possibleMovements = [String(x + 1 + y * 10) , String(x + 2 + y * 10),
        String((y + 1) * 10 + x), String((y + 2) * 10 + x),
        String(x - 1 + y * 10), String(x - 2 + y * 10),
        String((y - 1) * 10 + x), String((y - 2) * 10 + x)];

    for (let i = 0; i < possibleMovements.length; i += 2) {
        if (possibleMovements[i] === secondPlayerCoordinate) {
            if (graph.verifyEdge(secondPlayerCoordinate, possibleMovements[i + 1])) {
                movements.push(possibleMovements[i + 1]);
            }
        }
        else if (graph.verifyEdge(coordinate, possibleMovements[i])) {
            movements.push(possibleMovements[i]);
        }
    }

    return movements;
}

function verifyMoves(newCoordinate, oldCoordinate, graphe, secondPlayerCoordinate) {
    let movements = getMovements(oldCoordinate, graphe, secondPlayerCoordinate);
    return movements.includes(newCoordinate);
}

exports.gameManager = { GameManager };