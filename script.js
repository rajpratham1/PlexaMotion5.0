import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js";
import { analyzePose } from "./fitness.js";
import Game from "./game.js";
import { analyzeHandGestures } from "./gestures.js";

// --- DOM Elements ---
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const loadingScreen = document.getElementById("loadingScreen");
const bodyStatus = document.getElementById("bodyStatus");
const confidenceScore = document.getElementById("confidenceScore");
const envStatus = document.getElementById("envStatus");
const latVal = document.getElementById("latVal");
const lonVal = document.getElementById("lonVal");
const fpsValue = document.getElementById("fpsValue");
const cameraToggleBtn = document.getElementById("cameraToggle");
const mirrorToggleBtn = document.getElementById("mirrorToggle");

// New Mode Selection Modal
const appModeModal = document.getElementById("appModeModal");
const startFitnessBtn = document.getElementById("startFitnessBtn");
const startGameBtn = document.getElementById("startGameBtn");
const startGestureBtn = document.getElementById("startGestureBtn");
const showRemoteLinkBtn = document.getElementById("showRemoteLinkBtn");

// Back Button
const backToMenuBtn = document.getElementById("backToMenuBtn");

// Fitness Panel
const fitnessPanel = document.getElementById("fitnessPanel");
const repCountEl = document.getElementById("repCount");
const formFeedbackEl = document.getElementById("formFeedback");

// Game UI
const gameOverlay = document.getElementById("gameOverlay");
const gameStartScreen = document.getElementById("gameStartScreen");
const startGameButton = document.getElementById("startGameButton");
const gameHud = document.getElementById("gameHud");
const gameScoreEl = document.getElementById("gameScore");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreEl = document.getElementById("finalScore");
const restartGameButton = document.getElementById("restartGameButton");

// Gesture UI
const gestureOverlay = document.getElementById("gestureOverlay");
const galleryItems = document.querySelectorAll(".gallery-item");

// Connection Modal (PeerJS)
const connectionModal = document.getElementById("connectionModal");
const backToAppModeBtn = document.getElementById("backToAppModeBtn");
const startHostBtn = document.getElementById("startHostBtn");
const startSensorBtn = document.getElementById("startSensorBtn");
const hostPanel = document.getElementById("hostPanel");
const clientPanel = document.getElementById("clientPanel");
const myPeerIdDisplay = document.getElementById("myPeerId");
const remotePeerIdInput = document.getElementById("remotePeerIdInput");
const connectBtn = document.getElementById("connectBtn");
const connectionStatus = document.getElementById("connectionStatus");


// --- Global Variables ---
let poseLandmarker = undefined;
let webcamRunning = false;
let lastVideoTime = -1;
let lastFrameTime = performance.now();
let results = undefined;
let currentFacingMode = 'user';
let stream = null;
let isMirrored = true;
let appInitialized = false;

// Application State
let appMode = null; // 'FITNESS', 'GAME', 'GESTURE', 'SENSOR'
let game = null;
let currentGalleryIndex = 0;
let peer = null;
let conn = null;

// --- Initialization and Mode Selection ---

// Main entry point is user selecting a mode
startFitnessBtn.addEventListener("click", () => selectMode('FITNESS'));
startGameBtn.addEventListener("click", () => selectMode('GAME'));
startGestureBtn.addEventListener("click", () => selectMode('GESTURE'));

backToMenuBtn.addEventListener("click", resetToModeSelection);

showRemoteLinkBtn.addEventListener("click", () => {
    appModeModal.classList.add("hidden");
    connectionModal.classList.remove("hidden");
});

backToAppModeBtn.addEventListener("click", () => {
    connectionModal.classList.add("hidden");
    appModeModal.classList.remove("hidden");
});


function selectMode(mode) {
    appMode = mode;
    appModeModal.classList.add("hidden");
    backToMenuBtn.classList.remove("hidden"); // Show back button

    if (mode === 'FITNESS') {
        fitnessPanel.classList.remove("hidden");
    }
    if (mode === 'GAME') {
        gameOverlay.classList.remove("hidden");
        gameStartScreen.classList.remove("hidden");
        gameHud.classList.add("hidden");
        gameOverScreen.classList.add("hidden");
        game = new Game(canvasElement.width, canvasElement.height);
    }
    if (mode === 'GESTURE') {
        gestureOverlay.classList.remove("hidden");
    }

    // Start camera and model loading if not already done
    if (!appInitialized) {
        initializeApp();
    }
}

