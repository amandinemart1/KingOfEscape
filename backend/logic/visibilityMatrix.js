class VisibilityMatrix {
    constructor(coordonnee1, coordonnee2) {
        this.visibilityMatrix = [];
        this.buildVisibilityMatrice();

        if (coordonnee1 && coordonnee2) {
            let x1 = Number.parseInt(coordonnee1[1]);
            let y1 = Number.parseInt(coordonnee1[0]);
            let x2 = Number.parseInt(coordonnee2[1]);
            let y2 = Number.parseInt(coordonnee2[0]);

            let valueCoordinateX = [1, 0, -1, 0, 0];
            let valueCoordinateY = [0, 1, 0, -1, 0];

            for (let i = 0; i < 5; i++) {
                this.updateMatrixValue(x1 + valueCoordinateX[i],y1 + valueCoordinateY[i], 1);
                this.updateMatrixValue(x2 + valueCoordinateX[i] ,y2 + valueCoordinateY[i],  -1);
            }
        }
    }

    buildVisibilityMatrice() {
        this.fillMatrix(0, 4, -1);
        this.fillMatrix(4, 5, 0);
        this.fillMatrix(5, 9, 1);
    }

    fillMatrix(indexYStart, indexYEnd, value) {
        for (let i = indexYStart; i < indexYEnd; i++) {
            let line = [];

            for (let j = 0; j < 9; j++) {
                line.push(value);
            }

            this.visibilityMatrix.push(line);
        }
    }

    updateMatrixWall(coordinate, isPlayerOne) {
        const x = Number.parseInt(coordinate[1]);
        const y = Number.parseInt(coordinate[0]);
        let multiply = isPlayerOne ? 1 : -1;

        this.visibilityMatrix[9 - x][y - 1] += multiply * 2;
        this.visibilityMatrix[10 - x][y] += multiply * 2;
        this.visibilityMatrix[9 - x][y] += multiply * 2;
        this.visibilityMatrix[10 - x][y - 1] += multiply * 2;

        this.updateMatrixValue(x + 1, y, multiply);
        this.updateMatrixValue(x + 1, y + 1, multiply);
        this.updateMatrixValue(x, y + 2, multiply);
        this.updateMatrixValue(x - 1, y + 2, multiply);
        this.updateMatrixValue(x - 2, y + 1, multiply);
        this.updateMatrixValue(x - 2, y, multiply);
        this.updateMatrixValue(x - 1, y - 1, multiply);
        this.updateMatrixValue(x, y - 1, multiply);
    }

    updateMoveCharacter(oldCoordinate, newCoordinate, isPlayerOne) {
        let multiply = isPlayerOne ? 1 : -1;
        let valueCoordinateX = [1, 0, -1, 0, 0];
        let valueCoordinateY = [0, 1, 0, -1, 0];
        let oldCoordinateX = Number.parseInt(oldCoordinate[1]);
        let oldCoordinateY = Number.parseInt(oldCoordinate[0]);
        let newCoordinateX = Number.parseInt(newCoordinate[1]);
        let newCoordinateY = Number.parseInt(newCoordinate[0]);

        for (let i = 0; i < 5; i++) {
            this.updateMatrixValue(oldCoordinateX + valueCoordinateX[i], oldCoordinateY + valueCoordinateY[i], -multiply);
        }

        for (let i = 0; i < 5; i++) {
            this.updateMatrixValue(newCoordinateX + valueCoordinateX[i], newCoordinateY + valueCoordinateY[i] , multiply);
        }
    }

    canSeeSquare(coordinate, isPlayerOne) {
        let coordinateX = Number.parseInt(coordinate[1]);
        let coordinateY = Number.parseInt(coordinate[0]);

        return isPlayerOne? this.visibilityMatrix[9 - coordinateX][coordinateY - 1] >= 0 :
            this.visibilityMatrix[9 - coordinateX][coordinateY - 1] <= 0;
    }

    updateMatrixValue(x, y, multiply) {
        if (x >= 1 && x < 10 && y >= 1 && y < 10)
            this.visibilityMatrix[9 - x][y - 1] += multiply * 1;
    }
}

exports.visibilityMatrix = {VisibilityMatrix};