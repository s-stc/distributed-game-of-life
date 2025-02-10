import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { html, render } from 'lit';

import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-number.js';
import '@ircam/sc-components/sc-matrix.js';
import '@ircam/sc-components/sc-button.js';
import '@ircam/sc-components/sc-select.js';
import '@ircam/sc-components/sc-radio.js';
import '@ircam/sc-components/sc-slider.js';
import '@ircam/sc-components/sc-transport.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

async function main($container) {
  /**
   * Load configuration from config files and create the soundworks client
   */
  const config = loadConfig();
  const client = new Client(config);

  launcher.register(client, {
    initScreensContainer: $container,
    reloadOnVisibilityChange: false,
  });

  await client.start();

  const global = await client.stateManager.attach('global');
//   const cells = await client.stateManager.getCollection('cell');


  function renderApp() {
    render(html`
      <div class="controller-layout">
        <header>
          <h1>${client.config.app.name} | ${client.role}</h1>
          <sw-audit .client="${client}"></sw-audit>
        </header>
        <section>
          <sc-matrix
            class="test-matrix"
            .value=${global.get('grid')}
            @change=${e => {
              global.set({
                grid : e.detail.value,
              });
              // console.log(e.detail.value);
            }}
          ></sc-matrix>

          <div>
              <sc-transport
                value=${global.get('isPlaying')}
                .buttons=${["play", "stop"]}
                @change=${async function (e) {
                  await global.set({isPlaying : e.detail.value});
                  console.log(global.get('isPlaying'));
                }}
              ></sc-transport>

              <sc-button
                class="test-button"
                @input=${async () => {
                  await global.set({resetGrid : true });
                  // console.log(global.get('grid'))
                }}
              >Clear</sc-button>
          </div>

          <div>
                <sc-text
                  class='test-text'
                >Pattern</sc-text>

                <sc-select
                  .options=${global.get('patternNames')}
                  class='test-select'
                  placeholder="select a pattern"
                  @change=${ async function (e) {
                    if (e.detail.value) {
                      await global.set({ pattern: e.detail.value });
                    }
                    renderApp();
                  }}
                ></sc-select>

                <sc-text
                  class='test-text'
                >Sonification Mode</sc-text>

                <sc-select
                  .options=${global.getDescription('sonificationMode').list}
                  class='test-select'
                  value=${global.get('sonificationMode')}
                  @change=${async function (e) {
                      await global.set({sonificationMode : e.detail.value});
                      console.log(global.get('sonificationMode'));
                      renderApp();
                  }}
                ></sc-select>
          </div>

          <div>
            <sc-text
              class="test-text"
            >Grid length</sc-text>
            <sc-number
              integer
              min="5"
              max="100"
              value=${global.get('gridLength')}
              @input=${async function (e) {
                  await global.set({gridLength : e.detail.value});
                  console.log('grid size:', global.get('gridLength'));
                  renderApp();
              }}
            ></sc-number>
        </div>

        <div>
            <sc-text
              class="test-text"
            >Delay (ms)</sc-text>
            <sc-number
              integer
              min="20"
              max="2000"
              .value=${global.get('delay')}
              @input=${async (e) => {
                  await global.set({delay : e.detail.value});
                  console.log('Delay in ms:', global.get('delay'));
              }}
            ></sc-number>
        </div>

        <div>
            <sc-text
              class="test-text"
            >Circular grid</sc-text>
            <sc-radio
              options="${JSON.stringify(['yes', 'no'])}"
              class='test-radio'
              value="yes"
              @change=${async function (e) {
                  const circulargrid = e.detail.value;
                  switch (circulargrid) {
                      case 'yes':
                          await global.set({modulo : true});
                          console.log('circular grid:', global.get('modulo'));
                          break;
                      case 'no':
                          await global.set({modulo : false});
                          console.log('circular grid:', global.get('modulo'));
                          break;
                      default:
                          break;
                  }
                  renderApp();
              }}
            ></sc-radio>
        </div>
        <div>
          <sc-text
            class="test-text"
          >Volume (dB)</sc-text>
          <sc-slider
            min="-60"
            max="6"
            .value=${global.get('volume')}
            step="0.1"
            number-box=true
            @input=${async function (e) {
              await global.set({volume: e.detail.value});
              console.log("volume en dB:", global.get('volume'));
            }}
          ></sc-slider>
        </div>

        </section>
      </div>
    `, $container);
  }

  global.onUpdate(() => renderApp(), true);
}

launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
  width: '50%',
});
