class GraphGameManager {
    constructor() {
        this.#initGraph();
    }

    #initGraph() {
        this.graph = new Map();
        let matrice = []

        // create the matrice with coordinates x, y in string
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
        this.#addOrientationEdgeGraph(this.graph, matrice, 0, 1, 9, 9, 0, -1);
        this.#addOrientationEdgeGraph(this.graph, matrice, 1, 0, 9, 9, -1, 0);
        this.#addOrientationEdgeGraph(this.graph, matrice, 0, 0, 8, 9, 1, 0);
        this.#addOrientationEdgeGraph(this.graph, matrice, 0, 0, 9, 8, 0, 1);
    }

    #addOrientationEdgeGraph(graph, matrice, startI, startJ, endI, endJ, gapI, gapJ) {
        for (let i = startI; i < endI; i++) {
            for (let j = startJ; j < endJ; j++) {
                this.addEdge(matrice[i][j], matrice[i + gapI][j + gapJ]);
            }
        }
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

        if (isVertical && boolVerify1 && boolVerify2 && !(!boolVerify3 && !boolVerify4)) {
            return true;
        }
        else if (!isVertical && boolVerify3 && boolVerify4 && !(!boolVerify1 && !boolVerify2)) {
            return true;
        }

        return false;
    }


    // CoordinatePlayer2 can be undefined
    isPossibleToPlaceWall(position, isVertical, positionIAPlayer, positionOtherPlayer, isFirstPlayer) {
        let numberPosition1 = Number.parseInt(position);
        let position1 = position;
        let position2 = String(numberPosition1 + 10);
        let position3 = String(numberPosition1 - 1);
        let position4 = String(numberPosition1 + 9);

        if (this.#verifyPossibilityToPlace(position1, position2, position3, position4, isVertical)) {
            let mapTest = new Map(this.graph);

            if (isVertical) {
                this.deleteEdgeMap(mapTest, position1, position2);
                this.deleteEdgeMap(mapTest, position3, position4);
            }
            else {
                this.deleteEdgeMap(mapTest, position1, position3);
                this.deleteEdgeMap(mapTest, position2, position4);
            }

            return this.verifyPossibilityWay(mapTest, positionIAPlayer, isFirstPlayer)
                && this.verifyPossibilityWay(mapTest, positionOtherPlayer, !isFirstPlayer);
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

    addWall(position, isVertical, player1, player2, isFirstPlayer) {
        let numberPosition1 = Number.parseInt(position);
        let position1 = position;
        let position2 = String(numberPosition1 + 10);
        let position3 = String(numberPosition1 - 1);
        let position4 = String(numberPosition1 + 9);

        if (this.isPossibleToPlaceWall(position, isVertical, player1, player2, isFirstPlayer)) {
            if (isVertical) {
                this.deleteEdgeMap(this.graph, position1, position2);
                this.deleteEdgeMap(this.graph, position3, position4);
            }
            else {
                this.deleteEdgeMap(this.graph, position1, position3);
                this.deleteEdgeMap(this.graph, position2, position4);
            }
            return true;
        }
    }

    deleteEdgeMap(map, vertex, node) {
        if (map.has(vertex) && map.has(node)) {
            map.get(vertex).delete(node);
            map.get(node).delete(vertex);
        }
    }
}

exports.GraphGameManager = {GraphGameManager};
