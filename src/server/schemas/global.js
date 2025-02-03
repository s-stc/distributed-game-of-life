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

    startTime: {
      type: 'float',
      default: 0,
    },

    modulo: {
        type: 'boolean',
        default: false,
    },

    isPlaying: {
        type: 'boolean',
        default: false,
    },

    // isPlaying: {
    //   type: 'any',
    //   default: 'stop',
    // },

    sonificationMode:{
        type:'enum',
        list: ['mute', 'chromatic scale', 'whole-tone scale', 'octatonic scale', 'birds'],
        default: 'mute',
    },

    volume: { // volume in dB [-60, 6]
        type: 'float',
        min: -60,
        max: 6,
        default: 0,
    },

}
