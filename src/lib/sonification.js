export class TriggerBuffer {
  constructor(audioContext, buffer, volume, gridLength, x, y, detuneValue){
    this.audioContext = audioContext;
    this.buffer = buffer;
    this.volume = volume;
    this.gridLength = gridLength;
    this.x = x;
    this.y = y;
    this.detuneValue = detuneValue;

    this.output = audioContext.createGain();
    this.output.gain.value = this.volume;

    this.panner = audioContext.createStereoPanner();
    this.panner.connect(this.output);
    this.panner.pan.value = 2 * this.x / (this.gridLength - 1) - 1;

    this.connect = this.connect.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  connect(dest) {
    this.output.connect(dest);
  }

  trigger() {
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
    src.start(now);
    src.stop(now + 1.5);
  }
}

export class TriggerBufferGranular {
  constructor(audioContext, buffer, volume, gridLength, x, y, detuneValue, period){
    this.audioContext = audioContext;
    this.buffer = buffer;
    this.volume = volume;
    this.gridLength = gridLength;
    this.x = x;
    this.y = y;
    this.detuneValue = detuneValue;
    this.duration = period * 2; // bouton pour choisir la durée des grains?

    this.output = audioContext.createGain();
    this.output.gain.value = this.volume;

    this.panner = audioContext.createStereoPanner();
    this.panner.connect(this.output);
    this.panner.pan.value = 2 * this.x / (this.gridLength - 1) - 1;

    this.connect = this.connect.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  connect(dest) {
    this.output.connect(dest);
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
    src.start(grainTime, this.x);
    src.stop(grainTime + 0.5);
  }
}

export class TriggerOsc {
  constructor(audioContext, volume, gridLength, x, y){
    this.audioContext = audioContext;
    this.volume = volume;
    this.gridLength = gridLength;
    this.x = x;
    this.y = y;

    this.output = audioContext.createGain();
    this.output.gain.value = this.volume;

    this.panner = audioContext.createStereoPanner();
    this.panner.connect(this.output);
    this.panner.pan.value = 2 * this.x / (this.gridLength - 1) - 1;

    this.connect = this.connect.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  connect(dest) {
    this.output.connect(dest);
  }

  trigger() {
    const now = this.audioContext.currentTime;

    const env =  this.audioContext.createGain();
    env.connect(this.panner);
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.1, now + 0.02); // Attention l'oscillateur est très fort par défaut
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    const osc = this.audioContext.createOscillator();
    // osc.frequency.value = 200;
    osc.frequency.value = 100 + (1200 * this.y) + (100 * this.x);
    osc.connect(env);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}
