export class AudioManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.enabled = true;

        // Load voices
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }
    }

    speak(text, priority = false) {
        if (!this.enabled || !this.synth) return;

        // If priority is true, cancel current speech
        if (priority) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a "Google US English" or similar futuristic sounding voice
        const preferredVoice = this.voices.find(voice =>
            voice.name.includes('Google US English') ||
            voice.name.includes('Samantha') ||
            voice.lang === 'en-US'
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 1.1; // Slightly faster for "AI" feel
        utterance.pitch = 1.0;

        this.synth.speak(utterance);
    }

    toggleAudio() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.synth.cancel();
        }
        return this.enabled;
    }
}
