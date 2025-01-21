export default function updateCell(grid, y, x, numNeighbors) {
    if(grid[y][x] === 1 && (numNeighbors > 3 || numNeighbors < 2)) {return 0}
    else if (grid[y][x] == 0 && numNeighbors === 3) {return 1}
    else return grid[y][x] ;
  }
