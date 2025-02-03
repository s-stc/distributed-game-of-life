import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { html, render } from 'lit';
// import { AudioContext } from 'node-web-audio-api';

import { AudioBufferLoader } from '@ircam/sc-loader';
import { Scheduler } from '@ircam/sc-scheduling';
import { decibelToLinear } from '@ircam/sc-utils';
import { triggerSoundFile, triggerSoundFile2, triggerSoundFileMode1, triggerSoundFileMode2, triggerSoundFileGranular } from '../../lib/sonificationModes.js';

import pluginPlatformInit from '@soundworks/plugin-platform-init/client.js';
import pluginSync from '@soundworks/plugin-sync/client.js';
import pluginCheckin from '@soundworks/plugin-checkin/client.js';

import '../components/sw-credits.js';
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-number.js';


// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

/**
 * If multiple clients are emulated you might to want to share some resources
 */
// const audioContext = new AudioContext();

const audioContext = new AudioContext();

async function main($container) {
  /**
   * Load configuration from config files and create the soundworks client
   */
  const config = loadConfig();
  const client = new Client(config);

  /**
   * Register some soundworks plugins, you will need to install the plugins
   * before hand (run `npx soundworks` for help)
   */
  // client.pluginManager.register('my-plugin', plugin);
  client.pluginManager.register('platform-init', pluginPlatformInit, { audioContext });
  client.pluginManager.register('checkin', pluginCheckin);
  client.pluginManager.register('sync', pluginSync, {
    getTimefunction: () => audioContext.currentTime,
  });

  /**
   * Register the soundworks client into the launcher
   *
   * The launcher will do a bunch of stuff for you:
   * - Display default initialization screens. If you want to change the provided
   * initialization screens, you can import all the helpers directly in your
   * application by doing `npx soundworks --eject-helpers`. You can also
   * customise some global syles variables (background-color, text color etc.)
   * in `src/clients/components/css/app.scss`.
   * You can also change the default language of the intialization screen by
   * setting, the `launcher.language` property, e.g.:
   * `launcher.language = 'fr'`
   * - By default the launcher automatically reloads the client when the socket
   * closes or when the page is hidden. Such behavior can be quite important in
   * performance situation where you don't want some phone getting stuck making
   * noise without having any way left to stop it... Also be aware that a page
   * in a background tab will have all its timers (setTimeout, etc.) put in very
   * low priority, messing any scheduled events.
   */
  launcher.register(client, { initScreensContainer: $container });

  /**
   * Launch application
   */
  await client.start();

  // téléchargement des fichiers sons
  const loader = new AudioBufferLoader(audioContext); // permet que ça marche aussi pour les clients node
  // sinon import loadAudioBuffer from '../../lib/load-audio-buffer.js';

  const chromBuffers = [];
  const mode1Buffers = [];
  const mode2Buffers = [];

  for (let i = 1; i <= 10; i++) { // chargement de tous les samples grace à une boucle
    const buffer = await loader.load(`audio/sample${i}.wav`);
    chromBuffers.push(buffer);
  }

  for (let j = 0; j <= 10; j++) { // chargement de tous les samples grace à une boucle
    const buffer = await loader.load(`audio/mode1sample${j}.wav`);
    mode1Buffers.push(buffer);
  }

  for (let j = 0; j <= 10; j++) { // chargement de tous les samples grace à une boucle
    const buffer = await loader.load(`audio/mode2sample${j}.wav`);
    mode2Buffers.push(buffer);
  }

  const birdsBuffer = await loader.load(`audio/birds.wav`);

  // initialisation
  const checkin = await client.pluginManager.get('checkin')
  const sync = await client.pluginManager.get('sync');

  const scheduler = new Scheduler(() => sync.getSyncTime(), {
    currentTimeToProcessorTimeFunction: syncTime => sync.getLocalTime(syncTime),
  })
  // const hostname = (typeof process.env.EMULATE !== 'undefined' ? 'emulated' : os.hostname()); // pour l'environnement node
  // const hostname = 'emulated';

  const global = await client.stateManager.attach('global');
  // const cell = await client.stateManager.create('cell', {
  //   hostname
  // });

  // const x = await cell.get('x'); // version où le serveur attribue x et y en fonction du hostname
  // const y = await cell.get('y'); //
  const gridLength = global.get('gridLength');
  const {x, y} = await checkin.getData(); // version avec le plugin Checkin
  console.log(x,y);

  let isPlaying = global.get('isPlaying');
  const sonificationMode = global.get('sonificationMode');


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
    'birds': (x, y) => {
        const buffer = birdsBuffer;
        const volume = decibelToLinear(global.get('volume'));
        console.log("volume", volume);
        triggerSoundFileGranular(audioContext, gridLength, buffer, volume, x, y);
    },
  }

  const processor = (schedulerTime, audioTime) => {
    const sonification = global.get('sonificationMode');
    const grid = global.get('grid');
    const now = sync.getSyncTime();

    if (schedulerTime > now) {
      if (grid[y][x] === 1) {
        sonificationStrategies[sonification](x, y);
        $container.style.backgroundColor = 'purple';
        setTimeout(() => {
          $container.style.backgroundColor = 'black';
        }, 50)
      }
    }

    console.log('pouet');
    return schedulerTime + global.get('delay') / 1000;
  };

  global.onUpdate(updates => {
    for (let key in updates) {
      const value = updates[key];

      switch (key) {
        case 'isPlaying': {
          if (value === true) {
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

  function renderApp() {
    render(html`
      <div class="simple-layout">
        <p>Hello ${client.config.app.name}!</p>
        <div>
          <sc-text>x:</sc-text>
          <sc-number
          value=${x}
          ></sc-number>
          <sc-text>y:</sc-text>
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
