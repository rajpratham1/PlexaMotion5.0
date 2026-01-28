export class StorageManager {
    constructor() {
        this.prefix = 'plexamotion_';
    }

    saveScore(gameScore) {
        const currentHigh = this.getHighScore();
        if (gameScore > currentHigh) {
            localStorage.setItem(this.prefix + 'highscore', gameScore);
            return true; // New record
        }
        return false;
    }

    getHighScore() {
        return parseInt(localStorage.getItem(this.prefix + 'highscore') || '0');
    }

    saveWorkout(reps) {
        const total = this.getTotalReps() + reps;
        localStorage.setItem(this.prefix + 'total_reps', total);

        // Update session count
        const sessions = parseInt(localStorage.getItem(this.prefix + 'sessions') || '0') + 1;
        localStorage.setItem(this.prefix + 'sessions', sessions);
    }

    getTotalReps() {
        return parseInt(localStorage.getItem(this.prefix + 'total_reps') || '0');
    }

    getStats() {
        return {
            highScore: this.getHighScore(),
            totalReps: this.getTotalReps(),
            sessions: parseInt(localStorage.getItem(this.prefix + 'sessions') || '0')
        };
    }
}
