import React, { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore
import * as Blockly from 'blockly';

import { Header } from './components/Header';
import { InstructionsPanel } from './components/InstructionsPanel';
import { GameCanvas } from './components/GameCanvas';
import { BlocklyWorkspace } from './components/BlocklyWorkspace';
import { GameControls } from './components/GameControls';
import { FeedbackPanel } from './components/FeedbackPanel';
import { CodeViewer } from './components/CodeViewer';

import { GameEngine } from './engine/GameEngine';
import { lessons, getCurrentLesson } from './data/lessons';
import type { GameState, Feedback, Lesson } from './types';

import './App.css';

function App() {
  // State management
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [gameState, setGameState] = useState<GameState>({
    robot: { x: 1, y: 1, direction: 0 },
    goal: { x: 4, y: 1 },
    obstacles: [],
    gridSize: 8,
    cellSize: 50,
    isRunning: false,
    currentStep: 0,
    program: [],
    stepMode: false
  });
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);

  // Refs
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Get current lesson
  const currentLesson = getCurrentLesson(currentLessonId);

  // Initialize game engine
  useEffect(() => {
    if (!gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(
        (newState: GameState) => setGameState(newState),
        (message: string, type: 'success' | 'error' | 'info' | 'hint') => {
          setFeedback({
            message,
            type,
            timestamp: Date.now()
          });
        }
      );
    }
  }, []);

  // Load lesson when current lesson changes
  useEffect(() => {
    if (currentLesson && gameEngineRef.current) {
      gameEngineRef.current.loadLevel(
        currentLesson.robot,
        currentLesson.goal,
        currentLesson.obstacles
      );
    }
  }, [currentLesson]);

  // Auto-clear feedback after 3 seconds for non-error messages
  useEffect(() => {
    if (feedback && feedback.type !== 'error') {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handlers
  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.setCanvas(canvas, ctx);
    }
  }, []);

  const handleWorkspaceReady = useCallback((ws: Blockly.WorkspaceSvg) => {
    setWorkspace(ws);
  }, []);

  const handleCodeChange = useCallback((code: string) => {
    setGeneratedCode(code);
  }, []);

  const handleRun = useCallback(() => {
    if (!generatedCode.trim()) {
      setFeedback({
        message: 'Add some blocks to create your program!',
        type: 'info',
        timestamp: Date.now()
      });
      return;
    }

    if (gameEngineRef.current) {
      gameEngineRef.current.executeProgram(generatedCode);
    }
  }, [generatedCode]);

  const handleStep = useCallback(() => {
    if (!generatedCode.trim()) {
      setFeedback({
        message: 'Add some blocks first!',
        type: 'info',
        timestamp: Date.now()
      });
      return;
    }

    if (gameEngineRef.current) {
      gameEngineRef.current.stepProgram(generatedCode);
    }
  }, [generatedCode]);

  const handleReset = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.reset();
    }
  }, []);

  const handleToggleCode = useCallback(() => {
    setShowCode(!showCode);
  }, [showCode]);

  const handleShowHint = useCallback(() => {
    if (!currentLesson || !currentLesson.hints.length) {
      setFeedback({
        message: 'No hints available for this lesson',
        type: 'info',
        timestamp: Date.now()
      });
      return;
    }

    const randomHint = currentLesson.hints[Math.floor(Math.random() * currentLesson.hints.length)];
    setFeedback({
      message: `💡 Hint: ${randomHint}`,
      type: 'hint',
      timestamp: Date.now()
    });
  }, [currentLesson]);

  const handleClearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const handlePrevLesson = useCallback(() => {
    if (currentLessonId > 1) {
      setCurrentLessonId(currentLessonId - 1);
    }
  }, [currentLessonId]);

  const handleNextLesson = useCallback(() => {
    if (currentLessonId < lessons.length) {
      setCurrentLessonId(currentLessonId + 1);
    }
  }, [currentLessonId]);

  if (!currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
          <p className="text-white">Preparing your coding adventure!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header
        lesson={currentLesson}
        totalLessons={lessons.length}
        showCode={showCode}
        onToggleCode={handleToggleCode}
        onShowHint={handleShowHint}
        onPrevLesson={handlePrevLesson}
        onNextLesson={handleNextLesson}
      />

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 max-w-7xl mx-auto w-full">
        {/* Game Section */}
        <section className="bg-white rounded-xl shadow-xl p-5 flex flex-col gap-5">
          {/* Instructions */}
          <InstructionsPanel lesson={currentLesson} />

          {/* Game Canvas */}
          <GameCanvas gameState={gameState} onCanvasReady={handleCanvasReady} />

          {/* Game Controls */}
          <GameControls
            isRunning={gameState.isRunning}
            onRun={handleRun}
            onStep={handleStep}
            onReset={handleReset}
          />

          {/* Feedback Panel */}
          <FeedbackPanel feedback={feedback} onClear={handleClearFeedback} />
        </section>

        {/* Code Section */}
        <section className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
          {/* Blockly Workspace */}
          <BlocklyWorkspace
            onCodeChange={handleCodeChange}
            onWorkspaceReady={handleWorkspaceReady}
          />

          {/* Code Viewer */}
          <CodeViewer
            code={generatedCode}
            isVisible={showCode}
            onHide={() => setShowCode(false)}
          />
        </section>
      </main>
    </div>
  );
}

export default App;