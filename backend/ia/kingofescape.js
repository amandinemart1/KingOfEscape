// Private attributes
let aiPlay;
let graph;
let oldPositionOtherPlayer = undefined;
let currentPositionOtherPlayer = undefined;
let currentPositionIA = undefined;
let currentTurn = 1;

/*class GameState {
    constructor(opponentWalls, ownWalls, board) {
        this.opponentWalls = opponentWalls;
        this.ownWalls = ownWalls;
        this.board = board;
    }

    addWall(wall) {
        this.ownWalls.push(wall);
    }

    getRestantWall() {
        return 10 - this.ownWalls.length;
    }

    isGameOver() {
        if (!this.board || !Array.isArray(this.board) || this.board.length === 0) {
            throw new Error("Board is not properly initialized.");
        }

        if (this.board[0].includes(1)) {
            return true;
        }

        // Check if player 2 has reached the bottom row
        if (this.board[this.board.length - 1].includes(2)) {
            return true;
        }

        return false;
    }

    getCurrentPawnPosition() {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] === 1) {
                    // Return the position as {x: i, y: j}
                    // Adjusting for zero-based indexing if necessary
                    return { x: i + 1, y: j + 1 };
                }
            }
        }
        // Return null or an appropriate value if the pawn is not found
        return null;
    }
}

// Define the move object
const move = {
    // Function to create a move object for a move action
    createMove: function(action, value) {
        if (action === "move") {
            return { action: action, value: value };
        } else if (action === "wall") {
            return { action: action, value: value };
        } else if (action === "idle") {
            return { action: action };
        } else {
            throw new Error("Invalid action type");
        }
    }
};*/

// Classes
class Graph {
    constructor() {
        this.initGraph();
    }

    initGraph() {
        this.graph = new Map();
        let matrice = [];

        // create the matrix with coordinates x, y in string
        for (let i = 0; i < 9; i++) {
            matrice[i] = [];
            for (let j = 0; j < 9; j++) {
                matrice[i][j] = String((j + 1) * 10 + (9 - i));
            }
        }

        // add all squares in the graph
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.addVertex(matrice[i][j]);
            }
        }

        // Allow to give link between squares with orientation (right, left, up, down)
        this.addOrientationEdgeGraph(matrice, 0, 1, 9, 9, 0, -1);
        this.addOrientationEdgeGraph(matrice, 1, 0, 9, 9, -1, 0);
        this.addOrientationEdgeGraph(matrice, 0, 0, 8, 9, 1, 0);
        this.addOrientationEdgeGraph(matrice, 0, 0, 9, 8, 0, 1);
    }

    addVertex(vertex) {
        this.graph.set(vertex, new Set());
    }

    addEdge(vertex, node) {
        if (this.graph.has(vertex) && this.graph.has(node)) {
            this.graph.get(vertex).add(node);
            this.graph.get(node).add(vertex);
        }
    }

    verifyEdge(vertex, node) {
        if (this.graph.has(vertex) && this.graph.has(node)) {
            return this.graph.get(vertex).has(node);
        }
        return false;
    }

    verifyPossibilityToPlace(tuple1, tuple2, tuple3, tuple4, isVertical) {
        let boolVerify1 = this.verifyEdge(tuple1, tuple2);
        let boolVerify2 = this.verifyEdge(tuple3, tuple4);
        let boolVerify3 = this.verifyEdge(tuple1, tuple3);
        let boolVerify4 = this.verifyEdge(tuple2, tuple4);

        if (isVertical && boolVerify1 && boolVerify2 && !(!boolVerify3 && !boolVerify4)) {
            return true;
        } else if (!isVertical && boolVerify3 && boolVerify4 && !(!boolVerify1 && !boolVerify2)) {
            return true;
        }

        return false;
    }

    // CoordinatePlayer2 can be undefined
    isPossibleToPlaceWall(position, isVertical, positionIAPlayer, positionOtherPlayer) {
        if (!position) {
            throw new Error("Invalid parameters for wall placement verification1.");
        }

        if ( typeof isVertical !== 'boolean') {
            console.log(isVertical+"999")
            throw new Error("Invalid parameters for wall placement verification2.");
        }
        if (!positionIAPlayer) {
            throw new Error("Invalid parameters for wall placement verification.3");
        }

        let numberPosition1 = Number.parseInt(position);
        let position1 = position;
        let position2 = String(numberPosition1 + 10);
        let position3 = String(numberPosition1 + 1);
        let position4 = String(numberPosition1 + 11);

        if (this.verifyPossibilityToPlace(position1, position2, position3, position4, isVertical)) {
            let mapTest = new Map(this.graph);

            if (isVertical) {
                this.deleteEdgeMap(mapTest, position1, position2);
                this.deleteEdgeMap(mapTest, position3, position4);
            } else {
                this.deleteEdgeMap(mapTest, position1, position3);
                this.deleteEdgeMap(mapTest, position2, position4);
            }

            if (
                this.verifyPossibilityWay(mapTest, positionIAPlayer, aiPlay === 1) &&
                (positionOtherPlayer !== undefined && this.verifyPossibilityWay(mapTest, positionOtherPlayer, false))
            ) {
                return true;
            }
            return true;
        } else {
            return false;
        }
    }

    verifyPossibilityWay(map, vertex, isFirstPlayer) {
        if (!map || !vertex || vertex.length !== 2) {
            throw new Error("Invalid parameters for verifying possibility way.");
        }

        let visited = new Map();

        for (let [key] of map) {
            visited.set(key, false);
        }

        let queue = [];
        queue.push(vertex);
        while (queue.length !== 0) {
            let s = queue.pop();

            if (!visited.get(s)) {
                visited.set(s, true);

                if ((isFirstPlayer && s[1] === "9") || (!isFirstPlayer && s[1] === "1"))
                    return true;

                for (let value of map.get(s)) {
                    if (!visited.get(value)) {
                        queue.push(value);
                    }
                }
            }
        }

        return false;
    }

    addWall(position, isVertical) {
        let numberPosition1 = Number.parseInt(position);
        let position1 = position;
        let position2 = String(numberPosition1 + 10);
        let position3 = String(numberPosition1 + 1);
        let position4 = String(numberPosition1 + 11);

        if (isVertical) {
            this.deleteEdgeMap(this.graph, position1, position2);
            this.deleteEdgeMap(this.graph, position3, position4);
        } else {
            this.deleteEdgeMap(this.graph, position1, position3);
            this.deleteEdgeMap(this.graph, position2, position4);
        }
    }

    deleteEdgeMap(map, vertex, node) {
        if (!map || !vertex || !node || !map.has(vertex) || !map.has(node)) {
            throw new Error("Invalid parameters for deleting edge from the map.");
        }

        map.get(vertex).delete(node);
        map.get(node).delete(vertex);
    }

    addOrientationEdgeGraph(matrice, startI, startJ, endI, endJ, gapI, gapJ) {
        for (let i = startI; i < endI; i++) {
            for (let j = startJ; j < endJ; j++) {
                this.addEdge(matrice[i][j], matrice[i + gapI][j + gapJ]);
            }
        }
    }
}

