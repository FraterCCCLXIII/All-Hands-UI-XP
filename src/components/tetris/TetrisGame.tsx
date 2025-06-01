import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

interface TetrisGameProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
}

interface Tetromino {
  shape: number[][];
  color: string;
}

interface Tetrominos {
  [key: string]: Tetromino;
}

export const TetrisGame: React.FC<TetrisGameProps> = ({ theme, getThemeClasses }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);

  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30;
  const [board, setBoard] = useState<(string | number)[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );

  const TETROMINOS: Tetrominos = {
    'I': { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#00FFFF' },
    'J': { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#0000FF' },
    'L': { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#FFA500' },
    'O': { shape: [[1, 1], [1, 1]], color: '#FFFF00' },
    'S': { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#00FF00' },
    'T': { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#800080' },
    'Z': { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#FF0000' }
  };

  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [pieceX, setPieceX] = useState(0);
  const [pieceY, setPieceY] = useState(0);
  const [dropTime, setDropTime] = useState(1000);
  const dropIntervalRef = useRef<number | null>(null);

  const getRandomPiece = useCallback((): Tetromino => {
    const keys = Object.keys(TETROMINOS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return JSON.parse(JSON.stringify(TETROMINOS[randomKey]));
  }, []);

  const drawBlock = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = getThemeClasses('border');
    ctx.lineWidth = 1;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }, [getThemeClasses]);

  const drawBoard = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] !== 0) {
          const color = typeof board[row][col] === 'number' ? '#' + board[row][col].toString(16).padStart(6, '0') : board[row][col];
          drawBlock(ctx, col, row, color as string);
        }
      }
    }
  }, [board, drawBlock]);

  const drawPiece = useCallback((ctx: CanvasRenderingContext2D, piece: Tetromino | null, offsetX: number, offsetY: number) => {
    if (!piece || !piece.shape) return;
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          drawBlock(ctx, pieceX + col + offsetX, pieceY + row + offsetY, piece.color);
        }
      }
    }
  }, [pieceX, pieceY, drawBlock]);

  const checkCollision = useCallback((newX: number, newY: number, newPieceShape: number[][]) => {
    if (!newPieceShape) return true;

    for (let row = 0; row < newPieceShape.length; row++) {
      for (let col = 0; col < newPieceShape[row].length; col++) {
        if (newPieceShape[row][col] === 1) {
          const boardX = newX + col;
          const boardY = newY + row;

          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
            return true;
          }
          if (boardY >= 0 && board[boardY] && board[boardY][boardX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, [board]);

  const mergePieceToBoard = useCallback(() => {
    if (!currentPiece) return;
    
    const newBoard = [...board];
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col] === 1) {
          const boardX = pieceX + col;
          const boardY = pieceY + row;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
    setBoard(newBoard);
  }, [board, currentPiece, pieceX, pieceY]);

  const clearLines = useCallback(() => {
    let linesCleared = 0;
    const newBoard = [...board];
    
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row].every(cell => cell !== 0)) {
        linesCleared++;
        newBoard.splice(row, 1);
        newBoard.unshift(Array(COLS).fill(0));
        row++;
      }
    }

    if (linesCleared > 0) {
      setBoard(newBoard);
      setScore(prevScore => prevScore + linesCleared * 100 * level);
      if (linesCleared > 0 && linesCleared % 5 === 0) {
        setLevel(prevLevel => prevLevel + 1);
        setDropTime(prevTime => Math.max(50, prevTime * 0.8));
      }
    }
  }, [board, level]);

  const newPiece = useCallback(() => {
    const next = nextPiece || getRandomPiece();
    setNextPiece(getRandomPiece());
    setCurrentPiece(next);
    setPieceX(Math.floor(COLS / 2) - Math.floor(next.shape[0].length / 2));
    setPieceY(-next.shape.length);

    if (checkCollision(Math.floor(COLS / 2) - Math.floor(next.shape[0].length / 2), -next.shape.length, next.shape)) {
      setGameOver(true);
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
    }
  }, [nextPiece, getRandomPiece, checkCollision]);

  const dropPiece = useCallback(() => {
    if (gameOver || !gameStarted || isPaused || !currentPiece) return;

    if (!checkCollision(pieceX, pieceY + 1, currentPiece.shape)) {
      setPieceY(prev => prev + 1);
    } else {
      mergePieceToBoard();
      clearLines();
      newPiece();
    }
    drawGame();
  }, [gameOver, gameStarted, isPaused, currentPiece, pieceX, pieceY, checkCollision, mergePieceToBoard, clearLines, newPiece]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || !gameStarted || isPaused) return;

    const rotatedShape = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    );

    const kicks = [
      [0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    for (const [offsetX, offsetY] of kicks) {
      if (!checkCollision(pieceX + offsetX, pieceY + offsetY, rotatedShape)) {
        setCurrentPiece(prev => prev ? { ...prev, shape: rotatedShape } : null);
        setPieceX(prev => prev + offsetX);
        setPieceY(prev => prev + offsetY);
        drawGame();
        return;
      }
    }
  }, [currentPiece, gameOver, gameStarted, isPaused, pieceX, pieceY, checkCollision]);

  const movePiece = useCallback((deltaX: number) => {
    if (!currentPiece || gameOver || !gameStarted || isPaused) return;
    if (!checkCollision(pieceX + deltaX, pieceY, currentPiece.shape)) {
      setPieceX(prev => prev + deltaX);
      drawGame();
    }
  }, [currentPiece, gameOver, gameStarted, isPaused, pieceX, pieceY, checkCollision]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || !gameStarted || isPaused) return;
    let newY = pieceY;
    while (!checkCollision(pieceX, newY + 1, currentPiece.shape)) {
      newY++;
    }
    setPieceY(newY);
    mergePieceToBoard();
    clearLines();
    newPiece();
    drawGame();
  }, [currentPiece, gameOver, gameStarted, isPaused, pieceX, pieceY, checkCollision, mergePieceToBoard, clearLines, newPiece]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBoard(ctx);
    if (currentPiece) {
      drawPiece(ctx, currentPiece, 0, 0);
    }
  }, [drawBoard, drawPiece, currentPiece]);

  const startGame = useCallback(() => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setScore(0);
    setLevel(1);
    setDropTime(1000);
    setGameOver(false);
    setGameStarted(true);
    setIsPaused(false);
    setNextPiece(getRandomPiece());
    newPiece();

    if (dropIntervalRef.current) {
      clearInterval(dropIntervalRef.current);
    }
    dropIntervalRef.current = window.setInterval(dropPiece, dropTime);
  }, [getRandomPiece, newPiece, dropPiece]);

  const togglePause = useCallback(() => {
    if (!gameStarted || gameOver) return;
    setIsPaused(prev => !prev);
    if (isPaused) {
      dropIntervalRef.current = window.setInterval(dropPiece, dropTime);
    } else if (dropIntervalRef.current) {
      clearInterval(dropIntervalRef.current);
    }
  }, [gameStarted, gameOver, isPaused, dropPiece, dropTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1);
          break;
        case 'ArrowRight':
          movePiece(1);
          break;
        case 'ArrowDown':
          dropPiece();
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, movePiece, dropPiece, rotatePiece, hardDrop, togglePause]);

  useEffect(() => {
    if (gameStarted && !isPaused && !gameOver) {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
      dropIntervalRef.current = window.setInterval(dropPiece, dropTime);
    }
    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
    };
  }, [gameStarted, isPaused, gameOver, dropPiece, dropTime]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center justify-between w-full max-w-md">
        <div className="flex items-center space-x-4">
          <div className="text-lg font-semibold">Score: {score}</div>
          <div className="text-lg font-semibold">Level: {level}</div>
        </div>
        <div className="flex items-center space-x-2">
          {!gameStarted ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startGame}
              className={`p-2 rounded-full ${getThemeClasses('button-bg')} ${getThemeClasses('button-hover')}`}
            >
              <PlayCircle className="w-6 h-6" />
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePause}
                className={`p-2 rounded-full ${getThemeClasses('button-bg')} ${getThemeClasses('button-hover')}`}
              >
                {isPaused ? <PlayCircle className="w-6 h-6" /> : <PauseCircle className="w-6 h-6" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={startGame}
                className={`p-2 rounded-full ${getThemeClasses('button-bg')} ${getThemeClasses('button-hover')}`}
              >
                <RotateCcw className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
          className={`border ${getThemeClasses('border')} rounded-lg`}
        />
        {!gameStarted && !gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg"
          >
            <Gamepad2 className="w-16 h-16 mb-4 text-white" />
            <button
              onClick={startGame}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Game
            </button>
          </motion.div>
        )}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg"
          >
            <div className="text-2xl font-bold text-white mb-4">Game Over!</div>
            <div className="text-xl text-white mb-4">Score: {score}</div>
            <button
              onClick={startGame}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        )}
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg"
          >
            <div className="text-2xl font-bold text-white">Paused</div>
          </motion.div>
        )}
      </div>

      <div className="w-full max-w-md">
        <div className="text-sm text-gray-500 mb-2">Controls:</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>← → : Move</div>
          <div>↑ : Rotate</div>
          <div>↓ : Soft Drop</div>
          <div>Space : Hard Drop</div>
          <div>P : Pause</div>
        </div>
      </div>

      {nextPiece && (
        <div className="w-full max-w-md">
          <div className="text-sm text-gray-500 mb-2">Next Piece:</div>
          <div className="relative w-24 h-24 border rounded-lg overflow-hidden"
            style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
            <canvas
              width={4 * BLOCK_SIZE}
              height={4 * BLOCK_SIZE}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              ref={nextPieceCanvas => {
                if (nextPieceCanvas) {
                  const ctx = nextPieceCanvas.getContext('2d');
                  if (ctx) {
                    ctx.clearRect(0, 0, 4 * BLOCK_SIZE, 4 * BLOCK_SIZE);
                    for (let row = 0; row < nextPiece.shape.length; row++) {
                      for (let col = 0; col < nextPiece.shape[row].length; col++) {
                        if (nextPiece.shape[row][col] === 1) {
                          drawBlock(ctx, col + 0.5, row + 0.5, nextPiece.color);
                        }
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 