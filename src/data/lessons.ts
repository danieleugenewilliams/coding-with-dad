import { Lesson } from '../types';

export const lessons: Lesson[] = [
  {
    id: 1,
    title: "First Steps",
    description: "Move the robot to the star!",
    robot: { x: 1, y: 1, direction: 0 },
    goal: { x: 4, y: 1 },
    obstacles: [],
    hints: [
      "Try dragging a 'move forward' block to the workspace",
      "Connect blocks by snapping them together",
      "You need 3 'move forward' blocks to reach the star",
      "Click the 'Run' button to test your solution"
    ],
    maxBlocks: 5,
    requiredBlocks: ['move_forward']
  },
  {
    id: 2,
    title: "Turn and Move",
    description: "Navigate around the wall to reach the star",
    robot: { x: 1, y: 1, direction: 0 },
    goal: { x: 1, y: 4 },
    obstacles: [
      { x: 1, y: 2 },
      { x: 1, y: 3 }
    ],
    hints: [
      "You need to go around the wall blocks",
      "Try: turn right, move forward, turn left, move forward...",
      "Remember to turn back to face the goal",
      "Think about which direction the robot needs to face"
    ],
    maxBlocks: 8,
    requiredBlocks: ['move_forward', 'turn_right', 'turn_left']
  },
  {
    id: 3,
    title: "Use a Loop",
    description: "Use the repeat block to move efficiently",
    robot: { x: 1, y: 1, direction: 0 },
    goal: { x: 6, y: 1 },
    obstacles: [],
    hints: [
      "Instead of 5 separate 'move forward' blocks, try using a repeat block",
      "Put 'move forward' inside the repeat block",
      "Set the repeat number to 5",
      "Loops help you write less code for repetitive actions"
    ],
    maxBlocks: 3,
    requiredBlocks: ['move_forward', 'controls_repeat_ext']
  },
  {
    id: 4,
    title: "Maze Navigator",
    description: "Navigate through the maze to reach the star",
    robot: { x: 1, y: 1, direction: 0 },
    goal: { x: 5, y: 5 },
    obstacles: [
      { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
      { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
      { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }
    ],
    hints: [
      "Plan your path before you start coding",
      "You'll need to make several turns",
      "Try breaking it down: go down, go right, go up",
      "Use loops where you can to make your code shorter"
    ],
    maxBlocks: 15,
    requiredBlocks: ['move_forward', 'turn_right', 'turn_left']
  },
  {
    id: 5,
    title: "Loop Master",
    description: "Use nested loops to create a pattern",
    robot: { x: 1, y: 1, direction: 0 },
    goal: { x: 6, y: 6 },
    obstacles: [],
    hints: [
      "This challenge requires using loops inside other loops",
      "Think about moving in a square pattern",
      "Try: repeat 4 times (move forward 5 times, turn right)",
      "Nested loops are powerful tools for complex patterns"
    ],
    maxBlocks: 6,
    requiredBlocks: ['move_forward', 'turn_right', 'controls_repeat_ext']
  }
];

export const getCurrentLesson = (id: number): Lesson | undefined => {
  return lessons.find(lesson => lesson.id === id);
};

export const getNextLesson = (currentId: number): Lesson | undefined => {
  return lessons.find(lesson => lesson.id === currentId + 1);
};

export const getPreviousLesson = (currentId: number): Lesson | undefined => {
  return lessons.find(lesson => lesson.id === currentId - 1);
};