// Private functions
/*function getPositionPlayer(board) {
    if (!board || !Array.isArray(board) || board.length !== 9) {
        throw new Error("Invalid board format for getting player positions.");
    }

    let currentPositionIA;
    let currentPositionOtherPlayer;

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 1) {
                currentPositionIA = String((j + 1) * 10 + (9 - i));
            } else if (board[i][j] === 2) {
                currentPositionOtherPlayer = String((j + 1) * 10 + (9 - i));
            }
        }
    }

    return { ia: currentPositionIA, opponent: currentPositionOtherPlayer };
}



function getAllChildStates(gameState, playerNumber) {
    let childStates = [];
    console.log(currentPositionIA+"77"+currentPositionOtherPlayer);
    let currentPlayerPosition = playerNumber === 1 ? currentPositionIA : currentPositionOtherPlayer;

    let possiblePawnMoves = getPossiblePawnMoves(gameState);

    for (let pawnMove of possiblePawnMoves) {
        let newBoard = deepCopyBoard(gameState.board);
        console.log("888"+currentPlayerPosition)
        updateBoardForPawnMove(newBoard, currentPlayerPosition, pawnMove);
        childStates.push({
            gameState: new GameState(gameState.opponentWalls, gameState.ownWalls, newBoard),
            move: { type: "move", from: currentPlayerPosition, to: pawnMove },
        });
    }

    // Generate all possible wall placements
    if (gameState.getRestantWall() > 0) {
        let possibleWallPlacements = getPossibleWallPlacements(graph);
        for (let wall of possibleWallPlacements) {
            let newOwnWalls = gameState.ownWalls.slice();
            newOwnWalls.push(wall);
            let newGameState = new GameState(gameState.opponentWalls, newOwnWalls, gameState.board);
            childStates.push({
                gameState: newGameState,
                move: { type: "wall", position: wall[0], orientation: wall[1] },
            });
        }
    }

    return childStates;
}

function getPossiblePawnMoves(gameState) {
    // Assuming currentPosition is a string like '54' (row 5, column 4)
    // Get all connected vertices (possible moves) from the current position
    let connectedVertices = getPositionPlayer(gameState.board);
    let possibleMoves = [];

    if (connectedVertices.ia) {
        possibleMoves.push(connectedVertices.ia);
    }

    return possibleMoves;
}

function deepCopyBoard(board) {
    return board.map((row) => [...row]);
}

function stateEvaluationHeuristic(gameState, aiPlay) {
    let playerPosition = gameState.getCurrentPawnPosition();
    let distanceToGoal = Math.abs(playerPosition.x - (aiPlay === 1 ? gameState.board.length : 1));
    let goalBonus = 100 - distanceToGoal;
    let blockedPenalty = distanceToGoal === 0 && playerPosition.x !== (aiPlay === 1 ? gameState.board.length : 1) ? -500 : 0;
    let wallBonus = gameState.getRestantWall() * 10;
    let evaluation = goalBonus + blockedPenalty + wallBonus;
    return evaluation;
}

function updateBoardForPawnMove(board, oldPosition, newPosition) {
        if (!oldPosition || newPosition) {
            console.error("Current player position is undefined.");
            return;
        }

        let [oldX, oldY] = getPositionCoordinates(oldPosition);
        let [newX, newY] = getPositionCoordinates(newPosition);

        board[oldX][oldY] = 0; // Assuming 0 represents an empty cell
        board[newX][newY] = aiPlay; // Assuming aiPlay is 1 or 2 based on the player
    }


function getPositionCoordinates(position) {
    // Afficher la position pour vérification
    console.log("Position reçue :", position);

    let x = 9 - parseInt(position.charAt(1), 10);
    let y = parseInt(position.charAt(0), 10) - 1;
    return [x, y];
}

function updateGraphForWallPlacement(graph, position, isVertical) {
    if (!graph.isPossibleToPlaceWall(position, isVertical, currentPositionIA, currentPositionOtherPlayer)) {
        return false;
    }

    // Update the graph to reflect the wall placement
    let numberPosition = Number.parseInt(position);
    let position1 = position;
    let position2 = String(numberPosition + (isVertical ? 10 : 1));
    let position3 = String(numberPosition + (isVertical ? 1 : 10));
    let position4 = String(numberPosition + (isVertical ? 11 : 11));

    if (isVertical) {
        graph.deleteEdgeMap(graph.graph, position1, position2);
        graph.deleteEdgeMap(graph.graph, position3, position4);
    } else {
        graph.deleteEdgeMap(graph.graph, position1, position3);
        graph.deleteEdgeMap(graph.graph, position2, position4);
    }

    return true;
}
function getPossibleWallPlacements(graph) {
    let possibleWallPlacements = [];

    // Utiliser les positions simulées au lieu de celles obtenues à partir de l'état actuel du jeu
    let simulatedCurrentPositionIA = "54"; // Position simulée de l'IA
    let simulatedCurrentPositionOtherPlayer = "34"; // Position simulée de l'autre joueur

    // Itérer à travers toutes les positions potentielles de murs
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            let position = String(i * 10 + j);

            // Vérifier les placements de murs possibles en utilisant les positions simulées
            if (graph.isPossibleToPlaceWall(position, true, simulatedCurrentPositionIA, simulatedCurrentPositionOtherPlayer)) {
                possibleWallPlacements.push([position, 1]); // 1 pour vertical
            }
            if (graph.isPossibleToPlaceWall(position, false, simulatedCurrentPositionIA, simulatedCurrentPositionOtherPlayer)) {
                possibleWallPlacements.push([position, 0]); // 0 pour horizontal
            }
        }
    }

    return possibleWallPlacements;
}

function minimax(gameState, depth, maximizingPlayer) {
    if (depth === 0 || gameState.isGameOver()) {
        return stateEvaluationHeuristic(gameState, aiPlay);
    }

    let bestValue = maximizingPlayer ? -Infinity : Infinity;

    let childStates = getAllChildStates(gameState, aiPlay);
    for (let child of childStates) {
        let value = minimax(child.gameState, depth - 1, !maximizingPlayer);

        if (maximizingPlayer) {
            bestValue = Math.max(bestValue, value);
        } else {
            bestValue = Math.min(bestValue, value);
        }
    }
    return bestValue;
}

function minimaxAgent(playerOneMinimax, gameState) {
    let d = {};
    let childStates = getAllChildStates(gameState, playerOneMinimax);

    for (let child of childStates) {
        let value = minimax(child.gameState, 3, false);
        d[value] = child;
    }
    return chooseAction(d, gameState);
}

function chooseAction(d, gameState) {
    if (Object.keys(d).length === 0) {
        return null;
    }
    let k = Math.max(...Object.keys(d));
    let winner = d[k];
    let action = winner.move;

    if (action.type === "move") {
        // Create a move object for a move action
        let moveObj = move.createMove("move", action.value);
    } else {
        // Create a move object for a wall placement action
        let moveObj = move.createMove("wall", action.position);
    }
    return action;
}

// Define a simple game state for testing
// Create a new GameState object for testing
let gameState = new GameState(
    [], // opponentWalls
    [["21", 0], ["23", 1]], // ownWalls
    [ // board with a different configuration
        [-1, 0, -1, 0, -1, 0, -1, 0, -1],
        [0, -1, 0, -1, 0, -1, 0, -1, 0],
        [-1, 1, -1, 0, -1, 0, -1, 0, -1],
        [0, -1, 0, -1, 0, -1, 0, -1, 0],
        [-1, 0, -1, 0, -1, 0, -1, 0, -1],
        [0, -1, 0, -1, 0, -1, 0, -1, 0],
        [-1, 0, -1, 0, -1, 0, -1, 0, -1],
        [0, -1, 0, -1, 0, -1, 0, -1, 0],
        [-1, 0, -1, 0, -1, 2, -1, 0, -1]
    ]
);*/

