// PlexaMotion - Gesture Detection Module

// --- State Variables for Gesture Detection ---
let wristHistory = [];
const HISTORY_LENGTH = 15; // Number of frames to store for gesture analysis
const SWIPE_THRESHOLD = 0.15; // Normalized distance to trigger a swipe
let gestureDebounce = false; // Prevents detecting multiple gestures too quickly

/**
 * Detects a swipe gesture based on the history of wrist positions.
 * @returns {string | null} 'swipe_left', 'swipe_right', or null.
 */
function detectSwipe() {
    if (wristHistory.length < HISTORY_LENGTH) {
        return null;
    }

    const startX = wristHistory[0];
    const endX = wristHistory[wristHistory.length - 1];
    const deltaX = endX - startX;

    if (deltaX > SWIPE_THRESHOLD) {
        // Swipe Right (remembering camera is mirrored, so motion is reversed)
        return 'swipe_left'; // User swipes right, image moves left
    } else if (deltaX < -SWIPE_THRESHOLD) {
        // Swipe Left
        return 'swipe_right'; // User swipes left, image moves right
    }

    return null;
}

/**
 * Main function to be called from script.js to analyze gestures.
 * @param {Array<object>} landmarks - The array of 33 pose landmarks for one person.
 * @returns {string | null} The detected gesture or null.
 */
export function analyzeHandGestures(landmarks) {
    if (gestureDebounce) {
        return null;
    }

    // MediaPipe landmark index for the right wrist
    const RIGHT_WRIST = 16;
    const wrist = landmarks[RIGHT_WRIST];

    if (wrist && wrist.visibility > 0.5) {
        // Add current wrist position to history
        wristHistory.push(wrist.x);

        // Keep history at a fixed length
        if (wristHistory.length > HISTORY_LENGTH) {
            wristHistory.shift();
        }

        const gesture = detectSwipe();

        if (gesture) {
            // Start debounce timer and clear history to reset for the next gesture
            gestureDebounce = true;
            wristHistory = [];
            setTimeout(() => {
                gestureDebounce = false;
            }, 1000); // 1-second cooldown

            return gesture;
        }
    } else {
        // If wrist is not visible, clear history
        wristHistory = [];
    }

    return null;
}
