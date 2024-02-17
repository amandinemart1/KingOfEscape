class GameState {
    constructor(position) {
        this.position = position;
        this.ownWall = [];
        this.turn = 0;
    }

    addWall(wall) {
        this.ownWall.push(wall);
    }

    changePosition(position) {
        this.position = position;
    }

    getRestantWall() {
        return 10 - this.ownWall.length;
    }

    update() {
        this.turn++;
    }
}

exports.GameState = GameState;