// PlexaMotion - Game Logic Module

class Game {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.player = {
            x: canvasWidth / 2,
            y: canvasHeight - 50,
            width: 50,
            height: 20,
            color: '#00f3ff'
        };
        this.enemies = [];
        this.score = 0;
        this.gameOver = false;
        this.enemySpeed = 3;
        this.spawnInterval = 60; // Spawn new enemy every X frames
        this.frameCount = 0;
    }

    // Reset the game to its initial state
    reset() {
        this.player.x = this.canvasWidth / 2;
        this.enemies = [];
        this.score = 0;
        this.gameOver = false;
        this.frameCount = 0;
    }

    // Spawn a new enemy at a random horizontal position
    spawnEnemy() {
        const enemy = {
            x: Math.random() * (this.canvasWidth - 30),
            y: 0,
            width: 30,
            height: 30,
            color: '#ff0077'
        };
        this.enemies.push(enemy);
    }

    /**
     * Update the game state for one frame.
     * @param {number | null} playerNoseX - The normalized x-coordinate of the player's nose (0.0 to 1.0).
     */
    update(playerNoseX) {
        if (this.gameOver) return;

        // Update player position based on nose landmark
        if (playerNoseX !== null) {
            // Smoothly move the player towards the target position
            const targetX = (1 - playerNoseX) * this.canvasWidth - (this.player.width / 2);
            this.player.x += (targetX - this.player.x) * 0.2;
        }

        // --- Enemy Logic ---
        this.frameCount++;
        if (this.frameCount % this.spawnInterval === 0) {
            this.spawnEnemy();
        }

        // Move and check enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.y += this.enemySpeed;

            // Collision detection
            if (
                this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y
            ) {
                this.gameOver = true;
            }

            // Remove enemies that are off-screen
            if (enemy.y > this.canvasHeight) {
                this.enemies.splice(i, 1);
                this.score++;
            }
        }
    }

    /**
     * Draw the current game state onto the canvas.
     * @param {CanvasRenderingContext2D} ctx - The rendering context of the canvas.
     */
    draw(ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw player
        ctx.fillStyle = this.player.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.player.color;
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        ctx.shadowBlur = 0; // Reset shadow

        // Draw enemies
        ctx.fillStyle = this.enemies.length > 0 ? this.enemies[0].color : '#ff0077';
        for (const enemy of this.enemies) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        ctx.shadowBlur = 0; // Reset shadow
    }
}

export default Game;
