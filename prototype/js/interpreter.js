// GameEngine class for the Kids Coding Adventure
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.state = {
            robot: { x: 1, y: 1, direction: 0 }, // 0=North, 1=East, 2=South, 3=West
            goal: { x: 4, y: 1 },
            obstacles: [],
            gridSize: 8,
            cellSize: 50,
            isRunning: false,
            currentStep: 0,
            program: [],
            stepMode: false
        };

        // Movement functions that will be called by generated code
        this.setupMovementFunctions();

        // Initialize the game
        this.reset();
        this.draw();

        console.log('GameEngine initialized successfully');
    }

    // Set up global movement functions
    setupMovementFunctions() {
        const self = this;

        // Make movement functions globally available
        window.moveForward = function() {
            console.log('moveForward() called');
            self.moveForward();
        };

        window.turnRight = function() {
            console.log('turnRight() called');
            self.turnRight();
        };

        window.turnLeft = function() {
            console.log('turnLeft() called');
            self.turnLeft();
        };

        console.log('Global movement functions set up');
    }

    // Reset game to initial state
    reset() {
        console.log('Resetting game state');
        this.state.robot = { x: 1, y: 1, direction: 0 };
        this.state.goal = { x: 4, y: 1 };
        this.state.obstacles = [];
        this.state.isRunning = false;
        this.state.currentStep = 0;
        this.state.program = [];
        this.state.stepMode = false;
        this.draw();
        this.showFeedback('Ready to start!', 'info');
    }

    // Execute the complete program
    executeProgram(code) {
        if (this.state.isRunning) {
            console.log('Program already running, ignoring new execution');
            return;
        }

        console.log('Executing program:', code);
        this.state.isRunning = true;
        this.state.stepMode = false;

        try {
            // Reset robot position
            this.reset();

            // Execute the code
            eval(code);

            // Check if goal reached
            this.checkGoalReached();

        } catch (error) {
            console.error('Program execution error:', error);
            this.showFeedback('Error: ' + error.message, 'error');
        } finally {
            this.state.isRunning = false;
        }
    }

    // Step through program one command at a time
    stepProgram(code) {
        if (!this.state.stepMode) {
            // Initialize step mode
            this.state.stepMode = true;
            this.state.currentStep = 0;
            this.state.program = this.parseProgram(code);
            this.reset();
            this.showFeedback('Step mode: Click Step to execute one command at a time', 'info');
            return;
        }

        // Execute next step
        if (this.state.currentStep < this.state.program.length) {
            const command = this.state.program[this.state.currentStep];
            console.log(`Executing step ${this.state.currentStep + 1}: ${command}`);

            try {
                eval(command);
                this.state.currentStep++;
                this.draw();

                if (this.state.currentStep >= this.state.program.length) {
                    this.showFeedback('Program complete! Click Reset to try again.', 'success');
                    this.checkGoalReached();
                } else {
                    this.showFeedback(`Step ${this.state.currentStep} of ${this.state.program.length}`, 'info');
                }
            } catch (error) {
                console.error('Step execution error:', error);
                this.showFeedback('Error: ' + error.message, 'error');
            }
        }
    }

    // Parse program into individual commands
    parseProgram(code) {
        return code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
    }

    // Move robot forward
    moveForward() {
        const directions = [
            { x: 0, y: -1 }, // North
            { x: 1, y: 0 },  // East
            { x: 0, y: 1 },  // South
            { x: -1, y: 0 }  // West
        ];

        const dir = directions[this.state.robot.direction];
        const newX = this.state.robot.x + dir.x;
        const newY = this.state.robot.y + dir.y;

        console.log(`Moving from (${this.state.robot.x}, ${this.state.robot.y}) to (${newX}, ${newY})`);

        // Check bounds
        if (newX < 0 || newX >= this.state.gridSize || newY < 0 || newY >= this.state.gridSize) {
            throw new Error("Robot hit the wall! 🧱");
        }

        // Check obstacles
        const hitObstacle = this.state.obstacles.some(obs => obs.x === newX && obs.y === newY);
        if (hitObstacle) {
            throw new Error("Robot hit an obstacle! 🚧");
        }

        // Move robot
        this.state.robot.x = newX;
        this.state.robot.y = newY;

        // Redraw immediately
        this.draw();

        // Add small delay for animation effect if not in step mode
        if (!this.state.stepMode) {
            this.sleep(300);
        }
    }

    // Turn robot right
    turnRight() {
        this.state.robot.direction = (this.state.robot.direction + 1) % 4;
        console.log(`Robot turned right, now facing direction: ${this.state.robot.direction}`);
        this.draw();

        if (!this.state.stepMode) {
            this.sleep(200);
        }
    }

    // Turn robot left
    turnLeft() {
        this.state.robot.direction = (this.state.robot.direction + 3) % 4;
        console.log(`Robot turned left, now facing direction: ${this.state.robot.direction}`);
        this.draw();

        if (!this.state.stepMode) {
            this.sleep(200);
        }
    }

    // Check if robot reached the goal
    checkGoalReached() {
        const { robot, goal } = this.state;
        if (robot.x === goal.x && robot.y === goal.y) {
            this.showFeedback('🎉 Excellent! You solved the puzzle!', 'success');
            return true;
        } else {
            this.showFeedback('Not quite there yet. Try again! 🔄', 'info');
            return false;
        }
    }

    // Draw the game grid and sprites
    draw() {
        const { gridSize, cellSize } = this.state;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Set canvas size based on grid
        this.canvas.width = gridSize * cellSize;
        this.canvas.height = gridSize * cellSize;

        // Draw grid background
        this.ctx.fillStyle = '#f0f8ff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.ctx.strokeStyle = '#d0d0d0';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= gridSize; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * cellSize, 0);
            this.ctx.lineTo(i * cellSize, gridSize * cellSize);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * cellSize);
            this.ctx.lineTo(gridSize * cellSize, i * cellSize);
            this.ctx.stroke();
        }

        // Draw obstacles
        this.state.obstacles.forEach(obstacle => {
            this.drawCell(obstacle.x, obstacle.y, '#8b4513', '🧱');
        });

        // Draw goal
        this.drawCell(this.state.goal.x, this.state.goal.y, '#ffd700', '⭐');

        // Draw robot
        this.drawRobot();
    }

    // Draw a cell with content
    drawCell(x, y, color, emoji = '') {
        const { cellSize } = this.state;
        const pixelX = x * cellSize;
        const pixelY = y * cellSize;

        // Draw background
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX + 2, pixelY + 2, cellSize - 4, cellSize - 4);

        // Draw emoji if provided
        if (emoji) {
            this.ctx.font = `${cellSize * 0.6}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(emoji, pixelX + cellSize/2, pixelY + cellSize/2);
        }
    }

    // Draw the robot with direction indicator
    drawRobot() {
        const { robot, cellSize } = this.state;
        const pixelX = robot.x * cellSize;
        const pixelY = robot.y * cellSize;
        const centerX = pixelX + cellSize/2;
        const centerY = pixelY + cellSize/2;

        // Robot body
        this.ctx.fillStyle = '#4299e1';
        this.ctx.fillRect(pixelX + 5, pixelY + 5, cellSize - 10, cellSize - 10);

        // Robot direction indicator (white dot)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();

        const directionOffsets = [
            { x: 0, y: -12 },  // North
            { x: 12, y: 0 },   // East
            { x: 0, y: 12 },   // South
            { x: -12, y: 0 }   // West
        ];

        const offset = directionOffsets[robot.direction];
        this.ctx.arc(centerX + offset.x, centerY + offset.y, 6, 0, 2 * Math.PI);
        this.ctx.fill();

        // Robot emoji
        this.ctx.fillStyle = '#000';
        this.ctx.font = `${cellSize * 0.5}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🤖', centerX, centerY);
    }

    // Show feedback message
    showFeedback(message, type = 'info') {
        // Try to use the main feedback function if available
        if (typeof showFeedback === 'function') {
            showFeedback(message, type);
        } else {
            console.log(`Feedback [${type}]: ${message}`);
        }
    }

    // Simple sleep function for animation delays
    sleep(ms) {
        const start = Date.now();
        while (Date.now() - start < ms) {
            // Busy wait - not ideal but works for simple animations
        }
    }
}

console.log('GameEngine class defined successfully');