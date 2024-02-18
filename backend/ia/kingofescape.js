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

        if (isVertical === 1 && boolVerify1 && boolVerify2 && !(!boolVerify3 && !boolVerify4)) {
            return true;
        } else if (isVertical === 0 && boolVerify3 && boolVerify4 && !(!boolVerify1 && !boolVerify2)) {
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

            if (isVertical === 1) {
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

    getAllPossibilityWalls(map, positionIAPlayer, positionOtherPlayer) {
        let allPossibilityWalls = [];

        let time = performance.now();
        for (let [key, values] of map.entries()) {
            let keyX = Number.parseInt(key[1]);
            let keyY = Number.parseInt(key[0]);

            for (let value of values) {
                let valueX = Number.parseInt(value[1]);
                let valueY = Number.parseInt(value[0]);
                let wall;

                if (keyX === valueX - 1) {
                    wall = [key, 1];
                }
                else if (keyY === valueY + 1) {
                    wall = [key, 0];
                }

                if (wall !== undefined) {
                    allPossibilityWalls.push(wall);
                }
            }
        }

        console.log("Time to get all possibility walls:", performance.now() - time, "ms");
        console.log("All possibility walls:", allPossibilityWalls.length);
        return allPossibilityWalls;
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

        if (isVertical === 1) {
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

function heuristicPositionPlayer(positionIAPlayer, aiPlay) {
    if (currentTurn <= 3) {
        return firstsMoves();
    }
    else {
        let newPositionIAPlayer = shortestPath(positionIAPlayer, aiPlay === 1? '69' : '41')[1];
        return {action: "move", value: newPositionIAPlayer};
    }
}

function shortestPath(position, positionXToGoal) {
    let distances = new Map();
    let previous = new Map();
    let visited = new Set();

    // Initialisation des distances avec une valeur infinie sauf pour la position du joueur
    graph.graph.forEach((_, vertex) => {
        distances.set(vertex, Infinity);
    });
    distances.set(position, 0);

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

    for (let i = 1; i < 10; i++) {
        let p = [];
        let vertex = i + positionXToGoal[1];

        while (vertex !== position) {
            p.unshift(vertex);
            vertex = previous.get(vertex);
        }

        if (path.length === 0 || path.length > p.length) {
            path = p;
        }
    }

    path.unshift(position);
    return path;
}



function firstsMoves() {
    if (aiPlay === 1) {
        if (currentTurn === 1) {
            return {action: "wall",value:['49', 0]};
        }
        else if (currentTurn === 2) {
            return {action: "wall", value: ['28', 0]};
        }
        else if (currentTurn === 3) {
            return {action: "wall", value: ['78', 0]};
        }
    }
    else {
        if (currentTurn === 1) {
            return {action: "wall",value: ['53', 0]};
        }
        else if (currentTurn === 2) {
            return {action: "wall", value: ['73', 0]};
        }
        else if (currentTurn === 3) {
            return {action: "wall", value: ['24', 0]};
        }
    }
}

function getPositionIA(gameState, getOpponent) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (gameState.board[i][j] === 1) {
                currentPositionIA = String((j + 1) * 10 + (9 - i));
            }
            else if (getOpponent && gameState.board[i][j] === 2) {
                currentPositionOtherPlayer = String((j + 1) * 10 + (9 - i));
            }
        }
    }
}

function getAllMovements(coordinate, graph, secondPlayerCoordinate) {
    let x = Number.parseInt(coordinate[1]);
    let y = Number.parseInt(coordinate[0]);
    let movements = [];
    let possibleMovements = [String(x + 1 + y * 10) , String(x + 2 + y * 10),
        String((y + 1) * 10 + x), String((y + 2) * 10 + x),
        String(x - 1 + y * 10), String(x - 2 + y * 10),
        String((y - 1) * 10 + x), String((y - 2) * 10 + x)];

    for (let i = 0; i < possibleMovements.length; i += 2) {
        if (secondPlayerCoordinate !== undefined && possibleMovements[i] === secondPlayerCoordinate) {
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

function verifyWallInTab(tab, wall) {
    if (wall !== undefined) {
        for (let i = 0; i < tab.length; i++) {
            if (tab[i][0] === wall[0] && tab[i][1] === wall[1])
                return true;
        }
    }

    return false;
}

function addAllWallInTab(tabGameState, tab) {
    if (tab.length < tabGameState.length) {
        for (let i = 0; i < tabGameState.length; i++) {
            if (!verifyWallInTab(ownWalls, tabGameState)) {
                ownWalls.push(tabGameState[i]);
                graph.addWall(tabGameState[i][0], tabGameState[i][1]);
            }
        }
    }
}


// Public functions
function setup(AIplay) {
    aiPlay = AIplay;
    if (aiPlay === 1) {
        currentPositionIA = '41';
    }
    else {
        currentPositionIA = '69';
    }

    graph = new Graph();
    oldPositionOtherPlayer = undefined;
    currentPositionOtherPlayer = undefined;
    currentTurn = 1;
    ownWalls = [];
    opponentWalls = [];

    console.log("Setup called", aiPlay);
    return currentPositionIA;
}

function nextMove(gameState) {
    oldPositionOtherPlayer = currentPositionOtherPlayer;
    currentPositionOtherPlayer = undefined;

    getPositionIA(gameState, true);
    addAllWallInTab(gameState.opponentWalls, opponentWalls);
    return heuristicPositionPlayer(currentPositionIA, aiPlay);
}

function correction(rightMove) {
    return true;
}

function updateBoard(gameState) {
    getPositionIA(gameState, false);
    addAllWallInTab(gameState.ownWalls, ownWalls);
    currentTurn ++;
    return true;
}

// exports
exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;