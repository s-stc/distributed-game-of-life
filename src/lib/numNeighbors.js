export function countNeighbors(grid, row, col) { // option où la grille est finie 
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const r = row + i;
            const c = col + j;
            if (r >= 0 && r < grid.length && c >= 0 &&
                c < grid[0].length && !(i === 0 && j === 0)) {
                count += grid[r][c];
            }
        }
    }
    return count;
};

export function countModuloNeighbors(grid, row, col) {        // option où la grille est circulaire
    let count = 0;
    if (grid[(row - 1 + grid.length) % grid.length][col] === 1) {count++}; 
    if (grid[(row + 1 ) % grid.length][col]===1) {count++};
    if (grid[row][(col - 1 + grid.length) % grid.length] === 1) {count++};
    if (grid[row][(col + 1) % grid.length]===1) {count++};
    if (grid[(row + 1) % grid.length][(col + 1) % grid.length] === 1) {count++};
    if (grid[(row - 1 + grid.length) % grid.length][(col - 1 + grid.length) % grid.length] === 1) {count++};
    if (grid[(row - 1 + grid.length) % grid.length][(col + 1) % grid.length] === 1) {count++};
    if (grid[(row + 1) % grid.length][(col - 1 +grid.length) % grid.length] === 1) {count++};
  
    return count;
};