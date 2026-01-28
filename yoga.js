export class YogaCoach {
    constructor(audioManager, uiManager) {
        this.audio = audioManager;
        this.ui = uiManager;
        this.active = false;
        this.currentPose = "Warrior II";
        this.holdTimer = 0;
        this.requiredHoldTime = 10; // seconds
        this.isHolding = false;
        this.lastFrameTime = 0;
    }

    start() {
        this.active = true;
        this.holdTimer = 0;
        this.isHolding = false;
        this.audio.speak("Yoga Mode. Assume Warrior Two pose.");
        this.ui.updateFitnessStats(0, "Assume Warrior II"); // Reusing fitness UI for now
    }

    stop() {
        this.active = false;
    }

    process(landmarks, timestamp) {
        if (!this.active) return;

        // Calculate dt
        const dt = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;

        // Helper to get angle
        const getAngle = (a, b, c) => {
            const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
            let angle = Math.abs(radians * 180.0 / Math.PI);
            if (angle > 180.0) angle = 360 - angle;
            return angle;
        };

        // Landmarks
        const leftHip = landmarks[23];
        const leftKnee = landmarks[25];
        const leftAnkle = landmarks[27];

        const rightHip = landmarks[24];
        const rightKnee = landmarks[26];
        const rightAnkle = landmarks[28];

        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftElbow = landmarks[13];
        const rightElbow = landmarks[14];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];

        // Warrior II Criteria (Right leg bent, Left leg straight, arms horizontal)
        const rightKneeAngle = getAngle(rightHip, rightKnee, rightAnkle);
        const leftKneeAngle = getAngle(leftHip, leftKnee, leftAnkle);
        const leftArmAngle = getAngle(leftShoulder, leftElbow, leftWrist);
        const rightArmAngle = getAngle(rightShoulder, rightElbow, rightWrist);

        // Broad thresholds for ease of use
        const isRightBent = rightKneeAngle > 90 && rightKneeAngle < 160;
        const isLeftStraight = leftKneeAngle > 160;
        const armsStraight = leftArmAngle > 150 && rightArmAngle > 150;

        if (isRightBent && isLeftStraight && armsStraight) {
            if (!this.isHolding) {
                this.isHolding = true;
                this.audio.playSuccessSound();
            }
            this.holdTimer += dt;

            const remaining = Math.ceil(this.requiredHoldTime - this.holdTimer);
            if (remaining > 0) {
                this.ui.updateFitnessStats(remaining + "s", "HOLD... Breathe...");
            } else {
                this.ui.updateFitnessStats("DONE", "Namaste! Release.");
                if (this.holdTimer < this.requiredHoldTime + 2) { // Play once
                    this.audio.speak("Perfect. Namaste.");
                }
            }
        } else {
            this.isHolding = false;
            this.holdTimer = Math.max(0, this.holdTimer - dt); // Decay slowly
            this.ui.updateFitnessStats("--", "Adjust: Right knee bent, Arms out.");
        }
    }
}
