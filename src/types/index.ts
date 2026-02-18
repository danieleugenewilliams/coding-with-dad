// Type definitions for the Kids Coding Adventure app

export interface Robot {
  x: number;
  y: number;
  direction: 0 | 1 | 2 | 3; // 0=North, 1=East, 2=South, 3=West
}

export interface Goal {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  y: number;
}

export interface GameState {
  robot: Robot;
  goal: Goal;
  obstacles: Obstacle[];
  gridSize: number;
  cellSize: number;
  isRunning: boolean;
  currentStep: number;
  program: string[];
  stepMode: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  robot: Robot;
  goal: Goal;
  obstacles: Obstacle[];
  hints: string[];
  maxBlocks?: number;
  requiredBlocks?: string[];
}

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  stars: number;
  attempts: number;
  bestTime?: number;
  hintsUsed: number;
}

export type FeedbackType = 'success' | 'error' | 'info' | 'hint';

export interface Feedback {
  message: string;
  type: FeedbackType;
  timestamp: number;
}

export interface AppState {
  currentLesson: number;
  gameState: GameState;
  showCode: boolean;
  generatedCode: string;
  feedback: Feedback | null;
}