import {
  TriggerBuffer,
  TriggerBufferGranular,
  TriggerOsc,
  TriggerCustomOsc
} from './sonification.js';
import { PeriodicWave } from 'isomorphic-web-audio-api';

// sonification
const sonificationStrategies = {
  'mute': () => {},
  'chromatic scale': (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const chromatic = new TriggerBuffer(audioContext, buffers.chromBuffer, gridLength, x, y, 100);
    const synchronicity = global.get('synchronicity');
    let random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    chromatic.connect(bypass);
    chromatic.trigger(random);
  },
  'chromatic 2': (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const chromaticSampler = new TriggerBuffer(audioContext, buffers.chromBuffer, gridLength, x, y, 0);
    const synchronicity = global.get('synchronicity');
    let random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    chromaticSampler.connect(bypass);
    chromaticSampler.trigger(random);
  },
  'random': (audioContext, global, buffers, bypass, wavetables, x, y) => { // ne fonctionne pas pour le moment
    const gridLength = global.get('gridLength');
    const arrayBuffers = Object.values(buffers);
    const rand = Math.floor(Math.random() * arrayBuffers.length);
    const randomSound = new TriggerBuffer(audioContext, arrayBuffers[rand], gridLength, x, y, 100);
    const synchronicity = global.get('synchronicity');
    let random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    randomSound.connect(bypass);
    randomSound.trigger(random);
  },
  'whole-tone scale': (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const wholeTone = new TriggerBuffer(audioContext, buffers.mode1Buffer, gridLength, x, y, 200);
    const synchronicity = global.get('synchronicity');
    let random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    wholeTone.connect(bypass);
    wholeTone.trigger(random);
  },
  'octatonic scale': (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const octatonic = new TriggerBuffer(audioContext, buffers.mode2Buffer, gridLength, x, y, 500);
    const synchronicity = global.get('synchronicity');
    let random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    octatonic.connect(bypass);
    octatonic.trigger(random);
  },
  'modal scale' : (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const modal = new TriggerBuffer(audioContext, buffers.modalBuffer, gridLength, x, y, 0);
    const synchronicity = global.get('synchronicity');
    let random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    modal.connect(bypass);
    modal.trigger(random);
  },
  'prepared piano': (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const chromatic = new TriggerBuffer(audioContext, buffers.pianoBuffer, gridLength, x, y, 100);
    const synchronicity = global.get('synchronicity');
    let random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    chromatic.connect(bypass);
    chromatic.trigger(random);
  },
  // 'birds': (audioContext, global, buffers, bypass, wavetables, x, y) => {
  //   const period = global.get('delay');
  //   const gridLength = global.get('gridLength');
  //   const granular = new TriggerBufferGranular(audioContext, buffers.birdsBuffer, gridLength, x, y, 100, period);
  //   granular.connect(bypass);
  //   granular.trigger();
  // },
  'birds': (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const synth = new TriggerBuffer(audioContext, buffers.birdsBuffer, gridLength, x, y, 0);
    const synchronicity = global.get('synchronicity');
    let random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    synth.connect(bypass);
    synth.trigger(random);
  },
  'oscillators': (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const osc = new TriggerOsc(audioContext, gridLength, x, y);
    const synchronicity = global.get('synchronicity');
    let random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    osc.connect(bypass);
    osc.trigger(random);
  },
  'phoneme': (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const synchronicity = global.get('synchronicity');
    let random = 0;
    const wavetable = wavetables.phonemeWaveTable;
    const wave = new PeriodicWave(audioContext, {real: wavetable.real, imag: wavetable.imag});
    const osc = new TriggerCustomOsc(audioContext, gridLength, x, y, wave);
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    osc.connect(bypass);
    osc.trigger(random);
  },
  'organ': (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const synchronicity = global.get('synchronicity');
    let random = 0;
    const wavetable = wavetables.organWaveTable;
    const wave = new PeriodicWave(audioContext, {real: wavetable.real, imag: wavetable.imag});
    const osc = new TriggerCustomOsc(audioContext, gridLength, x, y, wave);
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    osc.connect(bypass);
    osc.trigger(random);
  },
  'celeste': (audioContext, global, buffers, bypass, wavetables, x, y) => {
    const gridLength = global.get('gridLength');
    const synchronicity = global.get('synchronicity');
    let random = 0;
    const wavetable = wavetables.celesteWaveTable;
    const wave = new PeriodicWave(audioContext, {real: wavetable.real, imag: wavetable.imag});
    const osc = new TriggerCustomOsc(audioContext, gridLength, x, y, wave);
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    osc.connect(bypass);
    osc.trigger(random);
  }
};

export default sonificationStrategies;
export const sonificationStrategiesNames = Object.keys(sonificationStrategies);
