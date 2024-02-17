function detectLetter(x, y) {
    if (x % 2 === 1 && y % 2 === 1)
        return  'O';
    else if (x % 2 === 0 && y % 2 === 0)
        return  'I';
    else if (x % 2 === 0 && y % 2 === 1)
        return 'V';
    else
        return 'H';
}

function createTable(coordinate, isPlayerOne , move, placeWall) {
    const table = document.getElementById('jeu');

    for (let i = 0; i < 17; i++) {
        for (let j = 0; j < 17; j++) {
            const letter = detectLetter(i, j);
            const div = document.createElement('div');

            if (letter === 'I')
                div.addEventListener('click', () => move(div.id));
            else if (letter === 'H' || letter === 'V')
                div.addEventListener('click', () => placeWall(div.id));

            div.id = letter + ' ' + (1 + Math.floor(j / 2)) + ' ' + (9 - Math.floor(i / 2));
            table.appendChild(div);
        }
    }

    printPlayer(coordinate, isPlayerOne);
}

function printPlayer(coordinate, isPlayerOne) {
    let x = coordinate[1];
    let y = coordinate[0];
    let div = document.getElementById('I ' + y + ' ' + x);
    let newDivPlayer = document.createElement('div');
    newDivPlayer.className = isPlayerOne ? 'player1': 'player2';
    div.appendChild(newDivPlayer);
}

function printWall(wall, isPlayerOne) {
    let x = wall[0][1]
    let y = wall[0][0]
    let div1;
    let div2;
    let div3 = document.getElementById('O ' + y + ' ' + x);

    if (wall[1] === "1") {
        div1 = document.getElementById('V ' + y + ' ' + x);
        div2 = document.getElementById('V ' + String(Number.parseInt(y) + 1) + ' ' + x);
    }
    else {
        div1 = document.getElementById('H ' + y + ' ' + x);
        div2 = document.getElementById('H ' + String(Number.parseInt(y) + 1) + ' ' + x);
    }

    div1.className = isPlayerOne ? 'wallPlayer1': 'wallPlayer2';
    div2.className = isPlayerOne ? 'wallPlayer1': 'wallPlayer2';
    div3.className = isPlayerOne ? 'wallPlayer1': 'wallPlayer2';
}

function removePlayer(isPlayerOne) {
    let div = document.getElementsByClassName(isPlayerOne ? 'player1': 'player2')[0];

    if (div !== undefined)
        div.parentNode.removeChild(div);
}

export {createTable, printPlayer, removePlayer, printWall};