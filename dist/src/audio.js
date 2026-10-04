// Synthesised gunfire. Off by default; the AudioContext is created on first user action.
let enabled = false;
let audio = null;

let volume = 1; // per zoom level (camera.json)
export const soundEnabled = () => enabled;
export const setVolume = (v) => (volume = v);

export function setSound(on) {
  enabled = on;
  if (on) {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
  }
}

export function resumeAudio() {
  audio?.resume();
}

export function fireSound(x) {
  if (!enabled) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    const len = audio.sampleRate * 0.08;
    const buffer = audio.createBuffer(1, len, audio.sampleRate);
    const v = buffer.getChannelData(0);
    for (let i = 0; i < v.length; i++) v[i] = (Math.random() * 2 - 1) * Math.exp(-i / (v.length * 0.12));
    const src = audio.createBufferSource();
    const gain = audio.createGain();
    const pan = audio.createStereoPanner();
    src.buffer = buffer;
    gain.gain.value = 0.13 * volume;
    pan.pan.value = Math.max(-1, Math.min(1, (x - 600) / 600));
    src.connect(gain).connect(pan).connect(audio.destination);
    src.start(audio.currentTime);
  } catch {
    enabled = false;
  }
}

// A dull explosion: low noise burst with a slower decay than a shot.
export function explosionSound(x) {
  if (!enabled) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    const len = audio.sampleRate * 0.6;
    const buffer = audio.createBuffer(1, len, audio.sampleRate);
    const v = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < v.length; i++) {
      last = last * 0.92 + (Math.random() * 2 - 1) * 0.08; // low-pass: a thud, not a crack
      v[i] = last * 6 * Math.exp(-i / (v.length * 0.25));
    }
    const src = audio.createBufferSource();
    const gain = audio.createGain();
    const pan = audio.createStereoPanner();
    src.buffer = buffer;
    gain.gain.value = 0.5 * volume;
    pan.pan.value = Math.max(-1, Math.min(1, (x - 600) / 600));
    src.connect(gain).connect(pan).connect(audio.destination);
    src.start(audio.currentTime);
  } catch {
    enabled = false;
  }
}