function heuristicPositionPlayer(positionIAPlayer, aiPlay) {
    if (currentTurn <= 3) {
        return firstsMoves();
    }
    else {
        newPositionIAPlayer = shortestPath(positionIAPlayer,aiPlay);
        return {action: "move", value: newPositionIAPlayer};
    
    }
}

function shortestPath(positionIAPlayer, aiPlay) {
    let distances = new Map();
    let previous = new Map();
    let visited = new Set();
    if (aiPlay === 1) {
        positionGoal = '69'
    }
    else {
        positionGoal = '41' 
    }

    // Initialisation des distances avec une valeur infinie sauf pour la position du joueur
    graph.graph.forEach((_, vertex) => {
        distances.set(vertex, Infinity);
    });
    distances.set(positionIAPlayer, 0);

    // Algorithme de Dijkstra
    while (visited.size < graph.graph.size) {
        let minVertex = null;
        let minDistance = Infinity;

        // Trouver le prochain sommet non visité avec la plus petite distance
        graph.graph.forEach((_, vertex) => {
            if (!visited.has(vertex) && distances.get(vertex) < minDistance) {
                minVertex = vertex;
                minDistance = distances.get(vertex);
            }
        });

        if (minVertex === null) {
            break;
        }

        // Marquer le sommet comme visité
        visited.add(minVertex);

        // Mettre à jour les distances des voisins non visités
        graph.graph.get(minVertex).forEach(neighbor => {
            if (!visited.has(neighbor)) {
                let distance = distances.get(minVertex) + 1; // Poids de l'arête = 1 dans ce cas
                if (distance < distances.get(neighbor)) {
                    distances.set(neighbor, distance);
                    previous.set(neighbor, minVertex);
                }
            }
        });
    }

    // Reconstitution du chemin le plus court jusqu'à la case 69
    let path = [];
    let vertex = positionGoal; 
    while (vertex !== positionIAPlayer) {
        path.unshift(vertex);
        vertex = previous.get(vertex);
    }
    path.unshift(positionIAPlayer);

    console.log("Shortest Path:", path);
    return path[1];
}



