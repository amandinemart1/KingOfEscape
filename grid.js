const canvas = document.getElementById('quoridorCanvas');
const ctx = canvas.getContext('2d');
 const size = 50; // Taille de chaque cellule
const boardSize = 9; // 9x9

for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
        ctx.strokeRect(col * size, row * size, size, size);
    }
}
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const row = Math.floor(y / size);
    const col = Math.floor(x / size);

    // Ici, vous pouvez gérer l'action basée sur la cellule cliquée
    console.log("Clic sur la cellule : ", row, col);
});
