import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js";

/* =========================
   THEME COLORS (MATCH CSS)
========================= */
const THEME = {
    primary: "#d946ef",     // Neon Magenta
    secondary: "#7c3aed",   // Electric Purple
    muted: "#a78bfa",
    inactive: "#8892b0"
};

/* =========================
   DOM ELEMENTS
========================= */
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

/* --- Modal --- */
const connectionModal = document.getElementById("connectionModal");
const startHostBtn = document.getElementById("startHostBtn");
const startSensorBtn = document.getElementById("startSensorBtn");
const hostPanel = document.getElementById("hostPanel");
const clientPanel = document.getElementById("clientPanel");
const myPeerIdDisplay = document.getElementById("myPeerId");
const remotePeerIdInput = document.getElementById("remotePeerIdInput");
const connectBtn = document.getElementById("connectBtn");
const connectionStatus = document.getElementById("connectionStatus");

/* =========================
   GLOBAL STATE
========================= */
let poseLandmarker;
let webcamRunning = false;
let lastVideoTime = -1;
let lastFrameTime = performance.now();
let results;

let currentFacingMode = "user";
let stream = null;
let isMirrored = true;

/* --- PeerJS --- */
let peer = null;
let conn = null;
let appRole = null; // HOST | SENSOR

/* =========================
   ROLE SELECTION
========================= */
startHostBtn.addEventListener("click", () => {
    appRole = "HOST";
    hostPanel.classList.remove("hidden");
    clientPanel.classList.add("hidden");
    initPeer(true);
});

startSensorBtn.addEventListener("click", () => {
    appRole = "SENSOR";
    clientPanel.classList.remove("hidden");
    hostPanel.classList.add("hidden");
    initPeer(false);
});

connectBtn.addEventListener("click", () => {
    const id = remotePeerIdInput.value.trim();
    if (id) connectToPeer(id);
});

/* =========================
   PEER LOGIC
========================= */
function initPeer(isHost) {
    const myId = isHost ? Math.floor(1000 + Math.random() * 9000) : undefined;
    peer = new Peer(myId?.toString());

    peer.on("open", (id) => {
        if (isHost) {
            myPeerIdDisplay.innerText = id;
            connectionStatus.innerText = "Waiting for Sensor…";
        }
    });

    peer.on("connection", (c) => {
        conn = c;
        setupConnection();
        connectionModal.classList.add("hidden");
        loadingScreen.classList.add("hidden");
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    });

    peer.on("error", (err) => {
        console.error(err);
        alert("Peer error: " + err.type);
    });
}

function connectToPeer(id) {
    conn = peer.connect(id);
    setupConnection();
}

function setupConnection() {
    conn.on("open", () => {
        if (appRole === "SENSOR") {
            connectionModal.classList.add("hidden");
            initLocation();
            createPoseLandmarker();
        }
    });

    conn.on("data", (data) => {
        if (appRole === "HOST") handleRemoteData(data);
    });
}

/* =========================
   HOST RENDERING
========================= */
function handleRemoteData(data) {
    if (data.type === "stats") {
        bodyStatus.innerText = data.detected ? "DETECTED (REMOTE)" : "SEARCHING (REMOTE)";
        bodyStatus.style.color = data.detected ? THEME.primary : THEME.inactive;

        confidenceScore.innerText = data.conf;
        envStatus.innerText = data.env;
        latVal.innerText = data.lat || "--";
        lonVal.innerText = data.lon || "--";
    }

    if (data.type === "landmarks") {
        renderRemoteLandmarks(data.landmarks);
    }
}

function renderRemoteLandmarks(landmarksList) {
    canvasElement.width = 640;
    canvasElement.height = 480;

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const draw = new DrawingUtils(canvasCtx);

    landmarksList.forEach(lm => {
        draw.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, {
            color: THEME.primary,
            lineWidth: 4
        });
        draw.drawLandmarks(lm, {
            color: THEME.secondary,
            radius: 3
        });
    });
}

/* =========================
   SENSOR: GPS
========================= */
function initLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.watchPosition(
        (pos) => {
            const lat = pos.coords.latitude.toFixed(6);
            const lon = pos.coords.longitude.toFixed(6);

            latVal.innerText = lat;
            lonVal.innerText = lon;
            envStatus.innerText = "GPS ACTIVE";
            envStatus.style.color = THEME.primary;

            if (conn?.open) {
                conn.send({
                    type: "stats",
                    env: "GPS ACTIVE",
                    lat,
                    lon,
                    detected: bodyStatus.innerText.includes("DETECTED"),
                    conf: confidenceScore.innerText
                });
            }
        },
        () => {},
        { enableHighAccuracy: true }
    );
}

/* =========================
   MEDIAPIPE INIT
========================= */
async function createPoseLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 2
    });

    loadingScreen.classList.add("hidden");
    enableCam();
}

/* =========================
   CAMERA
========================= */
async function enableCam() {
    if (stream) stream.getTracks().forEach(t => t.stop());

    stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: currentFacingMode }
    });

    video.srcObject = stream;
    video.onloadeddata = predictWebcam;
    webcamRunning = true;
    isMirrored = currentFacingMode === "user";
}

cameraToggleBtn.addEventListener("click", () => {
    if (appRole !== "SENSOR") return;
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    enableCam();
});

mirrorToggleBtn.addEventListener("click", () => {
    isMirrored = !isMirrored;
    mirrorToggleBtn.style.color = isMirrored ? THEME.primary : THEME.inactive;
});

/* =========================
   MAIN LOOP
========================= */
async function predictWebcam() {
    if (!video.videoWidth) return requestAnimationFrame(predictWebcam);

    video.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)";
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = poseLandmarker.detectForVideo(video, performance.now());
    }

    const now = performance.now();
    fpsValue.innerText = Math.round(1000 / (now - lastFrameTime));
    lastFrameTime = now;

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (isMirrored) {
        canvasCtx.translate(canvasElement.width, 0);
        canvasCtx.scale(-1, 1);
    }

    const draw = new DrawingUtils(canvasCtx);

    if (results?.landmarks?.length) {
        bodyStatus.innerText = "DETECTED";
        bodyStatus.style.color = THEME.primary;
        confidenceScore.innerText = "LIVE";

        results.landmarks.forEach(lm => {
            draw.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, {
                color: THEME.primary,
                lineWidth: 4
            });
            draw.drawLandmarks(lm, {
                color: THEME.secondary,
                radius: 3
            });
        });

        conn?.open && conn.send({ type: "landmarks", landmarks: results.landmarks });
    } else {
        bodyStatus.innerText = "SEARCHING";
        bodyStatus.style.color = THEME.inactive;
        confidenceScore.innerText = "--";
    }

    requestAnimationFrame(predictWebcam);
}
