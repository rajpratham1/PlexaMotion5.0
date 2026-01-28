import { CameraManager } from "./camera-manager.js";
import { UIManager } from "./ui-manager.js";
import { AudioManager } from "./audio-manager.js";
import { StorageManager } from "./storage-manager.js";
import { analyzePose } from "./fitness.js";
import { analyzeHandGestures } from "./gestures.js";
import { YogaCoach } from "./yoga.js";
import Game from "./game.js";

// Initialize Managers
const audioManager = new AudioManager();
const storageManager = new StorageManager();
const uiManager = new UIManager(audioManager);

const videoElement = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const cameraManager = new CameraManager(videoElement, canvasElement);
const yogaCoach = new YogaCoach(audioManager, uiManager);

// State
let appMode = null;
let game = null;
let lastFrameTime = performance.now();
let rafId = null;

// Gestures State
let currentGalleryIndex = 0;
const galleryItems = document.querySelectorAll(".gallery-item");

// --- Setup Interactions ---

uiManager.onModeSelect = async (mode) => {
    appMode = mode;

    if (mode === 'GAME') {
        game = new Game(canvasElement.width, canvasElement.height);
        const stats = storageManager.getStats();
        console.log("High Score Loaded:", stats.highScore);
    } else if (mode === 'YOGA') {
        yogaCoach.start();
    }

    const initialized = await cameraManager.initialize();
    if (initialized) {
        await cameraManager.startCamera();
        uiManager.hideLoading();
        startLoop();
    } else {
        alert("Failed to initialize vision system");
        uiManager.resetUI();
    }
};

uiManager.onBack = () => {
    stopLoop();
    cameraManager.stopCamera();
    if (appMode === 'YOGA') {
        yogaCoach.stop();
    }
    appMode = null;
    game = null;
};

// --- Main Loop ---

function startLoop() {
    lastFrameTime = performance.now();
    loop();
}

function stopLoop() {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

function loop() {
    const now = performance.now();
    const fps = 1000 / (now - lastFrameTime);
    lastFrameTime = now;

    // Detection
    const results = cameraManager.detectPose();
    const detected = results && results.landmarks && results.landmarks.length > 0;

    // Draw Skeleton
    if (appMode !== 'GAME' || (game && game.gameOver)) {
        cameraManager.drawResults(results, appMode);
    } else if (game && !game.gameOver) {
        cameraManager.ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }

    // Logic
    if (detected) {
        const landmarks = results.landmarks[0];

        switch (appMode) {
            case 'FITNESS':
                const analysis = analyzePose(landmarks);
                uiManager.updateFitnessStats(analysis.reps, analysis.feedback);
                break;

            case 'YOGA':
                yogaCoach.process(landmarks, now);
                break;

            case 'GAME':
                if (game && !game.gameOver) {
                    const nose = landmarks[0];
                    game.update(nose.x);
                    game.draw(cameraManager.ctx);

                    if (game.gameOver) {
                        storageManager.saveScore(game.score);
                        audioManager.speak("Game Over. Final Score " + game.score);
                        document.getElementById("finalScore").innerText = game.score;
                        document.getElementById("gameOverScreen").classList.remove("hidden");
                        document.getElementById("gameHud").classList.add("hidden");
                    } else {
                        document.getElementById("gameScore").innerText = game.score;
                    }
                }
                break;

            case 'GESTURE':
                const gesture = analyzeHandGestures(landmarks);
                if (gesture) {
                    handleGesture(gesture);
                }
                break;
        }
    }

    uiManager.updateStatus(detected, fps);
    rafId = requestAnimationFrame(loop);
}

// --- Specific Logic ---

function handleGesture(gesture) {
    if (gesture === 'swipe_right') {
        navigateGallery(1);
    } else if (gesture === 'swipe_left') {
        navigateGallery(-1);
    }
}

function navigateGallery(direction) {
    galleryItems[currentGalleryIndex].classList.remove('active');
    currentGalleryIndex = (currentGalleryIndex + direction + galleryItems.length) % galleryItems.length;
    galleryItems[currentGalleryIndex].classList.add('active');
    audioManager.speak("Swipe");
}


// --- Global Event Listeners for Game ---
document.getElementById("startGameButton").addEventListener("click", () => {
    if (game) {
        game.reset();
        document.getElementById("gameStartScreen").classList.add("hidden");
        document.getElementById("gameHud").classList.remove("hidden");
        audioManager.speak("Game Start");
    }
});

document.getElementById("restartGameButton").addEventListener("click", () => {
    if (game) {
        game.reset();
        document.getElementById("gameOverScreen").classList.add("hidden");
        document.getElementById("gameHud").classList.remove("hidden");
        audioManager.speak("Restarting");
    }
});

// --- Button Listeners (Camera controls) ---
document.getElementById("cameraToggle").addEventListener('click', () => {
    cameraManager.toggleCamera();
});

document.getElementById("mirrorToggle").addEventListener('click', () => {
    const isMirrored = cameraManager.toggleMirror();
    document.getElementById("mirrorToggle").style.color = isMirrored ? '#00f3ff' : '#8892b0';
});
