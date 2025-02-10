import { decibelToLinear } from '@ircam/sc-utils';
import {
  TriggerBuffer,
  TriggerBufferGranular,
  TriggerOsc,
} from './sonification.js';

// sonification
const sonificationStrategies = {
  'mute': () => {},
  'chromatic scale': (audioContext, global, buffers, x, y) => {
    const volume = decibelToLinear(global.get('volume'));
    const gridLength = global.get('gridLength');
    const chromatic = new TriggerBuffer(audioContext, buffers.chromBuffer, volume, gridLength, x, y, 100);
    chromatic.connect(audioContext.destination);
    chromatic.trigger();
  },
  'option2': (audioContext, global, buffers, x, y) => {
    const volume = decibelToLinear(global.get('volume'));
    const gridLength = global.get('gridLength');
    const option2 = new TriggerBuffer(audioContext, buffers.chromBuffer, volume, gridLength, x, y, 0);
    option2.connect(audioContext.destination);
    option2.trigger();
  },
  'whole-tone scale': (audioContext, global, buffers, x, y) => {
    const volume = decibelToLinear(global.get('volume'));
    const gridLength = global.get('gridLength');
    const wholeTone = new TriggerBuffer(audioContext, buffers.mode1Buffer, volume, gridLength, x, y, 200);
    wholeTone.connect(audioContext.destination);
    wholeTone.trigger();
  },
  'octatonic scale': (audioContext, global, buffers, x, y) => {
    const volume = decibelToLinear(global.get('volume'));
    const gridLength = global.get('gridLength');
    const octatonic = new TriggerBuffer(audioContext, buffers.mode2Buffer, volume, gridLength, x, y, 500);
    octatonic.connect(audioContext.destination);
    octatonic.trigger();
  },
  'modal scale' : (audioContext, global, buffers, x, y) => {
    const volume = decibelToLinear(global.get('volume'));
    const gridLength = global.get('gridLength');
    const modal = new TriggerBuffer(audioContext, buffers.modalBuffer, volume, gridLength, x, y, 0);
    modal.connect(audioContext.destination);
    modal.trigger();
  },
  'birds': (audioContext, global, buffers, x, y) => {
    const volume = decibelToLinear(global.get('volume'));
    const period = global.get('delay');
    const gridLength = global.get('gridLength');
    const granular = new TriggerBufferGranular(audioContext, buffers.birdsBuffer, volume, gridLength, x, y, 100, period);
    granular.connect(audioContext.destination);
    granular.trigger();
  },
  'oscillators': (audioContext, global, buffers, x, y) => {
    const volume = decibelToLinear(global.get('volume'));
    const gridLength = global.get('gridLength');
    const osc = new TriggerOsc(audioContext, volume, gridLength, x, y);
    osc.connect(audioContext.destination);
    osc.trigger();
  },
};

export default sonificationStrategies;
export const sonificationStrategiesNames = Object.keys(sonificationStrategies);
