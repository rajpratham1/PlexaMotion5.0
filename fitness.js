// PlexaMotion - Fitness Logic Module

/**
 * Calculates the angle between three 2D points (landmarks).
 * @param {object} p1 - First point with x, y properties.
 * @param {object} p2 - Second point (the vertex) with x, y properties.
 * @param {object} p3 - Third point with x, y properties.
 * @returns {number} The angle in degrees.
 */
function calculateAngle(p1, p2, p3) {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);

    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
}


// --- Squat Counter Logic ---
let squatCounter = 0;
let squatState = 'up'; // 'up' or 'down'
let squatFeedback = 'Start squatting!';

/**
 * Processes pose landmarks to count squats and provide feedback.
 * @param {Array<object>} landmarks - The array of 33 pose landmarks.
 */
function processSquats(landmarks) {
    // MediaPipe landmark indices for relevant joints
    const LEFT_HIP = 23;
    const LEFT_KNEE = 25;
    const LEFT_ANKLE = 27;
    const RIGHT_HIP = 24;
    const RIGHT_KNEE = 26;
    const RIGHT_ANKLE = 28;

    // Get landmark coordinates
    const leftHip = landmarks[LEFT_HIP];
    const leftKnee = landmarks[LEFT_KNEE];
    const leftAnkle = landmarks[LEFT_ANKLE];
    const rightHip = landmarks[RIGHT_HIP];
    const rightKnee = landmarks[RIGHT_KNEE];
    const rightAnkle = landmarks[RIGHT_ANKLE];

    // Calculate knee angles
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    
    // --- Squat State Machine ---
    // Thresholds for squat detection (can be tweaked)
    const SQUAT_DOWN_THRESHOLD = 120; // Angle to consider as 'down'
    const SQUAT_UP_THRESHOLD = 160;   // Angle to consider as 'up'

    // Check if user is in 'down' position
    if (leftKneeAngle < SQUAT_DOWN_THRESHOLD && rightKneeAngle < SQUAT_DOWN_THRESHOLD) {
        squatState = 'down';
        squatFeedback = 'Great depth!';
    }

    // Check if user has returned to 'up' position from a 'down' state
    if (squatState === 'down' && leftKneeAngle > SQUAT_UP_THRESHOLD && rightKneeAngle > SQUAT_UP_THRESHOLD) {
        squatState = 'up';
        squatCounter++;
        squatFeedback = 'Good rep!';
    }
    
    // Basic Form Check: Knees should be visible
    if(leftKnee.visibility < 0.8 || rightKnee.visibility < 0.8) {
        squatFeedback = "Make sure your full body is visible!";
    }
}

/**
 * Main function to be called from script.js
 * @param {Array<object>} landmarks - The array of 33 pose landmarks.
 * @returns {object} An object containing the current rep count and feedback.
 */
export function analyzePose(landmarks) {
    if (landmarks && landmarks.length > 0) {
        processSquats(landmarks);
    }

    return {
        reps: squatCounter,
        feedback: squatFeedback
    };
}
