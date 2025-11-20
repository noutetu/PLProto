class AudioContextManager {
    constructor() {
        this.ctx = null;
        this.bgmSource = null;
        this.buffers = {};
        this.isMuted = false;
        this.bgmStartTime = 0;

        // Drum Loop State
        this.isPlayingLoop = false;
        this.bpm = 120;
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // s
        this.nextNoteTime = 0;
        this.currentBeat = 0;
        this.timerID = null;
        this.noiseBuffer = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Create Noise Buffer for Snare/Hihat
        if (!this.noiseBuffer) {
            const bufferSize = this.ctx.sampleRate * 2.0;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            this.noiseBuffer = buffer;
        }
    }

    async loadBuffer(key, url) {
        if (!this.ctx) this.init();
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.buffers[key] = audioBuffer;
        } catch (error) {
            console.error(`Failed to load audio: ${url}`, error);
        }
    }

    playBGM(key, loop = true) {
        if (!this.ctx) this.init();
        if (this.bgmSource) {
            this.bgmSource.stop();
        }

        const buffer = this.buffers[key];
        if (!buffer) {
            console.warn(`BGM buffer '${key}' not found.`);
            return;
        }

        this.bgmSource = this.ctx.createBufferSource();
        this.bgmSource.buffer = buffer;
        this.bgmSource.loop = loop;
        this.bgmSource.connect(this.ctx.destination);
        this.bgmSource.start(0);
        this.bgmStartTime = this.ctx.currentTime;
    }

    stopBGM() {
        if (this.bgmSource) {
            try {
                this.bgmSource.stop();
            } catch (e) {
                // Ignore if already stopped
            }
            this.bgmSource = null;
        }
    }

    // --- Drum Loop System ---

    startDrumLoop(bpm) {
        if (!this.ctx) this.init();
        if (this.isPlayingLoop) return this.nextNoteTime;

        this.bpm = bpm;
        this.isPlayingLoop = true;
        this.currentBeat = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.1;

        this.timerID = setInterval(() => this.scheduler(), this.lookahead);
        return this.nextNoteTime;
    }

    stopDrumLoop() {
        this.isPlayingLoop = false;
        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = null;
        }
    }

    scheduler() {
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentBeat, this.nextNoteTime);
            this.nextNote();
        }
    }

    nextNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secondsPerBeat;
        this.currentBeat = (this.currentBeat + 1) % 4;
    }

    scheduleNote(beatNumber, time) {
        // Pattern: Kick on 0, 2. Snare on 1, 3. Hihat every beat.
        this.playDrumSound('hihat', time);

        if (beatNumber === 0 || beatNumber === 2) {
            this.playDrumSound('kick', time);
        } else {
            this.playDrumSound('snare', time);
        }
    }

    playDrumSound(type, time) {
        const gain = this.ctx.createGain();
        gain.connect(this.ctx.destination);

        if (type === 'kick') {
            const osc = this.ctx.createOscillator();
            osc.connect(gain);
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
            gain.gain.setValueAtTime(0.8, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
            osc.start(time);
            osc.stop(time + 0.5);
        } else if (type === 'snare') {
            const source = this.ctx.createBufferSource();
            source.buffer = this.noiseBuffer;
            // Filter for snare
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 1000;

            source.connect(filter);
            filter.connect(gain);

            gain.gain.setValueAtTime(0.4, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            source.start(time);
            source.stop(time + 0.2);
        } else if (type === 'hihat') {
            const source = this.ctx.createBufferSource();
            source.buffer = this.noiseBuffer;
            // Filter for hihat
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 5000;

            source.connect(filter);
            filter.connect(gain);

            gain.gain.setValueAtTime(0.15, time); // Quieter
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
            source.start(time);
            source.stop(time + 0.05);
        }
    }

    // --- End Drum Loop System ---

    playSFX(key) {
        if (!this.ctx) this.init();

        // If buffer exists, play it
        if (this.buffers[key]) {
            const source = this.ctx.createBufferSource();
            source.buffer = this.buffers[key];
            source.connect(this.ctx.destination);
            source.start(0);
            return;
        }

        // Fallback: Synthesized SFX
        this.playSynthSFX(key);
    }

    playSynthSFX(type) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        if (type === 'jump') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'rhythm') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'warning') {
            // ECG monitor warning beep - short, high-pitched double beep
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.setValueAtTime(1200, now + 0.05);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.setValueAtTime(0, now + 0.04);
            gain.gain.setValueAtTime(0.15, now + 0.05);
            gain.gain.setValueAtTime(0, now + 0.09);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'hit') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'clear') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554, now + 0.1); // C#
            osc.frequency.setValueAtTime(659, now + 0.2); // E
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.0);
            osc.start(now);
            osc.stop(now + 1.0);
        }
    }

    getCurrentTime() {
        if (!this.ctx) return 0;
        // If BGM is playing, return time relative to BGM start
        // Otherwise return context time (or 0 if not started)
        if (this.bgmSource) {
            return this.ctx.currentTime - this.bgmStartTime;
        }
        return 0;
    }

    getRawTime() {
        return this.ctx ? this.ctx.currentTime : 0;
    }
}

export const audioManager = new AudioContextManager();
// http://localhost:5173