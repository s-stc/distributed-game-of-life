import '@soundworks/helpers/polyfills.js';
import os from 'node:os';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';
import { AudioContext } from 'node-web-audio-api';

import pluginSync from '@soundworks/plugin-sync/client.js';
import pluginCheckin from '@soundworks/plugin-checkin/client.js';

import { generateCoordinates, generateHostnamesToCoordinates } from '../../lib/hostnameToCoordinates.js';
import { AudioBufferLoader } from '@ircam/sc-loader';
import { Scheduler } from '@ircam/sc-scheduling';
import sonificationStrategies from '../../lib/sonificationStrategies.js';
import { Reverb, Filter } from '../../lib/sonification.js';
import { decibelToLinear } from '@ircam/sc-utils';

import { phonemeWaveTable } from '../../../public/wave-tables/Phoneme_bah.js';
import { organWaveTable} from '../../../public/wave-tables/Organ_2.js';


// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

async function bootstrap() {

  const config = loadConfig(process.env.ENV, import.meta.url);
  const client = new Client(config);

  const audioContext = new AudioContext();


  // plugin registration
  client.pluginManager.register('checkin', pluginCheckin);
  client.pluginManager.register('sync', pluginSync, {
    getTimefunction: () => audioContext.currentTime,
  });


  launcher.register(client);

  await client.start();

  console.log(`Hello ${client.config.app.name}!`);

  // initialisation
  const checkin = await client.pluginManager.get('checkin');
  const sync = await client.pluginManager.get('sync');
  const global = await client.stateManager.attach('global');
  const gridLength = global.get('gridLength');
  const hostname = (typeof process.env.EMULATE !== 'undefined' ? 'emulated' : os.hostname());
  const realCoords = generateHostnamesToCoordinates(gridLength);
  const emulatedCoords = generateCoordinates(gridLength);
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
  const buffers = {
    chromBuffer: await loader.load(`public/audio/sample${y}${x}.wav`),
    mode1Buffer: await loader.load(`public/audio/mode1sample${x}.wav`),
    mode2Buffer: await loader.load(`public/audio/mode2sample${x}.wav`),
    birdsBuffer: await loader.load(`public/audio/birds.wav`),
    modalBuffer: await loader.load(`public/audio/modalsample${y}${x}.wav`),
    pianoBuffer: await loader.load(`public/audio/prepared_piano_${y}${x}.wav`),
  };
  const IR = {
    veryLargeAmbience: await loader.load(`public/audio/IR_VeryLargeAmbience.wav`)
  }

  const wavetables = {
    phonemeWaveTable,
    organWaveTable,
  }

  // global audio parameters
  const masterVolume = audioContext.createGain();
  const volume = decibelToLinear(global.get('volume'));
  masterVolume.gain.value = volume;
  masterVolume.connect(audioContext.destination);

  const reverbVolume = global.get('reverb');
  const reverb = new Reverb(audioContext, IR.veryLargeAmbience, gridLength, x, y);
  reverb.output.gain.value = reverbVolume;
  reverb.connect(masterVolume);

  const noverb = audioContext.createGain();
  const noverbVolume = 1 - reverbVolume;
  noverb.gain.value = noverbVolume;
  noverb.connect(masterVolume);

  const filter = new Filter(audioContext, gridLength, x, y);
  const noFilter = audioContext.createGain();
  noFilter.gain.value = 1 - global.get('filterMode');
  noFilter.connect(noverb);
  noFilter.connect(reverb.input);
  filter.connect(noverb);
  filter.connect(reverb.input);

  //audio engine
  const processor = (schedulerTime, audioTime) => {
    const sonification = global.get('sonificationMode');
    const grid = global.getUnsafe('grid'); // pourquoi getUnsafe?
    const now = sync.getSyncTime();

    if (schedulerTime > now) {
      if (grid[y][x] === 1) {
        console.log('pouet');
        sonificationStrategies[sonification](audioContext, global, buffers, noFilter, filter, wavetables, x, y);
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
        case 'volume': {
          const newVolume = decibelToLinear(value);
          const now = audioContext.currentTime;
          masterVolume.gain.setTargetAtTime(newVolume, now, 0.01);
          break;
        }
        case 'reverb': {
          const now = audioContext.currentTime;
          reverb.output.gain.setTargetAtTime(value, now, 0.01);
          noverb.gain.setTargetAtTime(1 - value, now, 0.01);
          break;
        }
        case 'filterMode': {
          const now = audioContext.currentTime;
          filter.filterGain.gain.setTargetAtTime(value, now, 0.01);
          noFilter.gain.setTargetAtTime(1 - value, now, 0.01);
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
