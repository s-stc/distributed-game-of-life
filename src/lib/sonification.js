export class TriggerBuffer {
  constructor(audioContext, buffer, gridLength, x, y, detuneValue){
    this.audioContext = audioContext;
    this.buffer = buffer;
    this.gridLength = gridLength;
    this.x = x;
    this.y = y;
    this.detuneValue = detuneValue;

    this.panner = audioContext.createStereoPanner();
    this.panner.pan.value = 2 * this.x / (this.gridLength - 1) - 1;

    this.connect = this.connect.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  connect(dest) {
    this.panner.connect(dest);
  }

  trigger(time) {
    const now = this.audioContext.currentTime;

    const env =  this.audioContext.createGain();
    env.connect(this.panner);
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(1, now + 0.05);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    const src = this.audioContext.createBufferSource();
    src.buffer = this.buffer;
    src.detune.value = this.y * this.detuneValue;
    src.connect(env);
    src.start(now + time);
    src.stop(now + time + 1.5);
  }
}

export class TriggerBufferGranular {
  constructor(audioContext, buffer, gridLength, x, y, detuneValue, period){
    this.audioContext = audioContext;
    this.buffer = buffer;
    this.gridLength = gridLength;
    this.x = x;
    this.y = y;
    this.detuneValue = detuneValue;
    this.duration = period * 2; // bouton pour choisir la durée des grains?

    // this.output = audioContext.createGain();
    // this.output.gain.value = this.volume;

    this.panner = audioContext.createStereoPanner();
    // this.panner.connect(this.output);
    this.panner.pan.value = 2 * this.x / (this.gridLength - 1) - 1;

    this.connect = this.connect.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  connect(dest) {
    this.panner.connect(dest);
  }

  trigger() {
    const now = this.audioContext.currentTime;

    const jitter = Math.random() * 0.002;
    const grainTime = now + jitter;
    const env =  this.audioContext.createGain();
    env.connect(this.panner);
    env.gain.setValueAtTime(0, grainTime);
    env.gain.linearRampToValueAtTime(1, grainTime + this.duration / 2);
    env.gain.linearRampToValueAtTime(0.0001, grainTime + this.duration);

    const src = this.audioContext.createBufferSource();
    src.buffer = this.buffer;
    src.detune.value = this.y * this.detuneValue;
    src.connect(env);
    src.start(grainTime, this.x + 1);
    src.stop(grainTime + 0.5);
  }
}

export class TriggerOsc {
  constructor(audioContext, gridLength, x, y){
    this.audioContext = audioContext;
    this.gridLength = gridLength;
    this.x = x;
    this.y = y;

    this.panner = this.audioContext.createStereoPanner();
    this.panner.pan.value = 2 * this.x / (this.gridLength - 1) - 1;

    this.connect = this.connect.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  connect(dest) {
    this.panner.connect(dest);
  }

  trigger(randomTime) {
    const now = this.audioContext.currentTime + randomTime;

    const env =  this.audioContext.createGain();
    env.connect(this.panner);
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.1, now + 0.02); // Attention l'oscillateur est très fort par défaut
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    const osc = this.audioContext.createOscillator();
    osc.frequency.value = 300 + (1200 * this.y) + (100 * this.x);
    osc.connect(env);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export class TriggerCustomOsc {
  constructor(audioContext, gridLength, x, y, wave){
    this.audioContext = audioContext;
    this.gridLength = gridLength;
    this.x = x;
    this.y = y;
    this.wave = wave;

    this.panner = this.audioContext.createStereoPanner();
    this.panner.pan.value = 2 * this.x / (this.gridLength - 1) - 1;

    this.connect = this.connect.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  connect(dest) {
    this.panner.connect(dest);
  }

  trigger(randomTime) {
    const now = this.audioContext.currentTime + randomTime;

    const env =  this.audioContext.createGain();
    env.connect(this.panner);
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.1, now + 0.02); // Attention l'oscillateur est très fort par défaut
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    const osc = this.audioContext.createOscillator();
    osc.setPeriodicWave(this.wave);
    osc.frequency.value = 300 + (1200 * this.y) + (100 * this.x);
    osc.connect(env);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

// effets

export class Filter {
  constructor(audioContext, gridLength, x, y){
    this.audioContext = audioContext;
    this.gridLength = gridLength;
    this.x = x;
    this.y = y;

    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = "lowpass"; // "highpass" "lowpass" "lowshelf" "highshelf" "peaking" "notch"
    this.filter.Q.value = 1.4 ; // utilisé avec lowpass, highpass, bandpass, peak, notch ; entre 0.2 et 18 on va dire
    // this.filter.gain.value = ; // utilisé avec lowshelf, highself
    this.filter.frequency.value = (50 * Math.pow(10, this.y / 2)) ;

    this.filterGain = this.audioContext.createGain();
    this.filter.connect(this.filterGain);

    this.connect = this.connect.bind(this);
  }

  connect(dest) {
    this.filterGain.connect(dest);
  }

}

export class Distorsion {
  constructor(audioContext, gridLength) { // x, y) {
    this.audioContext = audioContext;
    this.gridLength = gridLength;
    // this.x = x;
    // this.y = y;
    this.distorsion = this.audioContext.createWaveShaper();
    // this.distorsion.curve = ; // Float32Array pour spécifier comment le signal doit être distordu

    this.connect = this.connect.bind(this);

    function makeDistortionCurve(amount) {
      const k = typeof amount === "number" ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;

      for (let i = 0; i < n_samples; i++) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      return curve;
    };

    this.distorsion.curve = makeDistortionCurve(400);
  }

  connect(dest) {
    this.distorsion.connect(dest);
  }
}

export class Reverb {
  constructor(audioContext, impulseResponse, gridLength, x, y){
    this.audioContext = audioContext;
    this.gridLength = gridLength;
    this.x = x;
    this.y = y;
    this.input = this.audioContext.createGain();
    this.output = this.audioContext.createGain();
    this.dry = this.audioContext.createGain();
    this.wet = this.audioContext.createGain();
    this.convReverb = this.audioContext.createConvolver();
    this.IR = impulseResponse; // réponse impulsionnelle à partir de laquelle est calculée la réverb à convolution
    this.convReverb.buffer = this.IR;

    this.dryGain = (this.gridLength - 1 - this.y) / (this.gridLength - 1);
    this.wetGain = this.y / (this.gridLength - 1);
    this.dry.gain.value = this.dryGain;
    this.wet.gain.value = this.wetGain;

    this.input.connect(this.dry);
    this.input.connect(this.wet);
    this.wet.connect(this.convReverb);

    this.convReverb.connect(this.output);
    this.dry.connect(this.output);

    this.connect = this.connect.bind(this);
  }

  connect(dest) {
    this.output.connect(dest);
  }

}

export class Delay {
  constructor(audioContext){
    this.audioContext = audioContext;
    this.delay = this.audioContext.createDelay(); // préciser delayTime dans les parenthèses, par défaut, 1 seconde? ou 0 seconde?
  }
}