function firstsMoves() {
    if (aiPlay === 1) {
        if (currentTurn === 1) {
            return {action: "wall",value:['49','0']};
        }
        else if (currentTurn === 2) {
            return {action: "wall", value: ['28','0']};
        }
        else if (currentTurn === 3) {
            return {action: "wall", value: ['78','0']};
        }
    }
    else {
        if (currentTurn === 1) {
            return {action: "wall",value: ['52','0']};
        }
        else if (currentTurn === 2) {
            return {action: "wall", value: ['73','0']};
        }
        else if (currentTurn === 3) {
            return {action: "wall", value: ['24','0']};
        }
    }
}


aiPlay = 1; // Set AI as player 1 for testing
graph = new Graph(); // Initialize the graph object
//let bestMove = minimaxAgent(1, gameState); // Suppose the AI plays as player 1
//console.log("Best Move chosen by Minimax:", bestMove);

// Public functions
function setup(AIplay) {
    aiPlay = AIplay;
    if (aiPlay === 1) {
        currentPositionIA = '49';
    }
    else {
        currentPositionIA = '61';
    }
    return currentPositionIA;
}

function nextMove(gameState) {
    oldPositionOtherPlayer = currentPositionOtherPlayer;
    //getPositionPlayer(gameState.board);
    return heuristicPositionPlayer(currentPositionIA, aiPlay);
}

function correction(rightMove) {
    return true;
}

function updateBoard(gameState) {
    console.log("Update board called",gameState);
    currentTurn ++; 
    return true;
}

// exports
exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;
