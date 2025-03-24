export default {
    grid: {
      type: 'any',
      default: [],
    },

    gridLength: {
      type: 'integer',
      min: 5,
      max: 100,
      default: 6,
    },

    resetGrid: {
      type: 'boolean',
      event: true,
    },

    pattern:{
      type: 'any',
      event: true,
    },

    patternNames: {
      type: 'any',
      default: [],
    },

    delay: { // delay in ms
      type: 'integer',
      min: 20,
      max: 2000,
      default: 200,
    },

    synchronicity: {
      type: 'boolean',
      default: true,
    },

    startTime: {
      type: 'float',
      default: 0,
    },

    modulo: {
      type: 'boolean',
      default: true,
    },

    isPlaying: {
      type: 'string',
      default: null,
      nullable: true,
    },

    sonificationMode:{
      type:'enum',
      // list: ['mute', 'chromatic scale', 'whole-tone scale', 'octatonic scale', 'birds', 'modal scale'],
      default: 'mute',
    },

    volume: { // volume in dB [-60, 6]
      type: 'float',
      min: -60,
      max: 12,
      default: 0,
    },

    filterMode:{
      type: 'boolean',
      default: false,
    },

    reverb:{
      type:'float',
      min: 0,
      max: 1,
      default: 0,
    },

    // IR:{
    //   type: 'any',
    // }

}
