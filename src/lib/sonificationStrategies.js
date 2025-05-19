// import { decibelToLinear } from '@ircam/sc-utils';
import {
  TriggerBuffer,
  TriggerBufferGranular,
  TriggerOsc,
  TriggerCustomOsc
} from './sonification.js';

// sonification
const sonificationStrategies = {
  'mute': () => {},
  'chromatic scale': (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const chromatic = new TriggerBuffer(audioContext, buffers.chromBuffer, gridLength, x, y, 100);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    chromatic.connect(filter.filter);
    chromatic.connect(noFilter);
    chromatic.trigger(random);
  },
  'chromatic 2': (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const chromaticSampler = new TriggerBuffer(audioContext, buffers.chromBuffer, gridLength, x, y, 0);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    chromaticSampler.connect(filter.filter);
    chromaticSampler.connect(noFilter);
    chromaticSampler.trigger(random);
  },
  'random': (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => { // ne fonctionne pas pour le moment
    const gridLength = global.get('gridLength');
    const arrayBuffers = Object.values(buffers);
    const rand = Math.floor(Math.random() * arrayBuffers.length);
    const randomSound = new TriggerBuffer(audioContext, arrayBuffers[rand], gridLength, x, y, 100);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    randomSound.connect(filter.filter);
    randomSound.connect(noFilter);
    randomSound.trigger(random);
  },
  'whole-tone scale': (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const wholeTone = new TriggerBuffer(audioContext, buffers.mode1Buffer, gridLength, x, y, 200);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    wholeTone.connect(filter.filter);
    wholeTone.connect(noFilter);
    wholeTone.trigger(random);
  },
  'octatonic scale': (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const octatonic = new TriggerBuffer(audioContext, buffers.mode2Buffer, gridLength, x, y, 500);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    octatonic.connect(filter.filter);
    octatonic.connect(noFilter);
    octatonic.trigger(random);
  },
  'modal scale' : (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const modal = new TriggerBuffer(audioContext, buffers.modalBuffer, gridLength, x, y, 0);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    modal.connect(filter.filter);
    modal.connect(noFilter);
    modal.trigger(random);
  },
  'prepared piano': (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const chromatic = new TriggerBuffer(audioContext, buffers.pianoBuffer, gridLength, x, y, 100);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    chromatic.connect(filter.filter);
    chromatic.connect(noFilter);
    chromatic.trigger(random);
  },
  'birds': (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => {
    const period = global.get('delay');
    const gridLength = global.get('gridLength');
    const granular = new TriggerBufferGranular(audioContext, buffers.birdsBuffer, gridLength, x, y, 100, period);
    granular.connect(filter.filter);
    granular.connect(noFilter);
    granular.trigger();
  },
  'oscillators': (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const osc = new TriggerOsc(audioContext, gridLength, x, y);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    osc.connect(filter.filter);
    osc.connect(noFilter);
    osc.trigger(random);
  },
  'phoneme': (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const synchronicity = global.get('synchronicity');
    const random = 0;
    const wavetable = wavetables.phonemeWaveTable;
    const wave = new PeriodicWave(audioContext, {real: wavetable.real, imag: wavetable.imag});
    const osc = new TriggerCustomOsc(audioContext, gridLength, x, y, wave);
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    osc.connect(filter.filter);
    osc.connect(noFilter);
    osc.trigger(random);
  },
  'organ': (audioContext, global, buffers, noFilter, filter, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const synchronicity = global.get('synchronicity');
    const random = 0;
    const wavetable = wavetables.organWaveTable;
    const wave = new PeriodicWave(audioContext, {real: wavetable.real, imag: wavetable.imag});
    const osc = new TriggerCustomOsc(audioContext, gridLength, x, y, wave);
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    osc.connect(filter.filter);
    osc.connect(noFilter);
    osc.trigger(random);
  }
};

export default sonificationStrategies;
export const sonificationStrategiesNames = Object.keys(sonificationStrategies);
