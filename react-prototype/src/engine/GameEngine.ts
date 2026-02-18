import type { GameState, Robot, Goal, Obstacle } from '../types';

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private state: GameState;
  private initialRobot: Robot;
  private initialGoal: Goal;
  private initialObstacles: Obstacle[];
  private commandQueue: string[];
  private recording: boolean;
  private onStateChange: (state: GameState) => void;
  private onFeedback: (message: string, type: 'success' | 'error' | 'info' | 'hint') => void;

  constructor(
    onStateChange: (state: GameState) => void,
    onFeedback: (message: string, type: 'success' | 'error' | 'info' | 'hint') => void
  ) {
    this.onStateChange = onStateChange;
    this.onFeedback = onFeedback;

    // Store initial positions for reset
    this.initialRobot = { x: 1, y: 1, direction: 0 };
    this.initialGoal = { x: 4, y: 1 };
    this.initialObstacles = [];
    this.commandQueue = [];
    this.recording = false;

    // Initialize game state
    this.state = {
      robot: { ...this.initialRobot },
      goal: { ...this.initialGoal },
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
    // Store initial positions for reset
    this.initialRobot = { ...robot };
    this.initialGoal = { ...goal };
    this.initialObstacles = obstacles.map(o => ({ ...o }));

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
    this.state = {
      robot: { ...this.initialRobot },
      goal: { ...this.initialGoal },
      obstacles: this.initialObstacles.map(o => ({ ...o })),
      gridSize: this.state.gridSize,
      cellSize: this.state.cellSize,
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
      // Initialize step mode: run the program in recording mode to capture commands
      this.reset();

      this.commandQueue = [];
      this.recording = true;
      try {
        eval(code);
      } catch (error) {
        this.recording = false;
        this.onFeedback(`Error: ${(error as Error).message}`, 'error');
        return;
      }
      this.recording = false;

      // Reset robot back to start after recording
      this.state.robot = { ...this.initialRobot };
      this.state.stepMode = true;
      this.state.currentStep = 0;
      this.state.program = [...this.commandQueue];
      this.onStateChange(this.state);
      this.draw();

      this.onFeedback(
        `Step mode: ${this.state.program.length} commands. Click Step to execute one at a time.`,
        'info'
      );
      return;
    }

    // Execute next step
    if (this.state.currentStep < this.state.program.length) {
      const command = this.state.program[this.state.currentStep];

      try {
        this.executeCommand(command);
        this.state.currentStep++;
        this.onStateChange(this.state);
        this.draw();

        if (this.state.currentStep >= this.state.program.length) {
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

  private executeCommand(command: string) {
    switch (command) {
      case 'moveForward': this.moveForward(); break;
      case 'turnRight': this.turnRight(); break;
      case 'turnLeft': this.turnLeft(); break;
    }
  }

  private setupMovementFunctions() {
    // Make movement functions globally available
    (window as any).moveForward = () => this.moveForward();
    (window as any).turnRight = () => this.turnRight();
    (window as any).turnLeft = () => this.turnLeft();
  }

  private moveForward() {
    if (this.recording) {
      this.commandQueue.push('moveForward');
      // Still simulate the move to validate the program (e.g. detect wall hits)
    }

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

    if (!this.recording) {
      this.onStateChange(this.state);
      this.draw();

      // Add delay for animation if not in step mode
      if (!this.state.stepMode) {
        this.sleep(300);
      }
    }
  }

  private turnRight() {
    if (this.recording) {
      this.commandQueue.push('turnRight');
    }

    this.state.robot.direction = ((this.state.robot.direction + 1) % 4) as 0 | 1 | 2 | 3;

    if (!this.recording) {
      this.onStateChange(this.state);
      this.draw();

      if (!this.state.stepMode) {
        this.sleep(200);
      }
    }
  }

  private turnLeft() {
    if (this.recording) {
      this.commandQueue.push('turnLeft');
    }

    this.state.robot.direction = ((this.state.robot.direction + 3) % 4) as 0 | 1 | 2 | 3;

    if (!this.recording) {
      this.onStateChange(this.state);
      this.draw();

      if (!this.state.stepMode) {
        this.sleep(200);
      }
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