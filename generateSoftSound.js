const fs = require('fs');

// Generate a soft, pleasant double-tone UI sound (e.g. C5 and E5)
const sampleRate = 44100;
const durationSeconds = 0.3; // Very short UI sound
const numSamples = Math.floor(sampleRate * durationSeconds);
const maxAmplitude = 32767;

const pcmData = Buffer.alloc(numSamples * 2); // 16-bit mono

const freq1 = 523.25; // C5
const freq2 = 659.25; // E5

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  
  // Envelope: quick attack, exponential decay
  let envelope = 0;
  if (t < 0.02) {
    envelope = t / 0.02; // Attack
  } else {
    envelope = Math.max(0, Math.exp(-15 * (t - 0.02))); // Decay
  }
  
  // Mix two pure sine waves for a pleasant chord-like chime
  const wave1 = Math.sin(2 * Math.PI * freq1 * t);
  const wave2 = Math.sin(2 * Math.PI * freq2 * t);
  const sample = (wave1 + wave2) * 0.5 * envelope * 0.4; // 0.4 volume to keep it soft
  
  const intSample = Math.max(-maxAmplitude, Math.min(maxAmplitude, Math.floor(sample * maxAmplitude)));
  pcmData.writeInt16LE(intSample, i * 2);
}

const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + pcmData.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // Mono
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * 2, 28); // Byte rate
header.writeUInt16LE(2, 32); // Block align
header.writeUInt16LE(16, 34); // Bits per sample
header.write('data', 36);
header.writeUInt32LE(pcmData.length, 40);

const wavBuffer = Buffer.concat([header, pcmData]);
const base64Wav = wavBuffer.toString('base64');

const tsContent = `export const loadingSoundDataUri = "data:audio/wav;base64,${base64Wav}";\n`;
fs.writeFileSync('./src/presentation/utils/loadingSound.ts', tsContent);
console.log('Soft loading sound generated.');
