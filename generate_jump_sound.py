import math
import wave
import struct

# Parameters matching the Web Audio API implementation
# Frequency: 600Hz -> 900Hz (Exponential ramp)
# Gain: 0.5 -> 0.01 (Exponential ramp)
# Duration: 0.15s

SAMPLE_RATE = 44100
DURATION = 0.15
START_FREQ = 600.0
END_FREQ = 900.0
START_GAIN = 0.5
END_GAIN = 0.01

def generate_jump_sound(filename):
    num_samples = int(SAMPLE_RATE * DURATION)
    
    # Open wave file
    with wave.open(filename, 'w') as wav_file:
        # Set parameters: 1 channel (mono), 2 bytes (16-bit), 44100 Hz
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        
        phase = 0.0
        
        for i in range(num_samples):
            t = i / SAMPLE_RATE
            progress = t / DURATION
            
            # Calculate instantaneous frequency (Exponential Ramp)
            # f(t) = f0 * (f1/f0)^t_norm
            # Note: For phase accumulation, we need to integrate frequency.
            # However, for short sounds, direct approximation or small steps works.
            # Let's use the exact frequency at this time step for the phase increment.
            
            current_freq = START_FREQ * (END_FREQ / START_FREQ) ** progress
            
            # Increment phase
            # phase += 2 * pi * freq * dt
            phase += 2 * math.pi * current_freq / SAMPLE_RATE
            
            # Calculate Amplitude (Exponential Ramp)
            current_gain = START_GAIN * (END_GAIN / START_GAIN) ** progress
            
            # Generate sample
            sample_val = current_gain * math.sin(phase)
            
            # Convert to 16-bit integer (-32767 to 32767)
            # Clipping protection
            sample_val = max(-1.0, min(1.0, sample_val))
            packed_val = struct.pack('<h', int(sample_val * 32767))
            
            wav_file.writeframes(packed_val)
            
    print(f"Generated {filename}")

if __name__ == "__main__":
    generate_jump_sound("jump.wav")
