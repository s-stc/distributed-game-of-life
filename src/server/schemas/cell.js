export default {
    hostname : {
        type: 'any',
        default: 'emulated',
    },

    y: {
        type:'integer',
        default: null,
        min: 0,
        nullable : true
    },

    x: {
        type:'integer',
        default: null,
        min : 0,
        nullable : true
    },

    state: {
        type: 'integer',
        min: 0,
        max: 1,
        default: 0,
    },

    neighbors: {
        type: 'integer',
        default : 0,
        min: 0,
        max: 8,
    }
}