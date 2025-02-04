import '@soundworks/helpers/polyfills.js';
import os from 'node:os';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';
import { AudioContext } from 'node-web-audio-api';

import pluginSync from '@soundworks/plugin-sync/client.js';
import pluginCheckin from '@soundworks/plugin-checkin/client.js';

import { AudioBufferLoader } from '@ircam/sc-loader';
import { Scheduler } from '@ircam/sc-scheduling';
import { decibelToLinear } from '@ircam/sc-utils';
import { triggerSoundFile, triggerSoundFile2, triggerSoundFileMode1, triggerSoundFileMode2, triggerSoundFileGranular, triggerSoundFileModal } from '../../lib/sonificationModes.js';
import { generateCoordinates, generateHostnamesToCoordinates } from '../../lib/hostnameToCoordinates.js';


// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

async function bootstrap() {
  /**
   * Load configuration from config files and create the soundworks client
   */
  const config = loadConfig(process.env.ENV, import.meta.url);
  const client = new Client(config);

  const audioContext = new AudioContext();

  /**
   * Register some soundworks plugins, you will need to install the plugins
   * before hand (run `npx soundworks` for help)
   */
  // client.pluginManager.register('my-plugin', plugin);

  client.pluginManager.register('checkin', pluginCheckin);
  client.pluginManager.register('sync', pluginSync, {
    getTimefunction: () => audioContext.currentTime,
  });

  /**
   * Register the soundworks client into the launcher
   *
   * Automatically restarts the process when the socket closes or when an
   * uncaught error occurs in the program.
   */
  launcher.register(client);

  /**
   * Launch application
   */
  await client.start();

  console.log(`Hello ${client.config.app.name}!`);



  // initialisation
  const global = await client.stateManager.attach('global');
  const checkin = await client.pluginManager.get('checkin');
  const hostname = (typeof process.env.EMULATE !== 'undefined' ? 'emulated' : os.hostname());
  const gridLength = global.get('gridLength');
  const realCoords = generateHostnamesToCoordinates(gridLength);
  const emulatedCoords = generateCoordinates(gridLength);
  const sync = await client.pluginManager.get('sync');
  const scheduler = new Scheduler(() => sync.getSyncTime(), {
    currentTimeToProcessorTimeFunction: syncTime => sync.getLocalTime(syncTime),
  });

  let x = null;
  let y = null;

  if (realCoords[hostname] !== undefined) {
    const data = realCoords[hostname]; // position attribuée en fonction du hostname et donc de la vraie disposition spatiale
    x = data.x;
    y = data.y;
  } else {
    const data = emulatedCoords[checkin.getIndex()]; // position aléatoire en fonction de l'index checkin
    x = data.x;
    y = data.y;
  }

  console.log('x:', x, 'y:', y);

  // loading audio files
  const loader = new AudioBufferLoader(audioContext);

  const chromBuffers = [];
  const mode1Buffers = [];
  const mode2Buffers = [];
  const birdsBuffer = await loader.load(`public/audio/birds.wav`);
  const modalBuffer = await loader.load(`public/audio/modalsample${y}${x}.wav`);

  for (let i = 1; i <= 10; i++) {
    const buffer = await loader.load(`public/audio/sample${i}.wav`);
    chromBuffers.push(buffer);
  }

  for (let j = 0; j <= 10; j++) {
    const buffer = await loader.load(`public/audio/mode1sample${j}.wav`);
    mode1Buffers.push(buffer);
  }

  for (let j = 0; j <= 10; j++) {
    const buffer = await loader.load(`public/audio/mode2sample${j}.wav`);
    mode2Buffers.push(buffer);
  }

  // sonification
  const sonificationStrategies = {
    'mute': () => {},
    'chromatic scale': (x, y) => {
      const buffer = chromBuffers[x];
      const volume = decibelToLinear(global.get('volume'));
      console.log("volume", volume);
      triggerSoundFile(audioContext, gridLength, buffer, volume, x, y);
    },
    'option2': (x, y) => {
      const buffer = chromBuffers[x];
      const volume = decibelToLinear(global.get('volume'));
      console.log("volume", volume);
      triggerSoundFile2(audioContext, gridLength, buffer, volume, x, y);
    },
    'whole-tone scale': (x, y) => {
      const buffer = mode1Buffers[x];
      const volume = decibelToLinear(global.get('volume'));
      console.log("volume", volume);
      triggerSoundFileMode1(audioContext, gridLength, buffer, volume, x, y);
    },
    'octatonic scale': (x, y) => {
      const buffer = mode2Buffers[x];
      const volume = decibelToLinear(global.get('volume'));
      console.log("volume", volume);
      triggerSoundFileMode2(audioContext, gridLength, buffer, volume, x, y);
    },
    'modal scale': (x, y) => {
      const buffer = modalBuffer;
      const volume = decibelToLinear(global.get('volume'));
      console.log("volume", volume);
      triggerSoundFileModal(audioContext, gridLength, buffer, volume, x, y);
    },
    'birds': (x, y) => {
      const buffer = birdsBuffer;
      const volume = decibelToLinear(global.get('volume'));
      console.log("volume", volume);
      triggerSoundFileGranular(audioContext, gridLength, buffer, volume, x, y);
    },
  }

  const processor = (schedulerTime, audioTime) => {
    const sonification = global.get('sonificationMode');
    const grid = global.getUnsafe('grid');
    const now = sync.getSyncTime();

    if (schedulerTime > now) {
      if (grid[y][x] === 1) {
        sonificationStrategies[sonification](x, y);
        // $container.style.backgroundColor = 'purple'; // ajouter le code pour faire jouer des LEDs du R-Pi
        // setTimeout(() => {
        //   $container.style.backgroundColor = 'black';
        // }, 50)
      }
    }

    return schedulerTime + global.get('delay') / 1000;
  };


  global.onUpdate(updates => {
    for (let key in updates) {
      const value = updates[key];

      switch (key) {
        case 'isPlaying': {
          if (value === 'play') {
            const startTime = global.get('startTime');
            scheduler.add(processor, startTime);
          } else if (scheduler.has(processor)) {
            scheduler.remove(processor);
          }
          break;
        }
        default:
          break;
      }
    }
  }, true);
}
// The launcher allows to fork multiple clients in the same terminal window
// by defining the `EMULATE` env process variable
// e.g. `EMULATE=10 npm run watch thing` to run 10 clients side-by-side
launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url,
});
