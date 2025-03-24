// import { decibelToLinear } from '@ircam/sc-utils';
import {
  TriggerBuffer,
  TriggerBufferGranular,
  TriggerOsc,
  Filter,
} from './sonification.js';

// sonification
const sonificationStrategies = {
  'mute': () => {},
  'chromatic scale': (audioContext, global, buffers, filter, noverb, reverb, x, y) => {
    const gridLength = global.get('gridLength');
    const chromatic = new TriggerBuffer(audioContext, buffers.chromBuffer, gridLength, x, y, 100);
    const filterMode = global.get('filterMode');
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    if (filterMode === true) {
      filter.connect(reverb.input);
      filter.connect(noverb);
      chromatic.connect(filter.filter);
      chromatic.trigger(random);
    } else {
      chromatic.connect(reverb.input);
      chromatic.connect(noverb);
      chromatic.trigger(random);
    };
  },
  'filter-option': (audioContext, global, buffers, filter, noverb, reverb, x, y) => {
    const gridLength = global.get('gridLength');
    const chromaticSampler = new TriggerBuffer(audioContext, buffers.chromBuffer, gridLength, x, y, 0);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    const filterMode = global.get('filterMode');
    if (filterMode === true) {
      filter.connect(reverb.input);
      filter.connect(noverb);
      chromaticSampler.connect(filter.filter);
      chromaticSampler.trigger(random);
    } else {
      chromaticSampler.connect(reverb.input);
      chromaticSampler.connect(noverb);
      chromaticSampler.trigger(random);
    };
  },
  'whole-tone scale': (audioContext, global, buffers, filter, noverb, reverb, x, y) => {
    const gridLength = global.get('gridLength');
    const wholeTone = new TriggerBuffer(audioContext, buffers.mode1Buffer, gridLength, x, y, 200);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    const filterMode = global.get('filterMode');
    if (filterMode === true) {
      filter.connect(reverb.input);
      filter.connect(noverb);
      wholeTone.connect(filter.filter);
      wholeTone.trigger(random);
    } else {
      wholeTone.connect(reverb.input);
      wholeTone.connect(noverb);
      wholeTone.trigger(random);
    };
  },
  'octatonic scale': (audioContext, global, buffers, filter, noverb, reverb, x, y) => {
    const gridLength = global.get('gridLength');
    const octatonic = new TriggerBuffer(audioContext, buffers.mode2Buffer, gridLength, x, y, 500);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    const filterMode = global.get('filterMode');
    if (filterMode === true){
      filter.connect(reverb.input);
      filter.connect(noverb);
      octatonic.connect(filter.filter);
      octatonic.trigger(random);
    } else {
      octatonic.connect(reverb.input);
      octatonic.connect(noverb);
      octatonic.trigger(random);
    };
  },
  'modal scale' : (audioContext, global, buffers, filter, noverb, reverb, x, y) => {
    const gridLength = global.get('gridLength');
    const modal = new TriggerBuffer(audioContext, buffers.modalBuffer, gridLength, x, y, 0);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    const filterMode = global.get('filterMode');
    if (filterMode === true) {
      filter.connect(reverb.input);
      filter.connect(noverb);
      modal.connect(filter.filter);
      modal.trigger(random);
    } else {
      modal.connect(reverb.input);
      modal.connect(noverb);
      modal.trigger(random);
    };
  },
  'birds': (audioContext, global, buffers, filter, noverb, reverb, x, y) => {
    const period = global.get('delay');
    const gridLength = global.get('gridLength');
    const filterMode = global.get('filterMode');
    const granular = new TriggerBufferGranular(audioContext, buffers.birdsBuffer, gridLength, x, y, 100, period);
    if (filterMode === true) {
      filter.connect(reverb.input);
      filter.connect(noverb);
      granular.connect(filter.filter);
      granular.trigger();
    } else {
      granular.connect(reverb.input);
      granular.connect(noverb);
      granular.trigger();
    };
  },
  'oscillators': (audioContext, global, buffers, filter, noverb, reverb, x, y) => {
    const gridLength = global.get('gridLength');
    const osc = new TriggerOsc(audioContext, gridLength, x, y);
    const synchronicity = global.get('synchronicity');
    const random = 0;
    if (synchronicity === true) {
      random = 0;
    } else {
      random = Math.random();
    };
    const filterMode = global.get('filterMode');
    if (filterMode === true){
      filter.connect(reverb.input);
      filter.connect(noverb);
      osc.connect(filter.filter);
      osc.trigger(random);
    } else{
      osc.connect(reverb.input);
      osc.connect(noverb);
      osc.trigger(random);
    };
  },
};

export default sonificationStrategies;
export const sonificationStrategiesNames = Object.keys(sonificationStrategies);
