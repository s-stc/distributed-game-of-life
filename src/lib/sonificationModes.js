export function triggerSoundFile(audioContext, grid, buffer, x, y) {
    const panner = audioContext.createStereoPanner();
    panner.pan.value = (2 * x / (grid.length - 1)) - 1;
    panner.connect(audioContext.destination);

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
    src.detune.value = y * 1200 / (grid.length - 1); // en parcourant toute la grille de haut en bas on fait une octave
    //src.detune.value = y * 100; // en parcourant une case de haut en bas on fait un demi-ton
    src.start();
}

export function triggerSoundFile2(audioContext, grid, buffer, x, y) {
    const panner = audioContext.createStereoPanner();
    panner.pan.value = (2 * x / (grid.length - 1)) - 1;
    panner.connect(audioContext.destination);
    
    const src = audioContext.createBufferSource();
    src.buffer = buffer;
    src.connect(panner);
    //src.detune.value = (y * 600) + (1200 * x / (grid[0].length - 1));
    src.detune.value = y*100 + x*100; // un demi-ton par case
    src.start();
}

export function triggerSoundFileMode1(audioContext, grid, buffer, x, y) {
    const panner = audioContext.createStereoPanner();
    panner.pan.value = (2 * x / (grid.length - 1)) - 1;
    panner.connect(audioContext.destination);

    const now = audioContext.currentTime;
    const env = audioContext.createGain();
    env.gain.value = 0;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(1, now + 0.1);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1);
    env.connect(panner);
    
    const src = audioContext.createBufferSource();
    src.buffer = buffer;
    src.connect(env);
    src.detune.value = y * 200;
    src.start();
}

export function triggerSoundFileMode2(audioContext, grid, buffer, x, y) {
    const panner = audioContext.createStereoPanner();
    panner.pan.value = (2 * x / (grid.length - 1)) - 1;
    panner.connect(audioContext.destination);
    
    const now = audioContext.currentTime;
    const env = audioContext.createGain();
    env.gain.value = 0;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(1, now + 0.1);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1);
    env.connect(panner);

    const src = audioContext.createBufferSource();
    src.buffer = buffer;
    src.connect(env);
    src.detune.value = y * 500;
    src.start();
}

export function triggerSoundFileGranular(audioContext, grid, buffer, x, y) {
    const panner = audioContext.createStereoPanner();
    panner.pan.value = (2 * x / (grid.length - 1)) - 1;
    panner.connect(audioContext.destination);
    
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