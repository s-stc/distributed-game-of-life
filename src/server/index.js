import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import { loadConfig, configureHttpRouter } from '@soundworks/helpers/server.js';

import pluginPlatformInit from '@soundworks/plugin-platform-init/server.js';
import pluginSync from '@soundworks/plugin-sync/server.js';
import pluginCheckin from '@soundworks/plugin-checkin/server.js';
// import ServerPluginFilesystem from '@soundworks/plugin-filesystem/server.js';
import ServerPluginMixing from '@soundworks/plugin-mixing/server.js';

import globalSchema from './schemas/global.js';

import { createBlankGrid, createRandomGrid, applyPattern} from '../lib/createGrid.js';
import { countNeighbors, countModuloNeighbors} from '../lib/numNeighbors.js';
import updateCell from '../lib/updateCell.js';
import * as patterns from '../lib/patterns.js';
import { sonificationStrategiesNames } from '../lib/sonificationStrategies.js';

// import '../utils/catch-unhandled-errors.js';

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
configureHttpRouter(server);

/**
 * Register plugins and schemas
 */
// server.pluginManager.register('my-plugin', plugin);
// server.stateManager.registerSchema('my-schema', definition);

const GRID_LENGTH = 6;

server.pluginManager.register('platform-init', pluginPlatformInit);
server.pluginManager.register('sync', pluginSync);
server.pluginManager.register('mixing', ServerPluginMixing);
// server.pluginManager.register('filesystem', ServerPluginFilesystem, {
//   dirname: 'recorded_audio',
//   // publicPath: '/public/'
// });

server.pluginManager.register('checkin', pluginCheckin, {
    capacity: GRID_LENGTH * GRID_LENGTH,
});

console.log(sonificationStrategiesNames);
globalSchema.sonificationMode.list = sonificationStrategiesNames;

server.stateManager.defineClass('global', globalSchema);

/**
 * Launch application (init plugins, http server, etc.)
 */
await server.start();

const global = await server.stateManager.create('global', {
  patternNames: Object.keys(patterns).concat(['random']),
  gridLength: GRID_LENGTH,
});
console.log(global.getValues());

// and do your own stuff!

let gridLength = global.get('gridLength');

let grid = createBlankGrid(gridLength, gridLength); // crée une grille vide
global.set({grid});
console.log(await global.get('grid'));

function resetGrid(gridLength) { // fonction pour réinitialiser la grille
  grid = createBlankGrid(gridLength, gridLength);
  global.set({grid});
}

function updateGrid() {  // fonction pour mettre à jour l'état de la grille
  const modulo = global.get('modulo');
  const grid = global.get('grid');
  const gridLength = global.get('gridLength');
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
  if (isPlaying === 'play') {
      updateGrid();
      setTimeout(gameLoop, delay);
  }
}

const sync = await server.pluginManager.get('sync');
// faire en sorte que lorsqu'on clique sur "Start" ou "Delay", on génère un "startTime" dans l'état global
server.stateManager.registerUpdateHook('global', updates => {
  if ('isPlaying' in updates || 'delay' in updates || 'random' in updates) {
    const startTime = sync.getSyncTime();

    return {
      startTime,
      ...updates,
    };
  }
});

// réagir aux changements provoqués par le controller
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
        const gridLength = global.get('gridLength');
        resetGrid(gridLength);
        break;
      }
      case 'pattern': {
        if (value === 'random') {
          const gridLength = global.get('gridLength');
          const grid = createRandomGrid(gridLength, gridLength);
          global.set({grid});
        } else {
          // const grid = global.get('grid');
          const gridLength = global.get('gridLength');
          const grid = createBlankGrid(gridLength, gridLength);
          applyPattern(grid, patterns[value]);
          global.set({grid});
        }
        break;
      }
      case 'isPlaying': {
        if (value === 'play'){
          gameLoop();
        }
        break;
      }
      default:
        break;
    }
  }
})

// donner des coordonnées aux clients NODE cells qui se connectent
// const cellsCoordinates = Object.fromEntries(generateHostnamesToCoordinates(gridLength)); // turn Map into Object

// cells.onAttach(async (cell) => {
//     let hostname = cell.get('hostname');
//     if (hostname === 'emulated') {
//         console.log('cells.length', cells.length); // la collection change de taille au fur et à mesure qu'un client se connecte
//         const index = cells.length - 1 ; // cela permet d'avoir un indice qui croit à chaque nouveau client
//         const cellsHostnames = Object.keys(cellsCoordinates); // est-ce que j'ai le droit d'utiliser cette méthode sur une map?
//         if (index >=0 && index < cells.length){
//             hostname = cellsHostnames[index];
//         }
//     }
//     const cellPosition = cellsCoordinates[hostname];
//     const { x, y } = cellPosition;
//     await cell.set( {hostname, y,  x } ); // aller chercher hostname et position
// }); // when a state is created --> give coordinates + neighbors?

// cells.onDetach(() => dostuff()); // when a state is deleted --> give coordinates + neighbors
// cells.onUpdate(() => dostuff()); // when a state is updated --> give neighbors
