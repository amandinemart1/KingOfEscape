// Constante
const numCase = 9;
const cssGrid = 0.6;
const lengthBetweenCell = 10;

// Get Square Canvas for don't had cell rectangle and length cell
let lengthSquareCanvas = 0;
let lengthSquare = 0;
let lengthCell = 0

// Get the difference between the canvas and the square canvas for center the grid
let widthBeetween = 0;
let heightBeetween = 0;

// Matrice of visibility
let visibilityMatrix = [];



// class
class Wall {
    constructor(tuple1, tuple4, isVertical) {
        this.tuple1 = tuple1;
        this.tuple4 = tuple4;
        this.isVertical = isVertical;
    }
}

class Tuple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return this.x + "," + this.y;
    }

    static toStringXY(x, y) {
        return x + "," + y;
    }
}

class Graph {
    /**
     * Class constructor
     */
    constructor() {
        this.graph = new Map();
    }

    /**
     * Add vertex to the graph
     * @param vertex
     */
    addVertex(vertex) {
        this.graph.set(vertex, new Set());
    }

    /**
     * Add link between two vertex
     * @param vertex first vertex
     * @param node second vertex
     */
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

    addWall(wall) {
        let tuple1 = wall.tuple1.toString();
        let tuple4 = wall.tuple4.toString();
        let tuple2 = Tuple.toStringXY(wall.tuple4.x, wall.tuple1.y);
        let tuple3 = Tuple.toStringXY(wall.tuple1.x, wall.tuple4.y);
        let boolVerify1 = this.verifyEdge(tuple1, tuple2);
        let boolVerify2 = this.verifyEdge(tuple3, tuple4);
        let boolVerify3 = this.verifyEdge(tuple1, tuple3);
        let boolVerify4 = this.verifyEdge(tuple2, tuple4);

        if (wall.isVertical && boolVerify1 && boolVerify2 && !(boolVerify3 && boolVerify4)) {
            this.deleteEdge(tuple1, tuple2);
            this.deleteEdge(tuple3, tuple4);
            return true;
        }
        else if (!wall.isVertical && boolVerify3 && boolVerify4 && !(boolVerify1 && boolVerify2)) {
            this.deleteEdge(tuple1, tuple3);
            this.deleteEdge(tuple2, tuple4);
            return true;
        }

        return false;
    }

    /**
     * Delete link between two vertex
     * @param vertex first vertex
     * @param node second vertex
     */
    deleteEdge(vertex, node) {
        if (this.graph.has(vertex) && this.graph.has(node)) {
            this.graph.get(vertex).delete(node);
            this.graph.get(node).delete(vertex);
        }
    }

    /**
     * Print the graph
     */
    print() {
        for (let [key, value] of this.graph) {
            console.log(key, value);
        }
    }
}



function chargementPage() {
    let canvas = document.getElementById("canvas");
    console.log("chargement de la page");
    //initCanvas(canvas);
    //canvas.addEventListener("click", function(e) {detect(canvas, e);});
    //buildVisibilityMatrice();
    let g = initGraph();
    createGrid(document.getElementById("canvas"));
    console.log("fin chargement de la page");
    console.log(g);
    console.log(visibilityMatrix);

    //  En cours de test
    let s = null;
    while ( s !== "FINI") {
        s = prompt("Entrez un mur : ");
        let split = s.split(";");
        let tuple1 = new Tuple(split[0].split(",")[0], split[0].split(",")[1]);
        let tuple4 = new Tuple(split[1].split(",")[0], split[1].split(",")[1]);
        let wall = new Wall(tuple1, tuple4, split[2].valueOf());
        console.log(g.addWall(wall));
    }
}


function buildVisibilityMatrice() {
    fillMatrix(0, 4, -1);
    fillMatrix(4, 5, 0);
    fillMatrix(5, 9, 1);
}

/**
 * Initialize the graph
 * @returns {Graph} graph class initialized
 */
function initGraph() {
    let graph = new Graph();
    let matrice = []

    // create the matrice with coordinates x, y in string
    for (let i = 0; i < 9; i++) {
        matrice[i] = [];
        for (let j = 0; j < 9; j++) {
            matrice[i][j] = transformTwoIntegersInString(i, j);
        }
    }

    // add all squares in the graph
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            graph.addVertex(matrice[i][j]);
        }
    }

    // Allow to give link between squares with orientation (right, left, up, down)
    addOrientationEdgeGraph(graph, matrice, 0, 1, 9, 9, 0, -1);
    addOrientationEdgeGraph(graph, matrice, 1, 0, 9, 9, -1, 0);
    addOrientationEdgeGraph(graph, matrice, 0, 0, 8, 9, 1, 0);
    addOrientationEdgeGraph(graph, matrice, 0, 0, 9, 8, 0, 1);

    return graph;
}

