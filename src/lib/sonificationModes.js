export function triggerSoundFile(audioContext, gridLength, buffer, volume, x, y) {
  const output = audioContext.createGain();
  output.connect(audioContext.destination);
  output.gain.value = volume;

  const panner = audioContext.createStereoPanner();
  panner.pan.value = (2 * x / (gridLength - 1)) - 1;
  panner.connect(output);

  const now = audioContext.currentTime;
  const env = audioContext.createGain();
  env.gain.value = 0;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(1, now + 0.05);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 1);
  env.connect(panner);

  const src = audioContext.createBufferSource();
  src.buffer = buffer;
  src.connect(env);
  src.detune.value = y * 1200 / (gridLength - 1); // en parcourant toute la grille de haut en bas on fait une octave
  //src.detune.value = y * 100; // en parcourant une case de haut en bas on fait un demi-ton
  src.start();
}

export function triggerSoundFile2(audioContext, gridLength, buffer, volume, x, y) {
  const output = audioContext.createGain();
  output.connect(audioContext.destination);
  output.gain.value = volume;

  const panner = audioContext.createStereoPanner();
  panner.pan.value = (2 * x / (gridLength - 1)) - 1;
  panner.connect(output);

  const src = audioContext.createBufferSource();
  src.buffer = buffer;
  src.connect(panner);
  //src.detune.value = (y * 600) + (1200 * x / (gridLength - 1));
  src.detune.value = y*100 + x*100; // un demi-ton par case
  src.start();
}

export function triggerSoundFileMode1(audioContext, gridLength, buffer, volume, x, y) {
  const output = audioContext.createGain();
  output.connect(audioContext.destination);
  output.gain.value = volume;

  const boost = audioContext.createGain()
  boost.gain.value = 4;
  boost.connect(output);

  const panner = audioContext.createStereoPanner();
  panner.pan.value = (2 * x / (gridLength - 1)) - 1;
  panner.connect(boost);

  const now = audioContext.currentTime;
  const env = audioContext.createGain();
  env.gain.value = 0;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(1, now + 0.05);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 3);
  env.connect(output);

  const src = audioContext.createBufferSource();
  src.buffer = buffer;
  src.connect(env);
  src.detune.value = y * 200;
  src.start();
}

export function triggerSoundFileMode2(audioContext, gridLength, buffer, volume, x, y) {
  const output = audioContext.createGain();
  output.connect(audioContext.destination);
  output.gain.value = volume;

  const boost = audioContext.createGain()
  boost.gain.value = 4;
  boost.connect(output);

  const panner = audioContext.createStereoPanner();
  panner.pan.value = (2 * x / (gridLength - 1)) - 1;
  panner.connect(boost);

  const now = audioContext.currentTime;
  const env = audioContext.createGain();
  env.gain.value = 0;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(1, now + 0.05);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 3);
  env.connect(panner);

  const src = audioContext.createBufferSource();
  src.buffer = buffer;
  src.connect(env);
  src.detune.value = y * 500;
  src.start();
}

export function triggerSoundFileGranular(audioContext, gridLength, buffer, volume, x, y) {
  console.log('triggerSoundFileGranular')
  const output = audioContext.createGain();
  output.connect(audioContext.destination);
  output.gain.value = volume;

  const panner = audioContext.createStereoPanner();
  panner.pan.value = (2 * x / (gridLength - 1)) - 1;
  panner.connect(output);

  const jitter = Math.random() * 0.002;
  const grainTime = audioContext.currentTime + jitter;
  const env = audioContext.createGain();
  env.gain.value = 0;
  env.gain.setValueAtTime(0, grainTime);
  env.gain.linearRampToValueAtTime(0.7, grainTime + 0.1);
  env.gain.exponentialRampToValueAtTime(0.0001, grainTime + 1);
  env.connect(panner);

  const src = audioContext.createBufferSource();
  src.buffer = buffer;
  src.connect(env);
  src.detune.value = y * 100;
  src.start(grainTime, x, 1.1);
}

export function triggerOsc(audioContext, volume, x, y) {
  const output = audioContext.createGain();
  output.connect(audioContext.destination);
  output.gain.value = volume;

  const panner = audioContext.createStereoPanner();
  panner.pan.value = (2 * x / (gridLength - 1)) - 1;
  panner.connect(output);

  const now = audioContext.currentTime;
  const env = audioContext.createGain();
  env.gain.value = 0;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(0.8, now + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
  env.connect(panner);

  const osc = audioContext.createOscillator();
  const freq = 100 + (1200 * y) + (100 * x);
  osc.frequency.value = freq;
  osc.connect(env);
  osc.start(now);
  osc.stop(now + 1.5);
}
