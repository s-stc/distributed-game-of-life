import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import { loadConfig } from '@soundworks/helpers/node.js';

import pluginPlatformInit from '@soundworks/plugin-platform-init/server.js';
//import pluginPosition from '@soundworks/plugin-position/server.js';
// import pluginCheckin from '@soundworks/plugin-checkin/server.js';

import globalSchema from './schemas/global.js';
import cellSchema from './schemas/cell.js';

import { generateCoordinates } from '../lib/hostnameToCoordinates.js';
import { createBlankGrid, createRandomGrid, applyPattern} from '../lib/createGrid.js';
import { countNeighbors, countModuloNeighbors} from '../lib/numNeighbors.js';
import updateCell from '../lib/updateCell.js';
import * as patterns from '../lib/patterns.js';

import '../utils/catch-unhandled-errors.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = loadConfig(process.env.ENV, import.meta.url);

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${process.env.ENV || 'default'}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

/**
 * Create the soundworks server
 */
const server = new Server(config);
// configure the server for usage within this application template
server.useDefaultApplicationTemplate();

/**
 * Register plugins and schemas
 */
// server.pluginManager.register('my-plugin', plugin);
// server.stateManager.registerSchema('my-schema', definition);

//server.pluginManager.register('platform-init', pluginPlatformInit);
//server.pluginManager.register('position', pluginPosition);
//server.pluginManager.register('checkin', pluginCheckin);

server.stateManager.registerSchema('global', globalSchema);
server.stateManager.registerSchema('cell', cellSchema);

/**
 * Launch application (init plugins, http server, etc.)
 */
await server.start();

const global = await server.stateManager.create('global', {
  patternNames: Object.keys(patterns).concat(['random']),
});
console.log(global.getValues());

const cells = await server.stateManager.getCollection('cell');

// and do your own stuff!

// fonction pour donner un hostname aux clients émulés + renvoyer hostname & position aux clients

let gridLength = global.get('gridLength');

let grid = createBlankGrid(gridLength, gridLength);
await global.set({grid});
console.log(await global.get('grid'));

function resetGrid() { // réinitialiser la grille
  grid = createBlankGrid(gridLength, gridLength);
  global.set({grid});
}

// règles du jeu de la vie
function updateGrid() {  // mettre à jour l'état de la grille
  const modulo = global.get('modulo');
  const grid = global.get('grid');
  const newGrid = [];
  for (let y = 0; y < gridLength; y++) {
      newGrid[y] = [];
      for (let x = 0; x < gridLength; x++) {
          if (modulo == false) {
              const numNeighbors = countNeighbors(grid, y, x)
              newGrid[y][x] = updateCell(grid, y, x, numNeighbors);
          } else {
              const numNeighbors = countModuloNeighbors(grid, y, x)
              newGrid[y][x] = updateCell(grid, y, x, numNeighbors);
          }
      }
  }
  global.set({grid: newGrid});
}

// boucle du jeu
function gameLoop() {
  const isPlaying = global.get('isPlaying');
  const delay = global.get('delay');
  if (isPlaying === true) {
      updateGrid();
      // playSounds(sonificationMode); --> à mettre du côté des clients
      setTimeout(gameLoop, delay);
  }
}

global.onUpdate(updates => {
  for (let key in updates) {
    const value = updates[key];

    switch (key){
      case 'gridLength': {
        const gridLength = value;
        const grid = createBlankGrid(gridLength,gridLength);
        global.set({grid});
        break;
      }
      case 'resetGrid': {
        resetGrid();
        break;
      }
      case 'pattern': {
        if (value === 'random') {
          const grid = createRandomGrid(gridLength, gridLength);
          global.set({grid});
        } else {
          applyPattern(grid, patterns[value]);
          global.set({grid});
        }
        break;
      }
      case 'isPlaying': {
        if (value === true){
          gameLoop();
        }
        break;
      }
      default:
        break;
    }
  }
})

const cellsCoordinates = Object.fromEntries(generateCoordinates(gridLength)); // turn Map into Object

cells.onAttach(async (cell) => {
    let hostname = cell.get('hostname');
    if (hostname === 'emulated') {
        console.log('cells.length', cells.length); // la collection change de taille au fur et à mesure qu'un client se connecte
        const index = cells.length - 1 ; // cela permet d'avoir un indice qui croit à chaque nouveau client
        const cellsHostnames = Object.keys(cellsCoordinates); // est-ce que j'ai le droit d'utiliser cette méthode sur une map?
        if (index >=0 && index < cells.length){
            hostname = cellsHostnames[index];
        }
    }
    const cellPosition = cellsCoordinates[hostname];
    const { x, y } = cellPosition;
    await cell.set( {hostname, y,  x } ); // aller chercher hostname et position
}); // when a state is created --> give coordinates + neighbors?

cells.onDetach(() => dostuff()); // when a state is deleted --> give coordinates + neighbors
cells.onUpdate(() => dostuff()); // when a state is updated --> give neighbors