function transformTwoIntegersInString(first, second) {
    return first.toString() + "," + second.toString();
}

/**
 * Add all edges in the graph with the orientation
 * @param graph graph class
 * @param matrice matrice with coordinates x, y in string
 * @param startI start index i
 * @param startJ start index j
 * @param endI end index i
 * @param endJ end index j
 * @param gapI gap index i
 * @param gapJ gap index j
 */
function addOrientationEdgeGraph(graph, matrice, startI, startJ, endI, endJ, gapI, gapJ) {
    for (let i = startI; i < endI; i++) {
        for (let j = startJ; j < endJ; j++) {
            graph.addEdge(matrice[i][j], matrice[i + gapI][j + gapJ]);
        }
    }
}

/**
 * Verify if one way is possible for a player
 * @param graph graph class
 * @param cellX cell x where the player is
 * @param cellY cell y where the player is
 * @param isFirstPlayer boolean to know if it's the first player
 * @returns {boolean} true if one way is possible, false otherwise
 */
function verifyPossibilityWay(graph, cellX, cellY, isFirstPlayer) {
    let vertex = transformTwoIntegersInString(cellX, cellY);
    let visited = new Map();

    for (let [key] of graph.graph) {
        visited.set(key, false);
    }

    let queue = [];
    queue.push(vertex);
    visited.set(vertex, true);

    while (queue.length !== 0) {
        let s = queue.pop();
        let firstChar = s.charAt(0);

        if ((isFirstPlayer && firstChar === '8') || (!isFirstPlayer && firstChar === '0'))
            return true;

        for (let value of graph.graph.get(s)) {
            if (!visited.get(value)) {
                visited.set(value, true);
                queue.push(value);
            }
        }
    }

    return false;
}

function fillMatrix(indexYStart, indexYEnd, value) {
    for (let i = indexYStart; i < indexYEnd; i++) {
        let line = [];

        for (let j = 0; j < 9; j++) {
            line.push(value);
        }

        visibilityMatrix.push(line);
    }
}



function placeWall(caseX, caseY, canvas, isBottom) {
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";

    if (isBottom) {
        ctx.fillRect(widthBeetween + caseX * lengthCell,
            heightBeetween + caseY * lengthCell+ lengthSquare, lengthCell * 2, lengthBetweenCell);
    }
    else {
        ctx.fillRect(widthBeetween + caseX * lengthCell + lengthSquare,
            heightBeetween + caseY * lengthCell,
            lengthBetweenCell, lengthCell * 2);
    }
}

function detect(canvas, e) {
    let cursorCanvasX = (e.clientX - widthBeetween - window.innerWidth * 0.2);
    let cursorCanvasY = (e.clientY - heightBeetween - window.innerHeight * 0.2);
    let caseX = Math.floor(cursorCanvasX / lengthCell);
    let caseY = Math.floor(cursorCanvasY / lengthCell);
    let overSquareX = cursorCanvasX % lengthCell;
    let overSquareY = cursorCanvasY % lengthCell;

    if (overSquareX > lengthSquare && overSquareY > lengthSquare) {
        console.log("Out of the square");
    }
    else if (overSquareX > lengthSquare || overSquareY > lengthSquare) {
        placeWall(caseX, caseY, canvas, overSquareY > lengthSquare);
    }
    else {
        console.log("In the square");
    }
}


function createGrid(canvas) {
    // Get Context of Canvas
    let ctx = canvas.getContext("2d");

    // Get Square Canvas for don't had cell rectangle and length cell
    lengthSquareCanvas = Math.min(canvas.width, canvas.height);
    lengthSquare = (lengthSquareCanvas - lengthBetweenCell * (numCase - 1)) / numCase;
    lengthCell = lengthSquare + lengthBetweenCell;

    // Get the difference between the canvas and the square canvas for center the grid
    widthBeetween = Math.max(canvas.width - lengthSquareCanvas, 0) / 2;
    heightBeetween = Math.max(canvas.height - lengthSquareCanvas, 0) / 2;

    ctx.strokeStyle = "black";

    for (let i = 0; i < numCase; i++) {
        for (let j = 0; j < numCase; j++) {
            ctx.strokeRect(widthBeetween + j * lengthCell, heightBeetween + i * lengthCell, lengthSquare, lengthSquare);
        }
    }
}

function initCanvas(canvas) {
    let longueur = window.innerWidth;
    let hauteur = window.innerHeight;
    canvas.width = longueur * cssGrid;
    canvas.height = hauteur * cssGrid;
    createGrid(canvas);
}