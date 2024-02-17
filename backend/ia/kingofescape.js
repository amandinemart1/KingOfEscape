// Private attributes
let aiPlay;
let graph;
let oldPositionOtherPlayer = undefined;
let currentPositionOtherPlayer = undefined;
let currentPositionIA = undefined;
let currentTurn = 1;

let ownWalls = [];
let opponentWalls = [];

// Classes
class Graph {
    constructor() {
        this.#initGraph();
    }

    #initGraph() {
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
        this.#addOrientationEdgeGraph(matrice, 0, 1, 9, 9, 0, -1);
        this.#addOrientationEdgeGraph(matrice, 1, 0, 9, 9, -1, 0);
        this.#addOrientationEdgeGraph(matrice, 0, 0, 8, 9, 1, 0);
        this.#addOrientationEdgeGraph(matrice, 0, 0, 9, 8, 0, 1);
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

    #verifyPossibilityToPlace(tuple1, tuple2, tuple3, tuple4, isVertical) {
        let boolVerify1 = this.verifyEdge(tuple1, tuple2);
        let boolVerify2 = this.verifyEdge(tuple3, tuple4);
        let boolVerify3 = this.verifyEdge(tuple1, tuple3);
        let boolVerify4 = this.verifyEdge(tuple2, tuple4);

        if (isVertical === "1" && boolVerify1 && boolVerify2 && !(!boolVerify3 && !boolVerify4)) {
            return true;
        } else if (isVertical === "0" && boolVerify3 && boolVerify4 && !(!boolVerify1 && !boolVerify2)) {
            return true;
        }

        return false;
    }

    // CoordinatePlayer2 can be undefined
    isPossibleToPlaceWall(position, isVertical, positionIAPlayer, positionOtherPlayer) {
        let numberPosition1 = Number.parseInt(position);
        let position1 = position;
        let position2 = String(numberPosition1 + 10);
        let position3 = String(numberPosition1 + 1);
        let position4 = String(numberPosition1 + 11);

        if (this.#verifyPossibilityToPlace(position1, position2, position3, position4, isVertical)) {
            let mapTest = new Map(this.graph);

            if (isVertical === "1") {
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
        let position3 = String(numberPosition1 - 1);
        let position4 = String(numberPosition1 + 9);

        if (isVertical === "1") {
            this.deleteEdgeMap(this.graph, position1, position2);
            this.deleteEdgeMap(this.graph, position3, position4);
        }
        else {
            this.deleteEdgeMap(this.graph, position1, position3);
            this.deleteEdgeMap(this.graph, position2, position4);
        }
    }

    deleteEdgeMap(map, vertex, node) {
        map.get(vertex).delete(node);
        map.get(node).delete(vertex);
    }

    #addOrientationEdgeGraph(matrice, startI, startJ, endI, endJ, gapI, gapJ) {
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
}*/

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
        currentPositionIA = '41';
    }
    else {
        currentPositionIA = '69';
    }
    console.log("Setup called",aiPlay);
    return currentPositionIA;
}

function nextMove(gameState) {
    oldPositionOtherPlayer = currentPositionOtherPlayer;
    if (opponentWalls.length < gameState.opponentWalls.length) {
        for (let i = 0; i < gameState.opponentWalls.length; i++) {
            if (opponentWalls.indexOf(gameState.opponentWalls[i]) === -1) {
                opponentWalls.push(gameState.opponentWalls[i]);
                graph.addWall(gameState.opponentWalls[i][0], gameState.opponentWalls[i][1]);
            }
        }
    }
    //getPositionPlayer(gameState.board);
    return heuristicPositionPlayer(currentPositionIA, aiPlay);
}

function correction(rightMove) {
    return true;
}

function updateBoard(gameState) {
    // console.log("Update board called",gameState);
    console.log(graph);
    if (ownWalls.length < gameState.ownWalls.length) {
        for (let i = 0; i < gameState.ownWalls.length; i++) {
            if (ownWalls.indexOf(gameState.ownWalls[i]) === -1) {
                ownWalls.push(gameState.ownWalls[i]);
                graph.addWall(gameState.ownWalls[i][0], gameState.ownWalls[i][1]);
            }
        }
    }

    currentTurn ++; 
    return true;
}

// exports
exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;
