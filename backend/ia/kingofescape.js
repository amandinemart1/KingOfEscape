// Private attributes

let aiPlay;

// Classes

// Private functions

// Public functions

function setup(AIplay) {
    aiPlay = AIplay;
    return '11';
}

function nextMove(gameState) {
    return {action: "move", value: '11'};
}

function correction(rightMove) {
    return true;
}

function updateBoard(gameState) {
    return true;
}

// exports

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;