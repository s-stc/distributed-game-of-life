import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { html, render } from 'lit';

import pluginPlatformInit from '@soundworks/plugin-platform-init/client.js'; // for resuming audiocontext in browser
import pluginSync from '@soundworks/plugin-sync/client.js';
import pluginCheckin from '@soundworks/plugin-checkin/client.js';

import { AudioBufferLoader } from '@ircam/sc-loader';
import { Scheduler } from '@ircam/sc-scheduling';
import { generateCoordinates } from '../../lib/hostnameToCoordinates.js';
import sonificationStrategies from '../../lib/sonificationStrategies.js';
import { Reverb, Filter } from '../../lib/sonification.js';
import { decibelToLinear } from '@ircam/sc-utils';

import { phonemeWaveTable } from '../../../public/wave-tables/Phoneme_bah.js';
import { organWaveTable} from '../../../public/wave-tables/Organ_2.js';
import { celesteWaveTable} from '../../../public/wave-tables/celeste.js';

import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-number.js';


// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const audioContext = new AudioContext();

async function main($container) {
  const config = loadConfig();
  const client = new Client(config);

  client.pluginManager.register('platform-init', pluginPlatformInit, { audioContext });
  client.pluginManager.register('checkin', pluginCheckin);
  client.pluginManager.register('sync', pluginSync, {
    getTimefunction: () => audioContext.currentTime,
  });

  launcher.register(client, { initScreensContainer: $container });

  await client.start();

  // initialisation
  const checkin = await client.pluginManager.get('checkin')
  const sync = await client.pluginManager.get('sync');
  const global = await client.stateManager.attach('global');
  const gridLength = global.get('gridLength');
  const coordinates = generateCoordinates(gridLength);
  let x = null;
  let y = null;

  const scheduler = new Scheduler(() => sync.getSyncTime(), {
    currentTimeToProcessorTimeFunction: syncTime => sync.getLocalTime(syncTime),
  })

  const data = coordinates[checkin.getIndex()];
  x = data.x;
  y = data.y;

  console.log(x,y);

  // téléchargement des fichiers sons
  const loader = new AudioBufferLoader(audioContext); // permet que ça marche aussi pour les clients node
  const buffers = {
    chromBuffer: await loader.load(`audio/sample${y}${x}.wav`),
    mode1Buffer: await loader.load(`audio/mode1sample${x}.wav`),
    mode2Buffer: await loader.load(`audio/mode2sample${x}.wav`),
    birdsBuffer: await loader.load(`audio/birds.wav`),
    modalBuffer: await loader.load(`audio/modalsample${y}${x}.wav`),
    pianoBuffer: await loader.load(`audio/prepared_piano_${y}${x}.wav`),
  };
  const IR = {
    veryLargeAmbience: await loader.load(`audio/IR_VeryLargeAmbience.wav`)
  }

  const wavetables = {
    phonemeWaveTable,
    organWaveTable,
  }

  // paramètres sonores génériques
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


  const processor = (schedulerTime, audioTime) => { // pourquoi audioTime ?
    const sonification = global.get('sonificationMode');
    const grid = global.get('grid');
    const now = sync.getSyncTime();

    if (schedulerTime > now) {
      if (grid[y][x] === 1) {
        console.log('pouet');
        sonificationStrategies[sonification](audioContext, global, buffers, noFilter, filter, wavetables, x, y);
        $container.style.backgroundColor = 'purple';
        setTimeout(() => {
          $container.style.backgroundColor = 'black';
        }, 50)
      }
    }
    return schedulerTime + global.get('delay') / 1000; // why return = ask to be call back?


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
          masterVolume.gain.setTargetAtTime(newVolume, now, 0.01); // probleme ça clique
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

  function renderApp() {
    render(html`
      <div class="simple-layout">
        <p>Hello ${client.config.app.name}!</p>
        <div>
          <sc-text
            class="test-text"
          >x:</sc-text>
          <sc-number
            value=${x}
          ></sc-number>

          <sc-text
            class="test-text"
          >y:</sc-text>
          <sc-number
            value=${y}
          ></sc-number>
        </div>
        <sw-credits .infos="${client.config.app}"></sw-credits>
      </div>
    `, $container);
  }

  renderApp();
}

// The launcher enables instanciation of multiple clients in the same page to
// facilitate development and testing.
// e.g. `http://127.0.0.1:8000?emulate=10` to run 10 clients side-by-side
launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
});
