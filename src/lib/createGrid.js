export function createBlankGrid(numRows, numColumns) {  // créer la grille dynamiquement
    const grid = [];
    for (let i = 0; i < numRows; i++) {
        const row = [];
        for (let j = 0; j < numColumns ; j++) {
            row.push(0);
        }
        grid.push(row);
    }

    return grid;
}

export function createRandomGrid(numRows, numColumns) { // pour créer une grille random
    const grid = [];
    for (let i = 0; i < numRows; i++) {
        const row = [];
        for (let j = 0; j < numColumns ; j++) {
            row.push(Math.round(Math.random()));
        }
        grid.push(row);
    }
    return grid;
}

export function applyPattern(grid, array) {
    const colOffset = Math.floor((grid.length - array.length) / 2);
    const rowOffset = Math.floor((grid[0].length - array[0].length) / 2);
    for (let i = 0; i < grid.length; i++) {
        const row = grid[i];
        for (let j = 0; j < row.length; j++) {
            if (array[i] !== undefined && array[i][j] !== undefined) {
                grid[i + colOffset][j + rowOffset] = array[i][j];
            }
        }
    }
}