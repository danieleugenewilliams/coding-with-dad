import { GameState, Robot, Goal, Obstacle } from '../types';

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private state: GameState;
  private onStateChange: (state: GameState) => void;
  private onFeedback: (message: string, type: 'success' | 'error' | 'info' | 'hint') => void;

  constructor(
    onStateChange: (state: GameState) => void,
    onFeedback: (message: string, type: 'success' | 'error' | 'info' | 'hint') => void
  ) {
    this.onStateChange = onStateChange;
    this.onFeedback = onFeedback;

    // Initialize game state
    this.state = {
      robot: { x: 1, y: 1, direction: 0 },
      goal: { x: 4, y: 1 },
      obstacles: [],
      gridSize: 8,
      cellSize: 50,
      isRunning: false,
      currentStep: 0,
      program: [],
      stepMode: false
    };

    // Set up global movement functions
    this.setupMovementFunctions();
  }

  public setCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.draw();
  }

  public loadLevel(robot: Robot, goal: Goal, obstacles: Obstacle[] = []) {
    this.state = {
      ...this.state,
      robot: { ...robot },
      goal: { ...goal },
      obstacles: [...obstacles],
      isRunning: false,
      currentStep: 0,
      program: [],
      stepMode: false
    };

    this.onStateChange(this.state);
    this.draw();
  }

  public reset() {
    const { robot, goal, obstacles, gridSize, cellSize } = this.state;
    this.state = {
      robot: { ...robot },
      goal: { ...goal },
      obstacles: [...obstacles],
      gridSize,
      cellSize,
      isRunning: false,
      currentStep: 0,
      program: [],
      stepMode: false
    };

    this.onStateChange(this.state);
    this.draw();
    this.onFeedback('Ready to start!', 'info');
  }

  public executeProgram(code: string) {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.stepMode = false;
    this.onStateChange(this.state);

    try {
      // Reset to initial position
      this.reset();

      // Execute the code
      eval(code);

      // Check if goal reached
      this.checkGoalReached();
    } catch (error) {
      console.error('Program execution error:', error);
      this.onFeedback(`Error: ${(error as Error).message}`, 'error');
    } finally {
      this.state.isRunning = false;
      this.onStateChange(this.state);
    }
  }

  public stepProgram(code: string) {
    if (!this.state.stepMode) {
      // Initialize step mode
      this.state.stepMode = true;
      this.state.currentStep = 0;
      this.state.program = this.parseProgram(code);
      this.reset();
      this.onFeedback('Step mode: Click Step to execute one command at a time', 'info');
      return;
    }

    // Execute next step
    if (this.state.currentStep < this.state.program.length) {
      const command = this.state.program[this.state.currentStep];

      try {
        eval(command);
        this.state.currentStep++;
        this.onStateChange(this.state);
        this.draw();

        if (this.state.currentStep >= this.state.program.length) {
          this.onFeedback('Program complete! Click Reset to try again.', 'success');
          this.checkGoalReached();
        } else {
          this.onFeedback(
            `Step ${this.state.currentStep} of ${this.state.program.length}`,
            'info'
          );
        }
      } catch (error) {
        console.error('Step execution error:', error);
        this.onFeedback(`Error: ${(error as Error).message}`, 'error');
      }
    }
  }

  private setupMovementFunctions() {
    // Make movement functions globally available
    (window as any).moveForward = () => this.moveForward();
    (window as any).turnRight = () => this.turnRight();
    (window as any).turnLeft = () => this.turnLeft();
  }

  private parseProgram(code: string): string[] {
    return code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
  }

  private moveForward() {
    const directions = [
      { x: 0, y: -1 }, // North
      { x: 1, y: 0 },  // East
      { x: 0, y: 1 },  // South
      { x: -1, y: 0 }  // West
    ];

    const dir = directions[this.state.robot.direction];
    const newX = this.state.robot.x + dir.x;
    const newY = this.state.robot.y + dir.y;

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
    this.onStateChange(this.state);
    this.draw();

    // Add delay for animation if not in step mode
    if (!this.state.stepMode) {
      this.sleep(300);
    }
  }

  private turnRight() {
    this.state.robot.direction = ((this.state.robot.direction + 1) % 4) as 0 | 1 | 2 | 3;
    this.onStateChange(this.state);
    this.draw();

    if (!this.state.stepMode) {
      this.sleep(200);
    }
  }

  private turnLeft() {
    this.state.robot.direction = ((this.state.robot.direction + 3) % 4) as 0 | 1 | 2 | 3;
    this.onStateChange(this.state);
    this.draw();

    if (!this.state.stepMode) {
      this.sleep(200);
    }
  }

  private checkGoalReached(): boolean {
    const { robot, goal } = this.state;
    if (robot.x === goal.x && robot.y === goal.y) {
      this.onFeedback('🎉 Excellent! You solved the puzzle!', 'success');
      return true;
    } else {
      this.onFeedback('Not quite there yet. Try again! 🔄', 'info');
      return false;
    }
  }

  private draw() {
    if (!this.canvas || !this.ctx) return;

    const { gridSize, cellSize } = this.state;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set canvas size
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

  private drawCell(x: number, y: number, color: string, emoji = '') {
    if (!this.ctx) return;

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

  private drawRobot() {
    if (!this.ctx) return;

    const { robot, cellSize } = this.state;
    const pixelX = robot.x * cellSize;
    const pixelY = robot.y * cellSize;
    const centerX = pixelX + cellSize/2;
    const centerY = pixelY + cellSize/2;

    // Robot body
    this.ctx.fillStyle = '#4299e1';
    this.ctx.fillRect(pixelX + 5, pixelY + 5, cellSize - 10, cellSize - 10);

    // Robot direction indicator
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

  private sleep(ms: number) {
    const start = Date.now();
    while (Date.now() - start < ms) {
      // Busy wait for animation
    }
  }

  public getState(): GameState {
    return { ...this.state };
  }
}