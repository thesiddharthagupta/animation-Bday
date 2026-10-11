import wave
import math
import struct

sample_rate = 44100

# Notes frequencies
G4 = 392.00
A4 = 440.00
B4 = 493.88
C5 = 523.25
D5 = 587.33
E5 = 659.25
F5 = 698.46
G5 = 783.99

# Melody: (freq, duration in seconds, rest after)
melody = [
    # Verse 1
    (G4, 0.35, 0.05), (G4, 0.35, 0.05), (A4, 0.7, 0.05), (G4, 0.7, 0.05), (C5, 0.7, 0.05), (B4, 1.2, 0.1),
    # Verse 2
    (G4, 0.35, 0.05), (G4, 0.35, 0.05), (A4, 0.7, 0.05), (G4, 0.7, 0.05), (D5, 0.7, 0.05), (C5, 1.2, 0.1),
    # Verse 3
    (G4, 0.35, 0.05), (G4, 0.35, 0.05), (G5, 0.7, 0.05), (E5, 0.7, 0.05), (C5, 0.7, 0.05), (B4, 0.7, 0.05), (A4, 1.1, 0.1),
    # Verse 4
    (F5, 0.35, 0.05), (F5, 0.35, 0.05), (E5, 0.7, 0.05), (C5, 0.7, 0.05), (D5, 0.7, 0.05), (C5, 1.5, 0.4)
]

# Repeat twice with soft tempo
melody_loop = melody + melody

samples = []

def generate_chime_note(freq, duration):
    note_samples = []
    total_frames = int(sample_rate * duration)
    for i in range(total_frames):
        t = i / sample_rate
        # Envelope: fast attack, exponential decay (music box style)
        envelope = math.exp(-3.5 * t / max(duration, 0.1))
        # Bell harmonics: fundamental + soft 2nd & 3rd harmonic
        val = 0.65 * math.sin(2 * math.pi * freq * t)
        val += 0.25 * math.sin(2 * math.pi * freq * 2 * t)
        val += 0.10 * math.sin(2 * math.pi * freq * 3 * t)
        
        sample = val * envelope * 0.45
        note_samples.append(sample)
    return note_samples

def generate_silence(duration):
    return [0.0] * int(sample_rate * duration)

for freq, dur, rest in melody_loop:
    samples.extend(generate_chime_note(freq, dur))
    samples.extend(generate_silence(rest))

# Add 1 second gentle fadeout
samples.extend(generate_silence(1.0))

# Write to WAV
output_path = "assets/birthday_music.wav"
with wave.open(output_path, "w") as wav_file:
    wav_file.setnchannels(1)      # Mono
    wav_file.setsampwidth(2)     # 16-bit
    wav_file.setframerate(sample_rate)
    
    for s in samples:
        # Clamp to -1.0 to 1.0
        clamped = max(-1.0, min(1.0, s))
        packed = struct.pack("<h", int(clamped * 32767))
        wav_file.writeframesraw(packed)

print(f"Generated {output_path} successfully! Duration: {len(samples)/sample_rate:.1f}s")
