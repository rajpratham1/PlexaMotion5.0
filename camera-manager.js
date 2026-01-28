import {
    PoseLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js";

export class CameraManager {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext("2d");
        this.poseLandmarker = undefined;
        this.webcamRunning = false;
        this.stream = null;
        this.currentFacingMode = 'user';
        this.isMirrored = true;
        this.lastVideoTime = -1;
    }

    async initialize() {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numPoses: 1
            });
            console.log("PoseLandmarker loaded.");
            return true;
        } catch (error) {
            console.error("Error loading PoseLandmarker:", error);
            return false;
        }
    }

    async startCamera() {
        if (!this.poseLandmarker) return;

        // Stop existing stream if any
        if (this.webcamRunning) {
            this.stopCamera();
        }

        const constraints = {
            video: { width: 640, height: 480, facingMode: this.currentFacingMode }
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            this.webcamRunning = true;
            this.isMirrored = (this.currentFacingMode === 'user');
            
            // Wait for data to load
            return new Promise((resolve) => {
                this.video.addEventListener("loadeddata", () => {
                    resolve();
                }, { once: true });
            });

        } catch (err) {
            console.error("Camera access denied:", err);
            throw err;
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.webcamRunning = false;
        this.video.srcObject = null;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    toggleCamera() {
        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        return this.startCamera();
    }

    toggleMirror() {
        this.isMirrored = !this.isMirrored;
        return this.isMirrored;
    }

    detectPose() {
        if (!this.webcamRunning || !this.poseLandmarker) return null;

        if (this.lastVideoTime !== this.video.currentTime) {
            this.lastVideoTime = this.video.currentTime;
            const results = this.poseLandmarker.detectForVideo(this.video, performance.now());
            return results;
        }
        return null;
    }

    drawResults(results, appMode) {
        if (!results) return;

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        const drawingUtils = new DrawingUtils(this.ctx);
        
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.isMirrored) {
            this.ctx.translate(this.canvas.width, 0);
            this.ctx.scale(-1, 1);
        }

        if (results.landmarks) {
            for (const landmarks of results.landmarks) {
                const opacity = appMode === 'GESTURE' ? 0.4 : 1.0;
                drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: `rgba(0, 243, 255, ${opacity})`, lineWidth: 4 });
                drawingUtils.drawLandmarks(landmarks, { color: `rgba(255, 0, 119, ${opacity})`, radius: 3, lineWidth: 2 });
            }
        }
        this.ctx.restore();
    }
}
