const fs = require('fs');

// Generate a simple WAV file containing a 1000Hz sine wave for 0.1 seconds
const sampleRate = 44100;
const duration = 0.1;
const numSamples = Math.floor(sampleRate * duration);
const buffer = Buffer.alloc(44 + numSamples * 2); // 16-bit mono

// WAV Header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + numSamples * 2, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // Subchunk1Size
buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
buffer.writeUInt16LE(1, 22); // NumChannels (Mono)
buffer.writeUInt32LE(sampleRate, 24); // SampleRate
buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
buffer.writeUInt16LE(2, 32); // BlockAlign
buffer.writeUInt16LE(16, 34); // BitsPerSample
buffer.write('data', 36);
buffer.writeUInt32LE(numSamples * 2, 40);

// Audio Data (Sine wave at 1000 Hz)
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const value = Math.sin(2 * Math.PI * 1000 * t);
  const intValue = Math.floor(value * 32767);
  buffer.writeInt16LE(intValue, 44 + i * 2);
}

const base64 = buffer.toString('base64');
const dataUri = `data:audio/wav;base64,${base64}`;

fs.writeFileSync('src/presentation/utils/loadingSound.ts', `export const loadingSoundDataUri = "${dataUri}";\n`);
console.log('Done generating sound');
