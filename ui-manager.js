export class UIManager {
    constructor(audioManager) {
        this.audio = audioManager;

        // Screens & Overlays
        this.startScreen = document.getElementById("appModeModal");
        this.loadingScreen = document.getElementById("loadingScreen");
        this.gameOverlay = document.getElementById("gameOverlay");
        this.gestureOverlay = document.getElementById("gestureOverlay");
        this.fitnessPanel = document.getElementById("fitnessPanel");
        this.connectionModal = document.getElementById("connectionModal");

        // Buttons
        this.backBtn = document.getElementById("backToMenuBtn");

        // Stats
        this.fpsValue = document.getElementById("fpsValue");
        this.bodyStatus = document.getElementById("bodyStatus");
        this.confidenceScore = document.getElementById("confidenceScore");

        // Fitness Elements
        this.repCountEl = document.getElementById("repCount");
        this.formFeedbackEl = document.getElementById("formFeedback");

        // Bindings
        this.onModeSelect = null; // Callback
        this.onBack = null;       // Callback

        this.initListeners();
    }

    initListeners() {
        // --- Sound Effects Triggers ---
        const addSound = (btn) => {
            btn.addEventListener('mouseenter', () => this.audio.playHoverSound());
            btn.addEventListener('click', () => this.audio.playClickSound());
        };

        // Apply to all buttons
        document.querySelectorAll('button').forEach(addSound);

        document.getElementById("startFitnessBtn").addEventListener("click", () => this.selectMode('FITNESS'));
        document.getElementById("startGameBtn").addEventListener("click", () => this.selectMode('GAME'));
        document.getElementById("startGestureBtn").addEventListener("click", () => this.selectMode('GESTURE'));
        document.getElementById("startYogaBtn").addEventListener("click", () => this.selectMode('YOGA'));

        document.getElementById("showRemoteLinkBtn").addEventListener("click", () => {
            this.startScreen.classList.add("hidden");
            this.connectionModal.classList.remove("hidden");
        });

        document.getElementById("backToAppModeBtn").addEventListener("click", () => {
            this.connectionModal.classList.add("hidden");
            this.startScreen.classList.remove("hidden");
        });

        this.backBtn.addEventListener("click", () => {
            if (this.onBack) this.onBack();
            this.resetUI();
        });
    }

    selectMode(mode) {
        this.startScreen.classList.add("hidden");
        this.loadingScreen.classList.remove("hidden");
        this.backBtn.classList.remove("hidden");

        if (mode === 'FITNESS') {
            this.fitnessPanel.classList.remove("hidden");
            this.audio.speak("Fitness Mode Activated. Get ready.");
        } else if (mode === 'GAME') {
            this.gameOverlay.classList.remove("hidden");
            document.getElementById("gameStartScreen").classList.remove("hidden");
            document.getElementById("gameHud").classList.add("hidden");
            document.getElementById("gameOverScreen").classList.add("hidden");
            this.audio.speak("Game Mode Activated.");
        } else if (mode === 'GESTURE') {
            this.gestureOverlay.classList.remove("hidden");
            this.audio.speak("Gesture Control Active.");
        } else if (mode === 'YOGA') {
            this.fitnessPanel.classList.remove("hidden");
            this.audio.speak("Yoga Mode Activated.");
        }

        if (this.onModeSelect) this.onModeSelect(mode);
    }

    resetUI() {
        // Hide all active panels
        this.fitnessPanel.classList.add("hidden");
        this.gameOverlay.classList.add("hidden");
        this.gestureOverlay.classList.add("hidden");

        // Show start screen
        this.startScreen.classList.remove("hidden");
        this.backBtn.classList.add("hidden");
        this.loadingScreen.classList.add("hidden"); // Ensure loading is gone

        this.updateStatus(false); // Reset status text
    }

    updateStatus(detected, fps = 0) {
        this.fpsValue.innerText = Math.round(fps);

        if (detected) {
            this.bodyStatus.innerText = "LOCKED";
            this.bodyStatus.classList.add("status-active");
            this.confidenceScore.innerText = "100%";
        } else {
            this.bodyStatus.innerText = "SCANNING";
            this.bodyStatus.classList.remove("status-active");
            this.confidenceScore.innerText = "0%";
        }
    }

    updateFitnessStats(reps, feedback) {
        this.repCountEl.innerText = reps;
        this.formFeedbackEl.innerText = feedback;
    }

    hideLoading() {
        this.loadingScreen.classList.add("hidden");
    }
}