function resetToModeSelection() {
    appMode = null;

    // Hide all panels and overlays
    fitnessPanel.classList.add("hidden");
    gameOverlay.classList.add("hidden");
    gestureOverlay.classList.add("hidden");

    // Reset game state if it exists
    if (game) {
        game.gameOver = true;
    }
    
    // Hide back button and show main modal
    backToMenuBtn.classList.add("hidden");
    appModeModal.classList.remove("hidden");
}

const initializeApp = async () => {
    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numPoses: 1
        });
        console.log("PoseLandmarker loaded.");
        loadingScreen.classList.add("hidden");
        appInitialized = true;
        enableCam();
        initLocation();
    } catch (error) {
        console.error("Error loading PoseLandmarker:", error);
        alert("Failed to load computer vision model.");
    }
};

const enableCam = async () => {
    if (!poseLandmarker) return;
    if (webcamRunning) {
        if (stream) stream.getTracks().forEach(track => track.stop());
        webcamRunning = false;
    }

    const constraints = {
        video: { width: 640, height: 480, facingMode: currentFacingMode }
    };

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
        webcamRunning = true;
        isMirrored = (currentFacingMode === 'user');
    } catch (err) {
        console.error("Camera access denied:", err);
        alert("Camera access is required.");
    }
};

// --- Main Prediction Loop ---
async function predictWebcam() {
    if (Object.is(video.videoWidth, 0) || Object.is(video.videoHeight, 0)) {
        window.requestAnimationFrame(predictWebcam);
        return;
    }

    video.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)";
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    if (game && (game.canvasWidth !== canvasElement.width || game.canvasHeight !== canvasElement.height)) {
        game.canvasWidth = canvasElement.width;
        game.canvasHeight = canvasElement.height;
    }

    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = poseLandmarker.detectForVideo(video, performance.now());
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    let personDetected = results.landmarks && results.landmarks.length > 0;

    if (appMode !== 'GAME') {
        const skeletonOpacity = appMode === 'GESTURE' ? 0.4 : 1.0;
        if (isMirrored) {
            canvasCtx.translate(canvasElement.width, 0);
            canvasCtx.scale(-1, 1);
        }
        const drawingUtils = new DrawingUtils(canvasCtx);
        if (personDetected) {
            for (const landmarks of results.landmarks) {
                drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: `rgba(0, 243, 255, ${skeletonOpacity})`, lineWidth: 4 });
                drawingUtils.drawLandmarks(landmarks, { color: `rgba(255, 0, 119, ${skeletonOpacity})`, radius: 3, lineWidth: 2 });
            }
        }
    }

    if (personDetected) {
        switch (appMode) {
            case 'FITNESS':
                handleFitnessLogic(results.landmarks);
                break;
            case 'GAME':
                handleGameLogic(results.landmarks);
                break;
            case 'GESTURE':
                handleGestureLogic(results.landmarks);
                break;
            case 'SENSOR':
                 if (conn && conn.open) {
                    conn.send({ type: 'landmarks', landmarks: results.landmarks });
                }
                break;
        }
    }
     canvasCtx.restore();

    updateBaseUI(personDetected);
    
    if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
    }
}

function updateBaseUI(detected) {
    const now = performance.now();
    const fps = 1000 / (now - lastFrameTime);
    lastFrameTime = now;
    fpsValue.innerText = Math.round(fps);
    
    if (detected) {
        bodyStatus.innerText = "DETECTED";
        bodyStatus.style.color = "#00f3ff";
        confidenceScore.innerText = "LIVE";
    } else {
        bodyStatus.innerText = "SEARCHING";
        bodyStatus.style.color = "#8892b0";
        confidenceScore.innerText = "0%";
    }
}

// --- Logic Handlers ---

function handleFitnessLogic(landmarks) {
    const firstPersonLandmarks = landmarks[0];
    const analysis = analyzePose(firstPersonLandmarks);
    repCountEl.innerText = analysis.reps;
    formFeedbackEl.innerText = analysis.feedback;
}

function handleGameLogic(landmarks) {
    if (!game || game.gameOver) {
        const drawingUtils = new DrawingUtils(canvasCtx);
        if (isMirrored) {
            canvasCtx.translate(canvasElement.width, 0);
            canvasCtx.scale(-1, 1);
        }
        for (const lm of landmarks) {
            drawingUtils.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, { color: "rgba(0, 243, 255, 0.3)", lineWidth: 2 });
        }
        return;
    }

    const nose = landmarks[0][0];
    game.update(nose.x);
    game.draw(canvasCtx);
    gameScoreEl.innerText = game.score;

    if (game.gameOver) {
        finalScoreEl.innerText = game.score;
        gameOverScreen.classList.remove("hidden");
        gameHud.classList.add("hidden");
    }
}

