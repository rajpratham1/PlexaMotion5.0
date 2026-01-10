import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js";

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

// Modal Elements
const connectionModal = document.getElementById("connectionModal");
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

// PeerJS / Role State
let peer = null;
let conn = null;
let appRole = null; // 'HOST' or 'SENSOR'
const PREFIX = "plexa-";

// --- Role Selection Events ---
startHostBtn.addEventListener("click", () => {
    appRole = 'HOST';
    // Host doesn't typically need camera if just displaying, 
    // but user might want local view too. For this requirement (Remote Sensor), 
    // Host purely displays remote data.
    hostPanel.classList.remove("hidden");
    clientPanel.classList.add("hidden");
    initPeer(true); // Create Host ID
});

startSensorBtn.addEventListener("click", () => {
    appRole = 'SENSOR';
    clientPanel.classList.remove("hidden");
    hostPanel.classList.add("hidden");
    initPeer(false); // Create Client Peer
});

connectBtn.addEventListener("click", () => {
    const remoteId = remotePeerIdInput.value.trim();
    if (remoteId) connectToPeer(remoteId);
});

// --- PeerJS Logic ---
function initPeer(isHost) {
    // Generate simple ID if host, or random if sensor
    // In real app we might want user to pick, but random is fine for quick P2P
    const myId = isHost ? Math.floor(1000 + Math.random() * 9000) : null;

    peer = new Peer(myId ? `${myId}` : undefined);

    peer.on('open', (id) => {
        console.log('My Peer ID is: ' + id);
        if (isHost) {
            myPeerIdDisplay.innerText = id;
            connectionStatus.innerText = "Waiting for Sensor to join...";
        }
    });

    peer.on('connection', (c) => {
        // HOST receives connection
        conn = c;
        setupConnection();
        connectionModal.classList.add("hidden"); // Host starts immediately upon connection
        alert("Sensor Connected! Receiving Data...");

        // Hide local camera/loading if we are just a display
        // or keep black screen waiting for data
        loadingScreen.classList.add("hidden");
        // Clear canvas initially
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    });

    peer.on('error', (err) => {
        console.error("PeerJS Error:", err);
        alert("Connection Error: " + err.type);
    });
}

function connectToPeer(remoteId) {
    // SENSOR initiates connection
    conn = peer.connect(remoteId);
    setupConnection();
}

function setupConnection() {
    conn.on('open', () => {
        console.log("Connected to: " + conn.peer);
        if (appRole === 'SENSOR') {
            connectionModal.classList.add("hidden");
            // Start the sensor loop
            initLocation();
            createPoseLandmarker();
        }
    });

    conn.on('data', (data) => {
        // HOST receives data
        if (appRole === 'HOST') {
            handleRemoteData(data);
        }
    });
}

function handleRemoteData(data) {
    // Update Stats
    if (data.type === 'stats') {
        const { detected, conf, env, lat, lon } = data;

        bodyStatus.innerText = detected ? "DETECTED (REMOTE)" : "SEARCHING (REMOTE)";
        bodyStatus.style.color = detected ? "#00f3ff" : "#8892b0";
        confidenceScore.innerText = conf;

        envStatus.innerText = env;
        latVal.innerText = lat || "--";
        lonVal.innerText = lon || "--";
    }

    // Draw Skeleton
    if (data.type === 'landmarks') {
        renderRemoteLandmarks(data.landmarks);
    }
}

function renderRemoteLandmarks(landmarksList) {
    // Ensure canvas is sized (might default to 0 if video not loaded, force size)
    canvasElement.width = 640;
    canvasElement.height = 480;
    canvasElement.style.width = "100%";
    canvasElement.style.height = "100%";

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Host usually doesn't need mirror unless specified, assume direct mapping
    const drawingUtils = new DrawingUtils(canvasCtx);

    for (const landmarks of landmarksList) {
        drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
            color: "#00f3ff",
            lineWidth: 4
        });
        drawingUtils.drawLandmarks(landmarks, {
            color: "#ff0077",
            radius: 3,
            lineWidth: 2
        });
    }

    canvasCtx.restore();
}


// --- Sensor Logic (Existing + Send) ---

// Real-Time GPS
function initLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lon = position.coords.longitude.toFixed(6);

                // Update Local UI
                latVal.innerText = lat;
                lonVal.innerText = lon;
                envStatus.innerText = "GPS ACTIVE";
                envStatus.style.color = "#00f3ff";

                // SEND TO HOST
                if (conn && conn.open) {
                    conn.send({
                        type: 'stats',
                        env: "GPS ACTIVE",
                        lat: lat,
                        lon: lon,
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

// Enable Webcam (Sensor Only)
const createPoseLandmarker = async () => {
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
            numPoses: 2
        });
        console.log("PoseLandmarker loaded.");
        loadingScreen.classList.add("hidden");
        enableCam();
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

cameraToggleBtn.addEventListener('click', () => {
    if (appRole !== 'SENSOR') return; // Only sensor toggles camera
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    enableCam();
});

mirrorToggleBtn.addEventListener('click', () => {
    isMirrored = !isMirrored;
    mirrorToggleBtn.style.color = isMirrored ? '#00f3ff' : '#8892b0';
});

async function predictWebcam() {
    if (Object.is(video.videoWidth, 0) || Object.is(video.videoHeight, 0)) {
        window.requestAnimationFrame(predictWebcam);
        return;
    }

    if (isMirrored) {
        video.style.transform = "scaleX(-1)";
    } else {
        video.style.transform = "scaleX(1)";
    }

    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = poseLandmarker.detectForVideo(video, performance.now());
    }

    const now = performance.now();
    const fps = 1000 / (now - lastFrameTime);
    lastFrameTime = now;
    if (now % 10 < 1) fpsValue.innerText = Math.round(fps);

    // Local Draw
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (isMirrored) {
        canvasCtx.translate(canvasElement.width, 0);
        canvasCtx.scale(-1, 1);
    }

    const drawingUtils = new DrawingUtils(canvasCtx);
    let detected = false;

    if (results.landmarks && results.landmarks.length > 0) {
        detected = true;
        bodyStatus.innerText = "DETECTED";
        bodyStatus.style.color = "#00f3ff";
        confidenceScore.innerText = "LIVE";

        for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
                color: "#00f3ff", lineWidth: 4
            });
            drawingUtils.drawLandmarks(landmarks, {
                color: "#ff0077", radius: 3, lineWidth: 2
            });
        }

        // SEND TO HOST
        if (conn && conn.open) {
            conn.send({
                type: 'landmarks',
                landmarks: results.landmarks
            });
        }

    } else {
        bodyStatus.innerText = "SEARCHING";
        bodyStatus.style.color = "#8892b0";
        confidenceScore.innerText = "--";

        // Also update Host if nothing found
        if (conn && conn.open) {
            conn.send({
                type: 'stats',
                env: envStatus.innerText,
                lat: latVal.innerText,
                lon: lonVal.innerText,
                detected: false,
                conf: "--"
            });
        }
    }

    canvasCtx.restore();

    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}
