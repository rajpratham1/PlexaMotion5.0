export class AudioManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.enabled = true;

        // Web Audio Context for SFX
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.connect(this.audioCtx.destination);
        this.gainNode.gain.value = 0.3; // Global volume

        // Load voices
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }
    }

    // --- Synthesized SFX ---

    playTone(frequency, type, duration) {
        if (!this.enabled) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    playHoverSound() {
        // High pitched chirp
        this.playTone(800, 'sine', 0.05);
    }

    playClickSound() {
        // Mechanical click
        this.playTone(300, 'square', 0.1);
        setTimeout(() => this.playTone(600, 'square', 0.1), 50);
    }

    playSuccessSound() {
        // Level up chord
        this.playTone(440, 'sine', 0.3); // A4
        setTimeout(() => this.playTone(554, 'sine', 0.3), 100); // C#5
        setTimeout(() => this.playTone(659, 'sine', 0.6), 200); // E5
    }

    playErrorSound() {
        this.playTone(200, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(150, 'sawtooth', 0.3), 150);
    }

    // --- Speech Synthesis ---

    speak(text, priority = false) {
        if (!this.enabled || !this.synth) return;

        if (priority) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const preferredVoice = this.voices.find(voice =>
            voice.name.includes('Google US English') ||
            voice.name.includes('Samantha') ||
            voice.lang === 'en-US'
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 1.1;
        utterance.pitch = 1.0;

        this.synth.speak(utterance);
    }

    toggleAudio() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.synth.cancel();
            if (this.audioCtx.state === 'running') {
                this.audioCtx.suspend();
            }
        } else {
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
        }
        return this.enabled;
    }
}