function handleGestureLogic(landmarks) {
    const gesture = analyzeHandGestures(landmarks[0]);
    if (gesture) {
        if (gesture === 'swipe_right') {
            navigateGallery(1);
        } else if (gesture === 'swipe_left') {
            navigateGallery(-1);
        }
    }
}

function navigateGallery(direction) {
    galleryItems[currentGalleryIndex].classList.remove('active');
    currentGalleryIndex = (currentGalleryIndex + direction + galleryItems.length) % galleryItems.length;
    galleryItems[currentGalleryIndex].classList.add('active');
}

// --- Event Listeners ---

startGameButton.addEventListener("click", () => {
    game.reset();
    gameStartScreen.classList.add("hidden");
    gameHud.classList.remove("hidden");
});

restartGameButton.addEventListener("click", () => {
    game.reset();
    gameOverScreen.classList.add("hidden");
    gameHud.classList.remove("hidden");
});

mirrorToggleBtn.addEventListener('click', () => {
    isMirrored = !isMirrored;
    mirrorToggleBtn.style.color = isMirrored ? '#00f3ff' : '#8892b0';
});

cameraToggleBtn.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    enableCam();
});


// Real-Time GPS
function initLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lon = position.coords.longitude.toFixed(6);
                latVal.innerText = lat;
                lonVal.innerText = lon;
                envStatus.innerText = "GPS ACTIVE";
                envStatus.style.color = "#00f3ff";

                if (appMode === 'SENSOR' && conn && conn.open) {
                    conn.send({
                        type: 'stats',
                        env: "GPS ACTIVE", lat, lon,
                        detected: (bodyStatus.innerText.includes("DETECTED")),
                        conf: confidenceScore.innerText
                    });
                }
            },
            (error) => {
                console.warn("Geolocation watch error:", error);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
    }
}

// --- PeerJS Logic ---
startHostBtn.addEventListener("click", () => {
    initPeer(true); 
    hostPanel.classList.remove("hidden");
    clientPanel.classList.add("hidden");
});

startSensorBtn.addEventListener("click", () => {
    appMode = 'SENSOR';
    initPeer(false);
    clientPanel.classList.remove("hidden");
    hostPanel.classList.add("hidden");
});

connectBtn.addEventListener("click", () => {
    const remoteId = remotePeerIdInput.value.trim();
    if (remoteId) connectToPeer(remoteId);
});

function initPeer(isHost) {
    const myId = isHost ? Math.floor(1000 + Math.random() * 9000) : undefined;
    peer = new Peer(myId ? `${myId}` : undefined);

    peer.on('open', (id) => {
        if (isHost) {
            myPeerIdDisplay.innerText = id;
            connectionStatus.innerText = "Waiting for Sensor to join...";
        } else {
             console.log('Sensor PeerJS client ready.');
        }
    });

    peer.on('connection', (c) => { 
        conn = c;
        setupConnectionEvents();
        connectionModal.classList.add("hidden");
        alert("Sensor Connected! Receiving Data...");
        loadingScreen.classList.add("hidden");
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    });

    peer.on('error', (err) => {
        console.error("PeerJS Error:", err);
        alert("Connection Error: " + err.type);
    });
}

function connectToPeer(remoteId) {
    conn = peer.connect(remoteId);
    setupConnectionEvents();
}

function setupConnectionEvents() {
    conn.on('open', () => {
        if (appMode === 'SENSOR') {
            connectionModal.classList.add("hidden");
            if (!appInitialized) {
                 initializeApp();
            }
        }
    });

    conn.on('data', (data) => {
        if (data.type === 'landmarks') renderRemoteLandmarks(data.landmarks);
    });
}

function renderRemoteLandmarks(landmarksList) {
    canvasElement.width = 640;
    canvasElement.height = 480;
    canvasElement.style.width = "100%";
    canvasElement.style.height = "100%";

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const drawingUtils = new DrawingUtils(canvasCtx);
    for (const landmarks of landmarksList) {
        drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: "#00f3ff", lineWidth: 4 });
        drawingUtils.drawLandmarks(landmarks, { color: "#ff0077", radius: 3, lineWidth: 2 });
    }
    canvasCtx.restore();
}

