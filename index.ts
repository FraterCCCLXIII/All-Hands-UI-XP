import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle, Menu, Search, Eye, Code, Share2, X,
  GitBranch, GitCommit, GitPullRequest, CircleX, Send,
  Sun, Moon, Palette, ArrowUpToLine, CircleStop, Paperclip, ThumbsUp, ThumbsDown, Copy, Github,
  ChevronUp, ChevronDown, FileText, GitFork, Globe, Bug, AlertCircle, Package, FlaskConical, BookOpen, Lock, Activity, Terminal, CheckCircle, ChevronRight, Wallet, PlayCircle, PauseCircle, Settings, MoreHorizontal, LifeBuoy, Users, PanelRightClose, PanelRightOpen,
  Gamepad2 // Arcade icon for Tetris
} from 'lucide-react';

// Custom Spinner Component (now white by default, can be customized)
const Spinner = ({ className, color = 'border-t-white' }) => (
  <div className={`animate-spin rounded-full border-2 border-solid border-transparent ${color} ${className}`}></div>
);

// Status Indicator Component
const StatusIndicator = ({ status, hoverText }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  const renderIndicator = () => {
    switch (status) {
      case 'active':
        return <div className="w-3 h-3 rounded-full bg-green-400"></div>;
      case 'thinking':
        return <Spinner className="w-3 h-3" color="border-t-blue-400" />; // Blue spinner for thinking
      case 'error':
        return (
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div className="absolute w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <AlertCircle className="w-4 h-4 text-white z-10" />
          </div>
        );
      case 'stopped':
        return <div className="w-3 h-3 rounded-full bg-red-500"></div>;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400"></div>;
    }
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      ref={tooltipRef}
    >
      {renderIndicator()}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-md shadow-lg bg-stone-700 text-white text-xs whitespace-nowrap z-30"
          >
            {hoverText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Tetris Game Component
const TetrisGame = ({ theme, getThemeClasses }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);

  const COLS = 10;
  const ROWS = 15; // Made shorter height
  const BLOCK_SIZE = 20;
  let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); // 0 for empty

  const TETROMINOS = {
    'I': { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#00FFFF' }, // Cyan
    'J': { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#0000FF' }, // Blue
    'L': { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#FFA500' }, // Orange
    'O': { shape: [[1, 1], [1, 1]], color: '#FFFF00' }, // Yellow
    'S': { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#00FF00' }, // Green
    'T': { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#800080' }, // Purple
    'Z': { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#FF0000' }  // Red
  };

  let currentPiece = null;
  let nextPiece = null;
  let pieceX = 0;
  let pieceY = 0;
  let dropInterval = null;
  let dropTime = 1000; // Milliseconds per row drop

  const getRandomPiece = () => {
    const keys = Object.keys(TETROMINOS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return JSON.parse(JSON.stringify(TETROMINOS[randomKey])); // Deep copy
  };

  const drawBlock = (ctx, x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = getThemeClasses('border'); // Use theme border for block outline
    ctx.lineWidth = 1;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  };

  const drawBoard = (ctx) => {
    ctx.clearRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] !== 0) {
          drawBlock(ctx, col, row, board[row][col]);
        }
      }
    }
  };

  const drawPiece = (ctx, piece, offsetX, offsetY) => {
    if (!piece || !piece.shape) return;
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          drawBlock(ctx, pieceX + col + offsetX, pieceY + row + offsetY, piece.color);
        }
      }
    }
  };

  const checkCollision = (newX, newY, newPieceShape) => {
    if (!newPieceShape) return true; // Should not happen, but a safeguard

    for (let row = 0; row < newPieceShape.length; row++) {
      for (let col = 0; col < newPieceShape[row].length; col++) {
        if (newPieceShape[row][col] === 1) {
          const boardX = newX + col;
          const boardY = newY + row;

          // Check boundaries
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
            return true;
          }
          // Check collision with existing blocks on the board (if not out of bounds top)
          if (boardY >= 0 && board[boardY] && board[boardY][boardX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePieceToBoard = () => {
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col] === 1) {
          const boardX = pieceX + col;
          const boardY = pieceY + row;
          if (boardY >= 0) { // Only merge if within board bounds
            board[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
  };

  const clearLines = () => {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row].every(cell => cell !== 0)) {
        linesCleared++;
        board.splice(row, 1); // Remove the full row
        board.unshift(Array(COLS).fill(0)); // Add a new empty row at the top
        row++; // Re-check the new row at the same index
      }
    }
    if (linesCleared > 0) {
      setScore(prevScore => prevScore + linesCleared * 100 * level);
      if (linesCleared > 0 && linesCleared % 5 === 0) { // Increase level every 5 lines
        setLevel(prevLevel => prevLevel + 1);
        dropTime = Math.max(50, dropTime * 0.8); // Make it faster
        clearInterval(dropInterval);
        dropInterval = setInterval(dropPiece, dropTime);
      }
    }
  };

  const newPiece = useCallback(() => {
    currentPiece = nextPiece || getRandomPiece();
    nextPiece = getRandomPiece();
    pieceX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    pieceY = -currentPiece.shape.length; // Start above the board

    if (checkCollision(pieceX, pieceY, currentPiece.shape)) {
      setGameOver(true);
      clearInterval(dropInterval);
    }
  }, [TETROMINOS]); // Dependency on TETROMINOS is fine as it's constant

  const dropPiece = useCallback(() => {
    if (gameOver || !gameStarted) return;

    if (!checkCollision(pieceX, pieceY + 1, currentPiece.shape)) {
      pieceY++;
    } else {
      mergePieceToBoard();
      clearLines();
      newPiece();
    }
    drawGame();
  }, [gameOver, gameStarted, newPiece]); // Added newPiece to dependencies

  const rotatePiece = () => {
    const originalShape = currentPiece.shape;
    const rotatedShape = originalShape[0].map((_, index) =>
      originalShape.map(row => row[index]).reverse()
    );

    // Wall kick/floor kick logic
    const kicks = [
      [0, 0], // No kick
      [-1, 0], // Kick left
      [1, 0],  // Kick right
      [0, -1], // Kick up (for I piece)
      [0, 1]   // Kick down
    ];

    for (let i = 0; i < kicks.length; i++) {
      const [offsetX, offsetY] = kicks[i];
      if (!checkCollision(pieceX + offsetX, pieceY + offsetY, rotatedShape)) {
        currentPiece.shape = rotatedShape;
        pieceX += offsetX;
        pieceY += offsetY;
        drawGame();
        return;
      }
    }
  };

  const movePiece = (deltaX) => {
    if (gameOver || !gameStarted) return;
    if (!checkCollision(pieceX + deltaX, pieceY, currentPiece.shape)) {
      pieceX += deltaX;
      drawGame();
    }
  };

  const hardDrop = () => {
    if (gameOver || !gameStarted) return;
    while (!checkCollision(pieceX, pieceY + 1, currentPiece.shape)) {
      pieceY++;
    }
    mergePieceToBoard();
    clearLines();
    newPiece();
    drawGame();
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawBoard(ctx);
    if (currentPiece) {
      drawPiece(ctx, currentPiece, 0, 0);
    }
  };

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setLevel(1);
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPiece = null;
    nextPiece = null;
    dropTime = 1000;

    newPiece(); // Initialize first piece
    nextPiece = getRandomPiece(); // Initialize next piece

    if (dropInterval) clearInterval(dropInterval);
    dropInterval = setInterval(dropPiece, dropTime);
    drawGame();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || !gameStarted) return;
      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1);
          break;
        case 'ArrowRight':
          movePiece(1);
          break;
        case 'ArrowDown':
          dropPiece(); // Soft drop
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ': // Spacebar for hard drop
          e.preventDefault(); // Prevent page scrolling
          hardDrop();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (dropInterval) clearInterval(dropInterval);
    };
  }, [gameOver, gameStarted, dropPiece]); // Dependencies for useEffect

  useEffect(() => {
    drawGame(); // Redraw when theme changes
  }, [theme]);

  // Initial setup for canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = COLS * BLOCK_SIZE;
      canvas.height = ROWS * BLOCK_SIZE;
    }
  }, []);


  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl ${getThemeClasses('bg')} ${getThemeClasses('text')} text-center`}> {/* Changed to getThemeClasses('bg') */}
      <canvas
        ref={canvasRef}
        className={`border-2 ${getThemeClasses('border')} rounded-md`}
        style={{ backgroundColor: 'transparent' }} // Made canvas background transparent
      ></canvas>
      <div className="mt-4 flex justify-between w-full max-w-[200px] text-lg font-medium">
        <span>Score: {score}</span>
        <span>Level: {level}</span>
      </div>
      {gameOver && (
        <div className="mt-4 text-red-500 font-bold text-2xl">GAME OVER!</div>
      )}
      {!gameStarted ? (
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className={`mt-4 px-6 py-2 rounded-full ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-90`}
          onClick={startGame}
        >
          Start Game
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className={`mt-4 px-6 py-2 rounded-full ${getThemeClasses('stop-button-bg')} ${getThemeClasses('stop-button-text')} hover:opacity-90`}
          onClick={() => { clearInterval(dropInterval); setGameStarted(false); }}
        >
          Stop Game
        </motion.button>
      )}
      <p className="text-xs opacity-70 mt-2">Use Arrow Keys to move/rotate, Space to hard drop.</p>
    </div>
  );
};


// Main App component
function App() {
  const [code, setCode] = useState(`// Your code goes here
// Example: console.log("Hello, Canvas!");
// This is a simulated code editor.
`);
  const [consoleOutput, setConsoleOutput] = useState(`[11:05:42 PM] [CONSOLE ERROR] Error: Minified React error #312; visit https://reactjs.org/docs/error-decoder.html?`);
  const [activeTab, setActiveTab] = useState('Code'); // 'Code' or 'Preview'
  const [currentCanvasView, setCurrentCanvasView] = useState('code_view'); // 'code_view', 'preview_view', 'file_structure_view', 'changes_view', 'browser_view'

  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', text: "I've identified the source of the 'white screen' error on the Homes tab, which was caused by a React rendering issue (Error #31). The problem stemmed from how the bedrooms and bathrooms options were being processed in the optionDefinitionsHome array.", type: 'error', status: 'fail', headerText: 'Error' },
    { role: 'ai', text: "def parse_user_input(input_str):\n    # This is unsafe as it allows arbitrary code execution\n    return eval(input_str)  # Unsafe!\n\n# Suggested fix:\ndef parse_user_input_safe(input_str):\n    import json\n    try:\n        # Use json.loads instead of eval for safe parsing\n        return json.loads(input_str)\n    except json.JSONDecodeError:\n        return None", type: 'code', status: 'completed', headerText: 'Code' },
    { role: "ai", text: "I've fixed this by directly referencing the homeOptions.bedrooms and homeoptions.bathrooms arrays as the values for the select inputs, as they are already correctly structured. This ensures that valid data types are being rendered, resolving the React error and allowing the Homes tab to display correctly.", type: 'code', status: 'success', headerText: 'Code' },
    { role: 'ai', text: "Here's the updated code:", type: 'code', status: 'completed', headerText: 'Code' },
    { role: 'ai', text: "Analyzing your codebase...", type: 'bug', status: 'in_progress', headerText: 'Bug researching' },
    { role: 'ai', text: "Authentication failed. Check your API key or login. Re-authenticate", type: 'llm_error', status: 'fail', actions: [{ label: 'Re-authenticate', action: 'reauthenticate_llm' }], headerText: 'Error' },
    { role: 'ai', text: "This function has a security flaw. Fix it?", type: 'security', status: 'action_required', actions: [{ label: 'Apply Fix', action: 'apply_security_fix' }, { label: 'Ignore', action: 'ignore_security_fix' }], headerText: 'Security' },
    { role: 'ai', text: "Build failed: missing dependency `pandas`. Install and rebuild", type: 'build', status: 'fail', actions: [{ label: 'Install and rebuild', action: 'install_rebuild' }], headerText: 'Build' },
    { role: 'ai', text: "Merge conflict in `src/app.js`. Resolve manually or use: git checkout --theirs src/app.js", type: 'git', status: 'action_required', actions: [{ label: 'Use command', action: 'use_git_command' }, { label: 'Open file', action: 'open_git_file' }], headerText: 'Git' },
    { role: 'ai', text: "Checking for similar bugs in Stack Overflow...", type: 'bug', status: 'in_progress', headerText: 'Bug researching' },
    { role: 'ai', text: "Vulnerability found in `axios@0.21.1`. Upgrade?", type: 'dependency', status: 'action_required', actions: [{ label: 'Upgrade', action: 'upgrade_dependency' }, { label: 'Skip', action: 'skip_dependency' }], headerText: 'Dependency' },
    { role: 'ai', text: "Test `testLogin` fails due to expired mock token. Regenerate?", type: 'test', status: 'action_required', actions: [{ label: 'Regenerate', action: 'regenerate_token' }], headerText: 'Test' },
    { role: 'ai', text: "Missing docstring for `calculateTax()`. Add this?", type: 'docs', status: 'action_required', actions: [{ label: 'Insert', action: 'insert_docstring' }, { label: 'Edit manually', action: 'edit_docstring' }], headerText: 'Docs' },
    { role: 'ai', text: "Hardcoded secret detected. Move to environment variables?", type: 'security', status: 'action_required', actions: [{ label: 'Move to env', action: 'move_to_env' }], headerText: 'Security' },
    { role: 'ai', text: "Database query takes 2s. Add indexing?", type: 'performance', status: 'action_required', actions: [{ label: 'Add indexing', action: 'add_indexing' }], headerText: 'Performance' },
    { role: 'ai', text: "Service temporarily down. Retry in 5 minutes.", type: 'llm_error', status: 'fail', actions: [{ label: 'Check status', action: 'check_llm_status' }], headerText: 'Error' },
    { role: 'ai', text: "Microagent ready", type: 'microagent_ready', status: 'success', headerText: 'Microagent ready' },
    { role: 'ai', text: "I'll help you run the app. First, let's explore the repository to understand what kind of app it is and how to run it. Read ai-feed-notifications/", type: 'microagent_ready', status: 'in_progress', headerText: 'System thinking' },
    { role: 'ai', text: "Let's check the README.md to understand what this app is about and how to run it: Read README.md", type: 'microagent_ready', status: 'in_progress', headerText: 'System thinking' },
    { role: 'ai', text: "Now let's check the package.json to understand the dependencies and scripts: Read package.json", type: 'microagent_ready', status: 'in_progress', headerText: 'System thinking' },
    { role: 'ai', text: "Let's check the vite.config.ts file to see if we need to make any modifications for the server configuration: Read vite.config.ts", type: 'microagent_ready', status: 'in_progress', headerText: 'System thinking' },
    { role: 'ai', text: "I need to update the vite.config.ts file to use the correct port and allowed hosts for our environment: Edited vite.config.ts", type: 'code', status: 'success', headerText: 'Code' },
    { role: 'ai', text: "Now let's also update the preview configuration: Edited vite.config.ts", type: 'code', status: 'success', headerText: 'Code' },
    { role: 'ai', text: "Now let's navigate to the project directory and install the dependencies: Ran cd /workspace/ai-feed-notifications && npm install", type: 'build', status: 'in_progress', headerText: 'Build' },
    { role: 'ai', text: "Output: added 215 packages, and audited 216 packages in 4s 53 packages are looking for funding run `npm fund` for details found 0 vulnerabilities npm notice npm notice New major version of npm available! 10.9.2 -> 11.4.1 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.1 npm notice To update run: npm install -g npm@11.4.1 npm notice", type: 'build', status: 'success', headerText: 'Build' },
    { role: 'ai', text: "", type: 'tetris_game', status: 'completed', headerText: 'Arcade' } // Tetris game message
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [theme, setTheme] = useState('dark'); // 'dark', 'light', 'sepia'
  const [serverStatus, setServerStatus] = useState('active'); // 'active', 'thinking', 'error', 'stopped'
  const [statusHoverText, setStatusHoverText] = useState('Server is active.'); // Text for the status indicator tooltip
  const [showSettingsMenu, setShowSettingsMenu] = useState(false); // State to control settings menu visibility
  // Renamed from settingsMenuRef to settingsHoverAreaRef to better reflect its purpose
  const settingsHoverAreaRef = useRef(null); // Ref for the combined hover area (user profile + menu)
  const [showErrorPill, setShowErrorPoll] = useState(false); // State to control error pill visibility - HIDDEN BY DEFAULT
  const [isLoading, setIsLoading] = useState(true); // New state for loading message thread content
  const [showCanvasErrorModal, setShowCanvasErrorModal] = useState(true); // New state for canvas error modal
  const [expandedMessageData, setExpandedMessageData] = useState(null); // Stores {text: string, type: string}
  const [isLeftNavExpanded, setIsLeftNavExpanded] = useState(false); // State for left nav expansion

  // State for adjustable column width (message column)
  const minMessageColumnWidth = 250; // Minimum width in pixels for the message column
  const maxMessageColumnWidth = 760; // Maximum width in pixels for the message column (Updated)
  const [messageColumnWidth, setMessageColumnWidth] = useState(minMessageColumnWidth); // Initial width for AI message column
  const [isResizing, setIsResizing] = useState(false); // State to track if message column resizing is active

  // State for console height resizing
  const [isConsoleVisible, setIsConsoleVisible] = useState(true); // State to control console visibility
  const [consoleHeight, setConsoleHeight] = useState(96); // Initial height for console (h-24 = 96px)
  const [isConsoleResizing, setIsConsoleResizing] = useState(false); // State to track if console resizing is active
  const minConsoleHeight = 50; // Minimum height for console
  const maxConsoleHeight = 300; // Maximum height for console
  const initialConsoleY = useRef(0); // To store initial mouse Y position for console resizing
  const initialConsoleHeight = useRef(0); // To store initial console height for console resizing

  // Ref for the main container to calculate positions
  const containerRef = useRef(null);

  // Credit counter state
  const [credits, setCredits] = useState(1000);
  const [showCreditDropdown, setShowCreditDropdown] = useState(false);
  const creditDropdownRef = useRef(null);

  // New state for controlling canvas visibility and intro card
  const [isCanvasActive, setIsCanvasActive] = useState(false);
  const [showIntroCard, setShowIntroCard] = useState(true);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  const [showServerControlDropdown, setShowServerControlDropdown] = useState(false);
  const serverControlDropdownRef = useRef(null);

  // Project title rename state
  const [projectTitle, setProjectTitle] = useState('My Awesome Project');
  const [isEditingProjectTitle, setIsEditingProjectTitle] = useState(false);
  const projectTitleInputRef = useRef(null);

  // Repo and Branch dropdown states
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const repoDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);

  // Intro card dropdown states
  const [showIntroRepoDropdown, setShowIntroRepoDropdown] = useState(false);
  const [showIntroBranchDropdown, setShowIntroBranchDropdown] = useState(false);
  const introRepoDropdownRef = useRef(null);
  const introBranchDropdownRef = useRef(null);

  // Dynamic minimum message column width based on screen size
  const [dynamicMinMessageColumnWidth, setDynamicMinMessageColumnWidth] = useState(minMessageColumnWidth);

  // Loading overlay state
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  useEffect(() => {
    // Simulate initial loading for the overlay
    const loadingOverlayTimer = setTimeout(() => {
      setShowLoadingOverlay(false);
    }, 2000); // 2 seconds for loading overlay

    // Simulate loading time for the message thread after overlay fades
    const messageLoadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds total, after overlay

    return () => {
      clearTimeout(loadingOverlayTimer);
      clearTimeout(messageLoadingTimer);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // Tailwind's 'lg' breakpoint
        setDynamicMinMessageColumnWidth(minMessageColumnWidth * 2);
      } else {
        setDynamicMinMessageColumnWidth(minMessageColumnWidth);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array means this runs once on mount


  // Simulate server status changes for demonstration
  useEffect(() => {
    let intervalId;
    let errorTimeoutId;

    if (serverStatus === 'active') {
      intervalId = setInterval(() => {
        const rand = Math.random();
        if (rand < 0.2) { // 20% chance to go into thinking state
          setServerStatus('thinking');
          setStatusHoverText('Server is thinking...');
          setTimeout(() => {
            setServerStatus('active');
            setStatusHoverText('Server is active.');
          }, 3000); // Think for 3 seconds
        } else if (rand < 0.05) { // 5% chance to go into error state
          setServerStatus('error');
          setStatusHoverText('Server error detected!');
          errorTimeoutId = setTimeout(() => {
            setServerStatus('active');
            setStatusHoverText('Server is active.');
          }, 5000); // Error for 5 seconds
        }
      }, 10000); // Check every 10 seconds
    } else {
      clearInterval(intervalId);
      clearTimeout(errorTimeoutId);
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(errorTimeoutId);
    };
  }, [serverStatus]);

  // Message type to icon mapping
  const messageTypeIcons = {
    error: AlertCircle,
    code: Code,
    build: Terminal,
    git: GitBranch,
    bug: Bug,
    dependency: Package,
    test: FlaskConical,
    docs: BookOpen,
    security: Lock,
    performance: Activity,
    llm_error: AlertCircle,
    microagent_ready: Terminal,
    action_required: AlertCircle,
    in_progress: Activity,
    completed: Code,
    success: CheckCircle,
    fail: CircleX,
    user: null,
    tetris_game: Gamepad2,
  };

  // Message type to color mapping (Tailwind classes)
  const messageTypeColors = {
    error: { text: 'text-red-500', border: 'border-red-500', bg_subtle: 'bg-red-500/20' },
    llm_error: { text: 'text-red-500', border: 'border-red-500', bg_subtle: 'bg-red-500/20' },
    code: { text: 'text-blue-400', border: 'border-blue-400', bg_subtle: 'bg-blue-400/20' },
    build: { text: 'text-purple-400', border: 'border-purple-400', bg_subtle: 'bg-purple-400/20' },
    git: { text: 'text-green-400', border: 'border-green-400', bg_subtle: 'bg-green-400/20' },
    bug: { text: 'text-orange-400', border: 'border-orange-400', bg_subtle: 'bg-orange-400/20' },
    dependency: { text: 'text-yellow-400', border: 'border-yellow-400', bg_subtle: 'bg-yellow-400/20' },
    test: { text: 'text-indigo-400', border: 'border-indigo-400', bg_subtle: 'bg-indigo-400/20' },
    docs: { text: 'text-teal-400', border: 'border-teal-400', bg_subtle: 'bg-teal-400/20' },
    security: { text: 'text-red-400', border: 'border-red-400', bg_subtle: 'bg-red-400/20' },
    performance: { text: 'text-pink-400', border: 'border-pink-400', bg_subtle: 'bg-pink-400/20' },
    microagent_ready: { text: 'text-gray-400', border: 'border-gray-400', bg_subtle: 'bg-gray-400/20' },
    action_required: { text: 'text-yellow-500', border: 'border-yellow-500', bg_subtle: 'bg-yellow-500/20' },
    in_progress: { text: 'text-gray-500', border: 'border-gray-500', bg_subtle: 'bg-gray-500/20' },
    completed: { text: 'text-gray-400', border: 'border-gray-400', bg_subtle: 'bg-gray-400/20' },
    user: { text: '', border: '', bg_subtle: '' },
    success: { text: 'text-green-500', border: 'border-green-500', bg_subtle: 'bg-green-500/20' },
    fail: { text: 'text-red-500', border: 'border-red-500', bg_subtle: 'bg-red-500/20' },
    tetris_game: { text: 'text-purple-500', border: 'border-purple-500', bg_subtle: 'bg-purple-500/20' },
  };

  // List of message types that trigger a canvas view change
  const canvasChangingMessageTypes = ['code', 'build', 'git', 'bug', 'error', 'llm_error', 'dependency', 'security', 'test', 'docs', 'performance', 'microagent_ready'];

  // Handler for sending new messages
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setAiMessages([...aiMessages, { role: 'user', text: newMessage, type: 'user', status: 'completed' }]);
      setNewMessage('');
      // Simulate AI response (optional)
      setTimeout(() => {
        setAiMessages((prevMessages) => [
          ...prevMessages,
          { role: 'ai', text: "Got it! What else can I help you with?", type: 'microagent_ready', status: 'completed', headerText: 'Microagent ready' },
        ]);
      }, 1000);
    }
  };

  // Handler for toggling the server process
  const toggleServerProcess = () => {
    if (serverStatus === 'active' || serverStatus === 'thinking' || serverStatus === 'error') {
      setServerStatus('stopped');
      setStatusHoverText('Server is stopped.');
      setShowErrorPoll(true); // Show error pill when process is stopped
    } else {
      setServerStatus('active');
      setStatusHoverText('Server is active.');
      setShowErrorPoll(false); // Hide error pill when process is continued
    }
    console.log(`Process ${serverStatus === 'active' ? 'paused' : 'continued'}!`);
  };

  // Mouse down event on the message column resizer to start resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault(); // Prevent text selection during drag
  };

  // Mouse move event to adjust message column width
  const handleMouseMove = (e) => {
    if (!isResizing) return;

    if (containerRef.current) {
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const navWidth = isLeftNavExpanded ? 192 : 64; // Dynamic nav width
      const paddingLeftOfInnerContainer = 16; // Corresponds to Tailwind's p-4
      const spaceXBetweenNavAndMessage = 16; // Corresponds to Tailwind's space-x-4

      const newWidth = e.clientX - (containerLeft + navWidth + paddingLeftOfInnerContainer + spaceXBetweenNavAndMessage);

      if (newWidth >= dynamicMinMessageColumnWidth && newWidth <= maxMessageColumnWidth) {
        setMessageColumnWidth(newWidth);
      } else if (newWidth < dynamicMinMessageColumnWidth) {
        setMessageColumnWidth(dynamicMinMessageColumnWidth);
      } else if (newWidth > maxMessageColumnWidth) {
        setMessageColumnWidth(maxMessageColumnWidth);
      }
    }
  };

  // Mouse up event to stop message column resizing
  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Mouse down event on the console resizer to start resizing
  const handleConsoleMouseDown = (e) => {
    setIsConsoleResizing(true);
    initialConsoleY.current = e.clientY;
    initialConsoleHeight.current = consoleHeight;
    e.preventDefault(); // Prevent text selection during drag
  };

  // Mouse move event to adjust console height
  const handleConsoleMouseMove = (e) => {
    if (!isConsoleResizing) return;

    const deltaY = e.clientY - initialConsoleY.current;
    let newHeight = initialConsoleHeight.current - deltaY; // Invert delta for top-drag resize

    if (newHeight >= minConsoleHeight && newHeight <= maxConsoleHeight) {
      setConsoleHeight(newHeight);
    } else if (newHeight < minConsoleHeight) {
      setConsoleHeight(minConsoleHeight);
    } else if (newHeight > maxConsoleHeight) {
      setConsoleHeight(maxConsoleHeight);
    }
  };

  // Mouse up event to stop console resizing
  const handleConsoleMouseUp = () => {
    setIsConsoleResizing(false);
  };

  // Effect to attach and detach global mouse event listeners for message column resizing
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isLeftNavExpanded, dynamicMinMessageColumnWidth]); // Re-run if left nav state changes or min width changes

  // Effect to attach and detach global mouse event listeners for console resizing
  useEffect(() => {
    if (isConsoleResizing) {
      window.addEventListener('mousemove', handleConsoleMouseMove);
      window.addEventListener('mouseup', handleConsoleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleConsoleMouseMove);
      window.removeEventListener('mouseup', handleConsoleMouseUp);
    };
    return () => {
      window.removeEventListener('mousemove', handleConsoleMouseMove);
      window.removeEventListener('mouseup', handleConsoleMouseUp);
    };
  }, [isConsoleResizing, consoleHeight]); // Re-run if consoleHeight changes while resizing

  // Click outside listener for settings menu (now using settingsHoverAreaRef)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsHoverAreaRef.current && !settingsHoverAreaRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]); // Depend on showSettingsMenu to re-attach listener when it changes

  // Click outside listener for credit dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (creditDropdownRef.current && !creditDropdownRef.current.contains(event.target)) {
        setShowCreditDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreditDropdown]);

  // Click outside listener for server control dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serverControlDropdownRef.current && !serverControlDropdownRef.current.contains(event.target)) {
        setShowServerControlDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showServerControlDropdown]);

  // Effect for auto-focusing project title input
  useEffect(() => {
    if (isEditingProjectTitle && projectTitleInputRef.current) {
      projectTitleInputRef.current.focus();
    }
  }, [isEditingProjectTitle]);

  // Click outside listener for repo dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (repoDropdownRef.current && !repoDropdownRef.current.contains(event.target)) {
        setShowRepoDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRepoDropdown]);

  // Click outside listener for branch dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBranchDropdown]);

  // Click outside listener for intro repo dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (introRepoDropdownRef.current && !introRepoDropdownRef.current.contains(event.target)) {
        setShowIntroRepoDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIntroRepoDropdown]);

  // Click outside listener for intro branch dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (introBranchDropdownRef.current && !introBranchDropdownRef.current.contains(event.target)) {
        setShowIntroBranchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIntroBranchDropdown]);


  // Function to get theme-specific classes
  const getThemeClasses = (element) => {
    switch (theme) {
      case 'light':
        if (element === 'bg') return 'bg-stone-100';
        if (element === 'text') return 'text-stone-900';
        if (element === 'panel-bg') return 'bg-stone-100';
        if (element === 'border') return 'border-stone-300';
        if (element === 'input-bg') return 'bg-stone-200';
        if (element === 'button-bg') return 'bg-stone-200';
        if (element === 'button-text') return 'text-stone-800';
        if (element === 'active-button-bg') return 'bg-stone-400'; // Monochromatic stone for active
        if (element === 'active-button-text') return 'text-stone-900';
        if (element === 'ai-message-bg') return 'bg-transparent'; // Changed to transparent
        if (element === 'user-message-bg') return 'bg-stone-200'; // Light theme user message background
        if (element === 'user-message-text') return 'text-stone-900';
        if (element === 'placeholder-text') return 'text-stone-900 opacity-50';
        if (element === 'icon-color') return 'text-stone-700';
        if (element === 'high-contrast-border') return 'border-stone-400';
        if (element === 'status-dot-running') return 'bg-green-500';
        if (element === 'status-dot-stopped') return 'bg-red-500';
        if (element === 'status-dot-inactive') return 'bg-gray-400'; // Added inactive status dot
        if (element === 'status-text') return 'text-stone-800';
        if (element === 'stop-button-bg') return 'bg-red-500';
        if (element === 'stop-button-text') return 'text-white';
        if (element === 'hover-icon-color') return 'hover:text-amber-600';
        if (element === 'hover-resizer-bg') return 'hover:bg-amber-200';
        if (element === 'pill-button-bg') return 'bg-stone-800';
        if (element === 'pill-button-text') return 'text-stone-100';
        if (element === 'stop-button-bg-subtle') return 'bg-stone-700';
        return '';
      case 'sepia':
        if (element === 'bg') return 'bg-[rgb(235,225,210)]';
        if (element === 'text') return 'text-[rgb(100,80,60)]';
        if (element === 'panel-bg') return 'bg-[rgb(235,225,210)]';
        if (element === 'border') return 'border-[rgb(180,160,140)]';
        if (element === 'input-bg') return 'bg-[rgb(215,205,190)]';
        if (element === 'button-bg') return 'bg-[rgb(215,205,190)]';
        if (element === 'button-text') return 'text-[rgb(100,80,60)]';
        if (element === 'active-button-bg') return 'bg-stone-500'; // Monochromatic stone for active
        if (element === 'active-button-text') return 'text-white';
        if (element === 'ai-message-bg') return 'bg-transparent'; // This will be removed for main messages
        if (element === 'user-message-bg') return 'bg-[rgb(215,205,190)]'; // Sepia theme user message background
        if (element === 'user-message-text') return 'text-[rgb(100,80,60)]';
        if (element === 'placeholder-text') return 'text-[rgb(100,80,60)] opacity-50';
        if (element === 'icon-color') return 'text-[rgb(120,100,80)]';
        if (element === 'high-contrast-border') return 'border-[rgb(160,140,120)]';
        if (element === 'status-dot-running') return 'bg-green-600';
        if (element === 'status-dot-stopped') return 'bg-red-600';
        if (element === 'status-dot-inactive') return 'bg-gray-500'; // Added inactive status dot
        if (element === 'status-text') return 'text-[rgb(100,80,60)]';
        if (element === 'stop-button-bg') return 'bg-red-600';
        if (element === 'stop-button-text') return 'text-white';
        if (element === 'hover-icon-color') return 'hover:text-[rgb(160,140,120)]';
        if (element === 'hover-resizer-bg') return 'hover:bg-[rgb(200,190,175)]';
        if (element === 'pill-button-bg') return 'bg-[rgb(160,140,120)]';
        if (element === 'pill-button-text') return 'text-[rgb(100,80,60)]';
        if (element === 'stop-button-bg-subtle') return 'bg-[rgb(140,120,100)]';
        return '';
      default: // dark theme
        if (element === 'bg') return 'bg-stone-900';
        if (element === 'text') return 'text-stone-100';
        if (element === 'panel-bg') return 'bg-stone-900';
        if (element === 'border') return 'border-stone-700';
        if (element === 'input-bg') return 'bg-stone-800';
        if (element === 'button-bg') return 'bg-stone-700';
        if (element === 'button-text') return 'text-stone-300';
        if (element === 'active-button-bg') return 'bg-stone-600'; // Monochromatic stone for active
        if (element === 'active-button-text') return 'text-white';
        if (element === 'ai-message-bg') return 'bg-transparent'; // Changed to transparent
        if (element === 'user-message-bg') return 'bg-stone-800'; // Dark theme user message background
        if (element === 'user-message-text') return 'text-stone-100';
        if (element === 'placeholder-text') return 'text-stone-100 opacity-50';
        if (element === 'icon-color') return 'text-stone-400';
        if (element === 'high-contrast-border') return 'border-stone-600';
        if (element === 'status-dot-running') return 'bg-green-400';
        if (element === 'status-dot-stopped') return 'bg-red-400';
        if (element === 'status-dot-inactive') return 'bg-gray-600'; // Added inactive status dot
        if (element === 'status-text') return 'text-stone-300';
        if (element === 'stop-button-bg') return 'bg-red-500';
        if (element === 'stop-button-text') return 'text-white';
        if (element === 'hover-icon-color') return 'hover:text-yellow-400';
        if (element === 'hover-resizer-bg') return 'hover:bg-yellow-500';
        if (element === 'pill-button-bg') return 'bg-stone-800';
        if (element === 'pill-button-text') return 'text-stone-100';
        if (element === 'stop-button-bg-subtle') return 'bg-stone-700';
        return '';
    }
  };

  const renderCanvasContent = () => {
    switch (currentCanvasView) {
      case 'code_view':
        return (
          <textarea
            className={`w-full h-full ${getThemeClasses('input-bg')} ${getThemeClasses('text')} p-3 rounded-md focus:outline-none font-mono text-sm resize-none font-light ${getThemeClasses('placeholder-text')}`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            placeholder="Start typing your code here..."
          />
        );
      case 'file_structure_view':
        return (
          <div className={`w-full h-full ${getThemeClasses('input-bg')} ${getThemeClasses('placeholder-text')} p-3 rounded-md text-lg overflow-auto`}>
            <h3 className="font-semibold mb-2">File Structure:</h3>
            <ul className="list-disc list-inside">
              <li>src/</li>
              <li>&nbsp;&nbsp;app.js</li>
              <li>&nbsp;&nbsp;index.js</li>
              <li>public/</li>
              <li>&nbsp;&nbsp;index.html</li>
              <li>package.json</li>
              <li>README.md</li>
            </ul>
          </div>
        );
      case 'changes_view':
        return (
          <div className={`w-full h-full ${getThemeClasses('input-bg')} ${getThemeClasses('placeholder-text')} p-3 rounded-md text-lg overflow-auto`}>
            <h3 className="font-semibold mb-2">Recent Changes:</h3>
            <pre className="font-mono text-sm">
              <span className="text-green-400">+ Added new feature X</span>{"\n"}
              <span className="text-red-400">- Removed old component Y</span>{"\n"}
              <span className="text-yellow-400">~ Updated dependency Z</span>{"\n"}
              Merge conflict in `src/app.js`.
            </pre>
          </div>
        );
      case 'browser_view':
        return (
          <div className={`w-full h-full ${getThemeClasses('input-bg')} ${getThemeClasses('placeholder-text')} flex items-center justify-center rounded-md text-lg`}>
            <p>This is a simulated browser preview.</p>
          </div>
        );
      default:
        return (
          <div className={`w-full h-full ${getThemeClasses('input-bg')} ${getThemeClasses('placeholder-text')} flex items-center justify-center rounded-md text-lg`}>
            <p>Select a view from the top navigation.</p>
          </div>
        );
    }
  };


  return (
    // Main container filling the entire viewport height, with dynamic background and text color
    <div ref={containerRef} className={`h-screen ${getThemeClasses('bg')} ${getThemeClasses('text')} font-inter flex overflow-hidden`}>
      {/* Custom Scrollbar Styles */}
      <style>{`
        /* For Webkit browsers (Chrome, Safari) */
        ::-webkit-scrollbar {
          width: 8px; /* Fixed width, always reserves space */
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.7); /* Visible on hover */
          border-radius: 10px;
        }

        /* Show scrollbar thumb on hover over the scrollable area */
        .absolute.inset-0.overflow-y-scroll:hover::-webkit-scrollbar-thumb,
        .w-full.h-24.overflow-auto:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.7); /* Visible on hover */
          border-radius: 10px;
        }

        /* For Firefox */
        /* Note: Firefox doesn't support as granular styling as Webkit for scrollbars */
        .absolute.inset-0.overflow-y-scroll,
        .w-full.h-24.overflow-auto { /* Apply to the specific scrollable element */
          scrollbar-width: thin;
          scrollbar-color: transparent transparent; /* Initially transparent */
        }
        .absolute.inset-0.overflow-y-scroll:hover,
        .w-full.h-24.overflow-auto:hover {
          scrollbar-color: rgba(156, 163, 175, 0.7) transparent; /* Visible on hover */
        }
      `}</style>

      {/* Loading Overlay */}
      <AnimatePresence>
        {showLoadingOverlay && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
          >
            <svg width="100" height="68" viewBox="0 0 34 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-white w-24 h-24 mb-8">
              <g>
                <path d="M16.0378 11.8721C15.6758 11.5237 15.1314 11.3384 14.5779 11.371C13.6911 11.4259 13.0622 11.7446 12.0955 13.3013C12.0698 11.5208 12.1709 8.84775 12.7651 6.49645C12.9883 5.61286 12.7636 5.03616 12.5343 4.70852C12.2674 4.32602 11.8526 4.07399 11.3942 4.01766C10.9764 3.96577 10.4304 3.9628 9.89806 4.39274C9.89806 4.38681 9.89957 4.3794 9.89957 4.3794C10.0715 3.11628 9.6281 2.3928 8.58294 2.22972L8.52563 2.22379C7.88165 2.19563 7.32966 2.40318 6.88475 2.83904C6.64646 3.0718 6.43984 3.37276 6.26037 3.74487C6.05979 3.45578 5.80189 3.30901 5.59829 3.23488C4.35406 2.78567 3.66633 3.74784 3.36772 4.3616C3.02084 5.07619 2.80517 5.87675 2.68452 6.69363C2.65888 6.67732 2.63475 6.66101 2.60911 6.64619C2.33463 6.49052 1.76303 6.30076 1.02102 6.77072C-0.236789 7.56832 -0.0769234 9.86031 0.173431 11.9477C0.187005 12.0589 0.200578 12.1686 0.214152 12.2798C0.321231 13.1352 0.422278 13.9432 0.283527 14.8935L0.280511 14.9172C0.0286479 17.5547 0.533882 19.5842 1.78264 20.9526C2.98314 22.2691 4.86381 22.954 7.35681 22.9911C7.53929 22.9985 7.71726 23.0015 7.8907 23C12.1497 22.9615 13.6775 20.1521 14.053 19.2625C14.5387 18.1121 14.7905 17.2537 14.9911 16.5628C15.1465 16.0291 15.2701 15.6081 15.4451 15.2582C15.6442 14.8609 15.8191 14.6029 15.9729 14.3746C16.2354 13.9862 16.4616 13.6511 16.4887 13.0285C16.5083 12.5778 16.3515 12.1775 16.0333 11.8721H16.0378ZM7.59208 3.53583C7.83188 3.30159 8.10787 3.19782 8.45776 3.20523C8.76091 3.25415 9.03539 3.3268 8.91021 4.24597C8.90116 4.30379 8.7051 5.68402 8.65232 6.80778C8.65232 6.81519 8.65232 6.82261 8.65232 6.83002C8.37632 7.92709 8.14557 9.50747 8.02191 11.8173C7.48651 11.8499 6.95262 11.9062 6.43381 11.9803C6.26641 7.29405 6.654 4.45204 7.59057 3.53583H7.59208ZM4.27262 4.78561C4.64815 4.01469 4.96335 4.05324 5.25594 4.1585C5.66163 4.30527 5.59829 5.10139 5.55154 5.43199C5.544 5.48536 5.36302 6.72624 5.42636 8.30514C5.37961 9.41259 5.38564 10.689 5.44144 12.1493C4.94526 12.2457 4.47471 12.3569 4.04488 12.477C3.84128 11.8039 2.94091 7.52829 4.27262 4.78709V4.78561ZM15.1434 13.8305C14.9806 14.0707 14.7785 14.3702 14.5507 14.8238C14.3351 15.2523 14.2024 15.7119 14.0319 16.2915C13.8374 16.9572 13.5946 17.7859 13.1316 18.8845C12.8028 19.6613 11.4213 22.1846 7.38697 22.0067C5.1383 21.9741 3.5487 21.4137 2.52767 20.2944C1.47498 19.141 1.05420 17.3649 1.27590 15.018C1.42973 13.9447 1.31662 13.0359 1.20652 12.1582C1.19295 12.0485 1.17938 11.9403 1.16580 11.8306C1.04515 10.818 0.722402 8.12724 1.56245 7.59501C1.78867 7.4512 1.97418 7.41859 2.11142 7.49568C2.34518 7.62762 2.58046 8.10796 2.54728 8.85219C2.54577 8.89222 2.55029 8.93077 2.55784 8.96931C2.60006 10.7039 2.91527 12.2131 3.09474 12.7794C2.80065 12.8876 2.54125 13.0003 2.32407 13.113C2.07975 13.2405 1.98775 13.537 2.11745 13.7772C2.20794 13.9447 2.38289 14.0396 2.56387 14.0381C2.64078 14.0381 2.71921 14.0188 2.79311 13.9803C4.01321 13.3443 6.90737 12.6979 9.45768 12.7676C9.73518 12.772 9.96291 12.5615 9.97045 12.2902C9.97799 12.0189 9.76082 11.7935 9.48482 11.7861C9.3325 11.7817 9.17867 11.7817 9.02483 11.7817C9.27971 7.12356 9.98101 5.60397 10.527 5.15476C10.7532 4.96944 10.9689 4.95462 11.2675 4.99168C11.3504 5.00206 11.5585 5.0495 11.7079 5.26298C11.8692 5.49574 11.8994 5.83969 11.7938 6.25776C10.8708 9.90627 11.079 14.1967 11.1845 15.2375C11.1664 15.273 11.1498 15.3086 11.1302 15.3457C10.9146 15.7445 10.5134 16.1596 10.0353 16.1314C9.76232 16.1181 9.52253 16.3227 9.50594 16.5925C9.48935 16.8638 9.69898 17.0966 9.97498 17.1129C10.7834 17.1603 11.545 16.6725 12.0125 15.8082C12.0623 15.7163 12.1045 15.6288 12.1422 15.5443C12.1452 15.5384 12.1482 15.531 12.1513 15.5251C12.2387 15.3323 12.3021 15.1559 12.3579 14.9973C12.4453 14.7512 12.5208 14.5377 12.6716 14.2738C13.7424 12.4088 14.1767 12.3821 14.6367 12.3539C14.9067 12.3376 15.1751 12.4221 15.3335 12.5763C15.4466 12.6845 15.4964 12.8194 15.4888 12.9885C15.4737 13.3369 15.3757 13.4821 15.1389 13.832L15.1434 13.8305Z" fill="currentColor"/>
                <path d="M33.813 14.5881C33.6576 13.6408 33.7436 12.8313 33.8341 11.9744C33.8462 11.8632 33.8582 11.7535 33.8688 11.6423C34.0799 9.55195 34.1976 7.25551 32.9232 6.48163C32.1721 6.02501 31.6035 6.22515 31.3321 6.38526C31.3064 6.40009 31.2823 6.41788 31.2566 6.43419C31.1194 5.62028 30.8902 4.82416 30.5297 4.11551C30.2205 3.50767 29.5162 2.55737 28.2795 3.02881C28.0774 3.1059 27.8241 3.25712 27.628 3.55066C27.441 3.18151 27.2283 2.88501 26.9855 2.6567C26.5331 2.22973 25.9766 2.03107 25.3341 2.0711L25.2768 2.07703C24.2346 2.25938 23.8048 2.99027 24.0009 4.25338C24.0009 4.25338 24.0009 4.25931 24.0024 4.26376C23.4625 3.84272 22.9165 3.85606 22.5003 3.91537C22.0433 3.9806 21.6331 4.24004 21.3737 4.62698C21.152 4.95907 20.9363 5.53874 21.1761 6.41788C21.8156 8.7588 21.9664 11.4303 21.9739 13.2108C20.9785 11.672 20.3436 11.3651 19.4568 11.3265C18.9048 11.3028 18.3604 11.5 18.0059 11.8543C17.6937 12.1657 17.5444 12.5689 17.5731 13.0181C17.6123 13.6393 17.8446 13.9714 18.1145 14.3539C18.2729 14.5792 18.4524 14.8342 18.659 15.2271C19.3527 17.2092 19.6197 18.0632 20.1279 19.2047C20.52 20.0868 22.1006 22.8695 26.3476 22.8295C26.5195 22.828 26.6975 22.8221 26.8785 22.8102C29.385 22.7287 31.2521 22.0082 32.4285 20.6709C33.6501 19.2803 34.1176 17.2418 33.8175 14.6089L33.8145 14.5851L33.813 14.5881ZM28.37 5.22889C28.3172 4.89384 28.2373 4.0992 28.6415 3.9465C28.9311 3.83531 29.2478 3.79232 29.6369 4.55582C31.0199 7.2733 30.2009 11.5652 30.0094 12.2413C29.5766 12.1286 29.1045 12.0263 28.6068 11.9388C28.634 10.4785 28.6159 9.20059 28.5495 8.09462C28.5827 6.51573 28.3791 5.27781 28.37 5.22889ZM25.4216 3.05105C25.773 3.03622 26.0505 3.13555 26.2933 3.36683C27.2464 4.26673 27.6883 7.09984 27.6084 11.7891C27.0881 11.7239 26.5542 11.6779 26.0173 11.6542C25.8514 9.34588 25.5905 7.77143 25.2934 6.67881C25.2934 6.67139 25.2934 6.66398 25.2934 6.65657C25.2195 5.53281 24.9963 4.15702 24.9872 4.10365C24.8439 3.183 25.1169 3.1059 25.4201 3.05105H25.4216ZM32.8251 14.7334C33.0906 17.0758 32.703 18.8593 31.6729 20.032C30.673 21.1691 29.0939 21.7591 26.8317 21.8332C22.82 22.0823 21.3872 19.5857 21.0449 18.8148C20.5593 17.7237 20.3014 16.9009 20.0947 16.2382C19.9138 15.66 19.772 15.2048 19.5488 14.7794C19.3135 14.3302 19.1054 14.0351 18.938 13.7979C18.6952 13.4525 18.5941 13.3087 18.5715 12.9603C18.5609 12.7913 18.6092 12.6549 18.7193 12.5452C18.8761 12.388 19.1416 12.2976 19.4131 12.3109C19.873 12.3317 20.3074 12.3495 21.4144 14.1952C21.5712 14.4562 21.6497 14.6682 21.7417 14.9128C21.802 15.0714 21.8683 15.2478 21.9603 15.4391C21.9634 15.445 21.9649 15.4509 21.9679 15.4554C22.0086 15.5399 22.0523 15.6259 22.1036 15.7178C22.5877 16.5732 23.3584 17.0476 24.1653 16.9854C24.4398 16.9646 24.6464 16.7274 24.6253 16.4576C24.6041 16.1878 24.3643 15.9876 24.0884 16.0054C23.6103 16.041 23.2016 15.6333 22.9783 15.2389C22.9572 15.2019 22.9406 15.1678 22.9225 15.1322C23.0085 14.0915 23.1367 9.79657 22.1443 6.16585C22.0297 5.74926 22.0538 5.40531 22.2107 5.16959C22.357 4.95314 22.5636 4.90125 22.6466 4.88939C22.9437 4.8464 23.1608 4.85826 23.3901 5.03913C23.9451 5.47944 24.675 6.98569 25.0159 11.6379C24.862 11.6394 24.7082 11.6438 24.5574 11.6512C24.2814 11.6631 24.0687 11.8929 24.0808 12.1642C24.0929 12.4355 24.3221 12.6401 24.6026 12.6327C27.1499 12.517 30.0577 13.11 31.2883 13.7253C31.3622 13.7623 31.4406 13.7787 31.5191 13.7787C31.7 13.7772 31.8735 13.6793 31.961 13.5088C32.0861 13.2672 31.9881 12.9707 31.7408 12.8476C31.5221 12.7379 31.2597 12.6312 30.9641 12.5274C31.133 11.9581 31.421 10.443 31.4301 8.70839C31.4376 8.66985 31.4406 > 8.6313 31.4376 > 8.59127C31.3894 7.84852 31.6171 7.36374 31.8478 7.22734C31.9836 7.14729 32.1691 7.17694 32.3983 7.31629C33.2489 7.8337 32.9775 10.5289 32.8749 11.5445C32.8643 11.6542 32.8523 11.7624 32.8402 11.8721C32.7467 12.7527 32.6502 13.6615 32.8251 14.7334Z" fill="currentColor"/>
                <path d="M18.8415 5.2541C18.7615 5.2541 18.6801 5.23927 18.6032 5.20369C18.3211 5.0762 18.1975 4.74856 18.3272 4.47132C18.7464 3.57143 19.3603 2.74121 20.1008 2.0711C20.3285 1.86503 20.6844 1.87837 20.8941 2.10372C21.1037 2.32758 21.0901 2.67746 20.8609 2.88353C20.229 3.45579 19.7056 4.16444 19.3467 4.93239C19.2532 5.13253 19.0526 5.25262 18.8415 5.2541Z" fill="currentColor"/>
                <path d="M16.9502 4.93536C16.6592 4.93832 16.4103 4.71891 16.3862 4.42833C16.2791 3.12815 16.2746 1.81018 16.3756 0.509998C16.3998 0.206079 16.6697 -0.0207484 16.9774 0.00148956C17.2866 0.0252101 17.5173 0.289101 17.4947 0.59302C17.3982 1.83538 17.4027 3.09553 17.5052 4.3379C17.5309 4.64181 17.3001 4.90867 16.991 4.93239C16.9774 4.93239 16.9638 4.93387 16.9502 4.93387V4.93536Z" fill="currentColor"/>
                <path d="M15.0168 5.27782C14.7649 5.28078 14.5326 5.11326 14.4678 4.86271C14.2295 3.94354 13.7786 3.07033 13.1647 2.33944C12.9672 2.10372 13.0019 1.75681 13.2401 1.56259C13.4799 1.36838 13.8329 1.40248 14.0304 1.63672C14.7483 2.49362 15.2762 3.51509 15.5537 4.58992C15.6306 4.88495 15.4481 5.1859 15.148 5.26151C15.1027 5.27337 15.059 5.27782 15.0137 5.2793L15.0168 5.27782Z" fill="currentColor"/>
              </g>
            </svg>
            <Spinner className="w-16 h-16" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left-side Navigation Column (full-bleed, no shadow, no rounded corners) */}
      <motion.div
        className={`flex flex-col items-start py-4 px-2 flex-shrink-0 ${getThemeClasses('bg')} overflow-hidden`}
        initial={{ width: 64 }}
        animate={{ width: isLeftNavExpanded ? 192 : 64 }} // Expanded width 192px (w-48)
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsLeftNavExpanded(true)}
        onMouseLeave={() => setIsLeftNavExpanded(false)}
        style={{ height: '100vh' }} // Ensure it takes 100% viewport height
      >
        <div className="flex flex-col items-start space-y-6 w-full">
          {/* SVG Logo */}
          <div className={`p-2 flex items-center w-full flex-shrink-0 justify-start`}> {/* Changed to always justify-start */}
            <motion.div initial={false} animate={{ scale: 1 }}> {/* Prevent flashing */}
              <svg width="34" height="23" viewBox="0 0 34 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={`${getThemeClasses('text')}`}>
                <g>
                  <path d="M16.0378 11.8721C15.6758 11.5237 15.1314 11.3384 14.5779 11.371C13.6911 11.4259 13.0622 11.7446 12.0955 13.3013C12.0698 11.5208 12.1709 8.84775 12.7651 6.49645C12.9883 5.61286 12.7636 5.03616 12.5343 4.70852C12.2674 4.32602 11.8526 4.07399 11.3942 4.01766C10.9764 3.96577 10.4304 3.9628 9.89806 4.39274C9.89806 4.38681 9.89957 4.3794 9.89957 4.3794C10.0715 3.11628 9.6281 2.3928 8.58294 2.22972L8.52563 2.22379C7.88165 2.19563 7.32966 2.40318 6.88475 2.83904C6.64646 3.0718 6.43984 3.37276 6.26037 3.74487C6.05979 3.45578 5.80189 3.30901 5.59829 3.23488C4.35406 2.78567 3.66633 3.74784 3.36772 4.3616C3.02084 5.07619 2.80517 5.87675 2.68452 6.69363C2.65888 6.67732 2.63475 6.66101 2.60911 6.64619C2.33463 6.49052 1.76303 6.30076 1.02102 6.77072C-0.236789 7.56832 -0.0769234 9.86031 0.173431 11.9477C0.187005 12.0589 0.200578 12.1686 0.214152 12.2798C0.321231 13.1352 0.422278 13.9432 0.283527 14.8935L0.280511 14.9172C0.0286479 17.5547 0.533882 19.5842 1.78264 20.9526C2.98314 22.2691 4.86381 22.954 7.35681 22.9911C7.53929 22.9985 7.71726 23.0015 7.8907 23C12.1497 22.9615 13.6775 20.1521 14.053 19.2625C14.5387 18.1121 14.7905 17.2537 14.9911 16.5628C15.1465 16.0291 15.2701 15.6081 15.4451 15.2582C15.6442 14.8609 15.8191 14.6029 15.9729 14.3746C16.2354 13.9862 16.4616 13.6511 16.4887 13.0285C16.5083 12.5778 16.3515 12.1775 16.0333 11.8721H16.0378ZM7.59208 3.53583C7.83188 3.30159 8.10787 3.19782 8.45776 3.20523C8.76091 3.25415 9.03539 3.3268 8.91021 4.24597C8.90116 4.30379 8.7051 5.68402 8.65232 6.80778C8.65232 6.81519 8.65232 6.82261 8.65232 6.83002C8.37632 7.92709 8.14557 9.50747 8.02191 11.8173C7.48651 11.8499 6.95262 11.9062 6.43381 11.9803C6.26641 7.29405 6.654 4.45204 7.59057 3.53583H7.59208ZM4.27262 4.78561C4.64815 4.01469 4.96335 4.05324 5.25594 4.1585C5.66163 4.30527 5.59829 5.10139 5.55154 5.43199C5.544 5.48536 5.36302 6.72624 5.42636 8.30514C5.37961 9.41259 5.38564 10.689 5.44144 12.1493C4.94526 12.2457 4.47471 12.3569 4.04488 12.477C3.84128 11.8039 2.94091 7.52829 4.27262 4.78709V4.78561ZM15.1434 13.8305C14.9806 14.0707 14.7785 14.3702 14.5507 14.8238C14.3351 15.2523 14.2024 15.7119 14.0319 16.2915C13.8374 16.9572 13.5946 17.7859 13.1316 18.8845C12.8028 19.6613 11.4213 22.1846 7.38697 22.0067C5.1383 21.9741 3.5487 21.4137 2.52767 20.2944C1.47498 19.141 1.05420 17.3649 1.27590 15.018C1.42973 13.9447 1.31662 13.0359 1.20652 12.1582C1.19295 12.0485 1.17938 11.9403 1.16580 11.8306C1.04515 10.818 0.722402 8.12724 1.56245 7.59501C1.78867 7.4512 1.97418 7.41859 2.11142 7.49568C2.34518 7.62762 2.58046 8.10796 2.54728 8.85219C2.54577 8.89222 2.55029 8.93077 2.55784 8.96931C2.60006 10.7039 2.91527 12.2131 3.09474 12.7794C2.80065 12.8876 2.54125 13.0003 2.32407 13.113C2.07975 13.2405 1.98775 13.537 2.11745 13.7772C2.20794 13.9447 2.38289 14.0396 2.56387 14.0381C2.64078 14.0381 2.71921 14.0188 2.79311 13.9803C4.01321 13.3443 6.90737 12.6979 9.45768 12.7676C9.73518 12.772 9.96291 12.5615 9.97045 12.2902C9.97799 12.0189 9.76082 11.7935 9.48482 11.7861C9.3325 11.7817 9.17867 11.7817 9.02483 11.7817C9.27971 7.12356 9.98101 5.60397 10.527 5.15476C10.7532 4.96944 10.9689 4.95462 11.2675 4.99168C11.3504 5.00206 11.5585 5.0495 11.7079 5.26298C11.8692 5.49574 11.8994 5.83969 11.7938 6.25776C10.8708 9.90627 11.079 14.1967 11.1845 15.2375C11.1664 15.273 11.1498 15.3086 11.1302 15.3457C10.9146 15.7445 10.5134 16.1596 10.0353 16.1314C9.76232 16.1181 9.52253 16.3227 9.50594 16.5925C9.48935 16.8638 9.69898 17.0966 9.97498 17.1129C10.7834 17.1603 11.545 16.6725 12.0125 15.8082C12.0623 15.7163 12.1045 15.6288 12.1422 15.5443C12.1452 15.5384 12.1482 15.531 12.1513 15.5251C12.2387 15.3323 12.3021 15.1559 12.3579 14.9973C12.4453 14.7512 12.5208 14.5377 12.6716 14.2738C13.7424 12.4088 14.1767 12.3821 14.6367 12.3539C14.9067 12.3376 15.1751 12.4221 15.3335 12.5763C15.4466 12.6845 15.4964 12.8194 15.4888 12.9885C15.4737 13.3369 15.3757 13.4821 15.1389 13.832L15.1434 13.8305Z" fill="currentColor"/>
                <path d="M33.813 14.5881C33.6576 13.6408 33.7436 12.8313 33.8341 11.9744C33.8462 11.8632 33.8582 11.7535 33.8688 11.6423C34.0799 9.55195 34.1976 7.25551 32.9232 6.48163C32.1721 6.02501 31.6035 6.22515 31.3321 6.38526C31.3064 6.40009 31.2823 6.41788 31.2566 6.43419C31.1194 5.62028 30.8902 4.82416 30.5297 4.11551C30.2205 3.50767 29.5162 2.55737 28.2795 3.02881C28.0774 3.1059 27.8241 3.25712 27.628 3.55066C27.441 3.18151 27.2283 2.88501 26.9855 2.6567C26.5331 2.22973 25.9766 2.03107 25.3341 2.0711L25.2768 2.07703C24.2346 2.25938 23.8048 2.99027 24.0009 4.25338C24.0009 4.25338 24.0009 4.25931 24.0024 4.26376C23.4625 3.84272 22.9165 3.85606 22.5003 3.91537C22.0433 3.9806 21.6331 4.24004 21.3737 4.62698C21.152 4.95907 20.9363 5.53874 21.1761 6.41788C21.8156 8.7588 21.9664 11.4303 21.9739 13.2108C20.9785 11.672 20.3436 11.3651 19.4568 11.3265C18.9048 11.3028 18.3604 11.5 18.0059 11.8543C17.6937 12.1657 17.5444 12.5689 17.5731 13.0181C17.6123 13.6393 17.8446 13.9714 18.1145 14.3539C18.2729 14.5792 18.4524 14.8342 18.659 15.2271C19.3527 17.2092 19.6197 18.0632 20.1279 19.2047C20.52 20.0868 22.1006 22.8695 26.3476 22.8295C26.5195 22.828 26.6975 22.8221 26.8785 22.8102C29.385 22.7287 31.2521 22.0082 32.4285 20.6709C33.6501 19.2803 34.1176 17.2418 33.8175 14.6089L33.8145 14.5851L33.813 14.5881ZM28.37 5.22889C28.3172 4.89384 28.2373 4.0992 28.6415 3.9465C28.9311 3.83531 29.2478 3.79232 29.6369 4.55582C31.0199 7.2733 30.2009 11.5652 30.0094 12.2413C29.5766 12.1286 29.1045 12.0263 28.6068 11.9388C28.634 10.4785 28.6159 9.20059 28.5495 8.09462C28.5827 6.51573 28.3791 5.27781 28.37 5.22889ZM25.4216 3.05105C25.773 3.03622 26.0505 3.13555 26.2933 3.36683C27.2464 4.26673 27.6883 7.09984 27.6084 11.7891C27.0881 11.7239 26.5542 11.6779 26.0173 11.6542C25.8514 9.34588 25.5905 7.77143 25.2934 6.67881C25.2934 6.67139 25.2934 6.66398 25.2934 6.65657C25.2195 5.53281 24.9963 4.15702 24.9872 4.10365C24.8439 3.183 25.1169 3.1059 25.4201 3.05105H25.4216ZM32.8251 14.7334C33.0906 17.0758 32.703 18.8593 31.6729 20.032C30.673 21.1691 29.0939 21.7591 26.8317 21.8332C22.82 22.0823 21.3872 19.5857 21.0449 18.8148C20.5593 17.7237 20.3014 16.9009 20.0947 16.2382C19.9138 15.66 19.772 15.2048 19.5488 14.7794C19.3135 14.3302 19.1054 14.0351 18.938 13.7979C18.6952 13.4525 18.5941 13.3087 18.5715 12.9603C18.5609 12.7913 18.6092 12.6549 18.7193 12.5452C18.8761 12.388 19.1416 12.2976 19.4131 12.3109C19.873 12.3317 20.3074 12.3495 21.4144 14.1952C21.5712 14.4562 21.6497 14.6682 21.7417 14.9128C21.802 15.0714 21.8683 15.2478 21.9603 15.4391C21.9634 15.445 21.9649 15.4509 21.9679 15.4554C22.0086 15.5399 22.0523 15.6259 22.1036 15.7178C22.5877 16.5732 23.3584 17.0476 24.1653 16.9854C24.4398 16.9646 24.6464 16.7274 24.6253 16.4576C24.6041 16.1878 24.3643 15.9876 24.0884 16.0054C23.6103 16.041 23.2016 15.6333 22.9783 15.2389C22.9572 15.2019 22.9406 15.1678 22.9225 15.1322C23.0085 14.0915 23.1367 9.79657 22.1443 6.16585C22.0297 5.74926 22.0538 5.40531 22.2107 5.16959C22.357 4.95314 22.5636 4.90125 22.6466 4.88939C22.9437 4.8464 23.1608 4.85826 23.3901 5.03913C23.9451 5.47944 24.675 6.98569 25.0159 11.6379C24.862 11.6394 24.7082 11.6438 24.5574 11.6512C24.2814 11.6631 24.0687 11.8929 24.0808 12.1642C24.0929 12.4355 24.3221 12.6401 24.6026 12.6327C27.1499 12.517 30.0577 13.11 31.2883 13.7253C31.3622 13.7623 31.4406 13.7787 31.5191 13.7787C31.7 13.7772 31.8735 13.6793 31.961 13.5088C32.0861 13.2672 31.9881 12.9707 31.7408 12.8476C31.5221 12.7379 31.2597 12.6312 30.9641 12.5274C31.133 11.9581 31.421 10.443 31.4301 8.70839C31.4376 8.66985 31.4406 > 8.6313 31.4376 > 8.59127C31.3894 7.84852 31.6171 7.36374 31.8478 7.22734C31.9836 7.14729 32.1691 7.17694 32.3983 7.31629C33.2489 7.8337 32.9775 10.5289 32.8749 11.5445C32.8643 11.6542 32.8523 11.7624 32.8402 11.8721C32.7467 12.7527 32.6502 13.6615 32.8251 14.7334Z" fill="currentColor"/>
                <path d="M18.8415 5.2541C18.7615 5.2541 18.6801 5.23927 18.6032 5.20369C18.3211 5.0762 18.1975 4.74856 18.3272 4.47132C18.7464 3.57143 19.3603 2.74121 20.1008 2.0711C20.3285 1.86503 20.6844 1.87837 20.8941 2.10372C21.1037 2.32758 21.0901 2.67746 20.8609 2.88353C20.229 3.45579 19.7056 4.16444 19.3467 4.93239C19.2532 5.13253 19.0526 5.25262 18.8415 5.2541Z" fill="currentColor"/>
                <path d="M16.9502 4.93536C16.6592 4.93832 16.4103 4.71891 16.3862 4.42833C16.2791 3.12815 16.2746 1.81018 16.3756 0.509998C16.3998 0.206079 16.6697 -0.0207484 16.9774 0.00148956C17.2866 0.0252101 17.5173 0.289101 17.4947 0.59302C17.3982 1.83538 17.4027 3.09553 17.5052 4.3379C17.5309 4.64181 17.3001 4.90867 16.991 4.93239C16.9774 4.93239 16.9638 4.93387 16.9502 4.93387V4.93536Z" fill="currentColor"/>
                <path d="M15.0168 5.27782C14.7649 5.28078 14.5326 5.11326 14.4678 4.86271C14.2295 3.94354 13.7786 3.07033 13.1647 2.33944C12.9672 2.10372 13.0019 1.75681 13.2401 1.56259C13.4799 1.36838 13.8329 1.40248 14.0304 1.63672C14.7483 2.49362 15.2762 3.51509 15.5537 4.58992C15.6306 4.88495 15.4481 5.1859 15.148 5.26151C15.1027 5.27337 15.059 5.27782 15.0137 5.2793L15.0168 5.27782Z" fill="currentColor"/>
              </g>
            </svg>
            </motion.div>
          </div>
          {/* Navigation Icons */}
          {[
            { icon: PlusCircle, label: "New Project" },
            // { icon: Search, label: "Search" }, // Commented out as requested
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center w-full px-2 py-2 rounded-md hover:bg-stone-700 transition-colors duration-150"
            >
              <item.icon className={`w-5 h-5 ${getThemeClasses('icon-color')} flex-shrink-0`} />
              <AnimatePresence>
                {isLeftNavExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 text-sm whitespace-nowrap overflow-hidden" // Added overflow-hidden
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Conditional Project List (only when expanded) */}
          <AnimatePresence>
            {isLeftNavExpanded && (
              <motion.div
                key="project-list-expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-start w-full px-0 py-2" // Reduced px to 0
              >
                <span className="ml-3 text-sm font-normal whitespace-nowrap mb-2 opacity-75">Current Projects</span>
                <ul className="ml-1 text-xs opacity-80 space-y-4 w-full"> {/* Reduced ml to 1 */}
                  {['Project Alpha', 'Project Beta', 'Project Gamma'].map((project, pIdx) => (
                    <li key={pIdx} className="relative group flex items-center justify-between hover:bg-stone-700 p-1 rounded-md cursor-pointer text-left">
                      <span>{project}</span>
                      <AnimatePresence>
                        {isLeftNavExpanded && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={`mt-3 ml-3 px-3 py-1 rounded-full text-xs ${getThemeClasses('pill-button-bg')} ${getThemeClasses('pill-button-text')} hover:opacity-90 self-start`}
                >
                  View More
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Aligned Section */}
        <div className="flex flex-col items-start w-full mt-auto"> {/* Added mt-auto to push to bottom */}

          {/* Bottom Rounded Corner Outline Box (Documentation, Help, Invite Team) */}
          <AnimatePresence>
            {isLeftNavExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className={`w-full mb-4 p-3 rounded-xl border ${getThemeClasses('border')} ${getThemeClasses('panel-bg')}`}
              >
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="#" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                      <BookOpen className={`w-4 h-4 ${getThemeClasses('icon-color')}`} />
                      <span>Documentation</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                      <LifeBuoy className={`w-4 h-4 ${getThemeClasses('icon-color')}`} />
                      <span>Help</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                      <Users className={`w-4 h-4 ${getThemeClasses('icon-color')}`} />
                      <span>Invite Team</span>
                    </a>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Credits Counter with Dropdown */}
          <AnimatePresence>
              {isLeftNavExpanded && ( // Only show if nav is expanded
                <motion.div
                  key="credits-expanded"
                  initial={{ opacity: 0 }} // Removed y animation
                  animate={{ opacity: 1 }} // Removed y animation
                  exit={{ opacity: 0 }} // Removed y animation
                  transition={{ duration: 0.2 }}
                  className="relative w-full flex justify-start mb-2 pl-2" ref={creditDropdownRef} // Changed to justify-start and added pl-2
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-90`}
                    onClick={() => setShowCreditDropdown(!showCreditDropdown)}
                  >
                    <Wallet className="w-3 h-3" />
                    <span>{credits}</span>
                    {showCreditDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </motion.button>
                  <AnimatePresence>
                    {showCreditDropdown && ( // Only show if dropdown is open
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`}
                      >
                        <div className="py-1">
                          <a href="#" className={`block px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}>Personal</a>
                          <a href="#" className={`block px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}>Organization</a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

          {/* User icon and Credits/Theme Menu */}
          <div className="relative w-full flex flex-col items-center">
            {/* User Profile and Settings (with new hover menu) */}
            <div
              className="flex flex-col items-start w-full relative"
              onMouseEnter={() => setShowSettingsMenu(true)}
              onMouseLeave={() => setShowSettingsMenu(false)}
              ref={settingsHoverAreaRef}
            >
              <div className="flex items-center w-full px-2 py-2 justify-start">
                  <img
                      src="https://placehold.co/32x32/007bff/ffffff?text=U"
                      alt="User"
                      className="w-8 h-8 rounded-full cursor-pointer flex-shrink-0"
                      onClick={() => isLeftNavExpanded && setShowSettingsMenu(!showSettingsMenu)}
                  />
                  <AnimatePresence>
                      {isLeftNavExpanded && (
                          <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className="ml-3 flex flex-col items-start"
                          >
                              <span className="text-sm font-medium whitespace-nowrap">User Name</span>
                              <motion.button
                                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  className="flex items-center text-xs opacity-70 hover:opacity-100 transition-opacity"
                                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                              >
                                  <Settings className="w-3 h-3 mr-1" />
                                  <span>Settings</span>
                              </motion.button>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>


              {/* Settings Menu Dropdown */}
              <AnimatePresence>
                {showSettingsMenu && ( // Removed isLeftNavExpanded condition here to allow hover
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-1/2 -translate-y-1/2 left-full ml-2 p-4 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20 w-[400px] flex`}
                  >
                    {/* Personal Settings Column */}
                    <div className="flex-1 pr-4 border-r border-stone-700">
                      <h4 className="font-semibold text-sm mb-2">Personal Settings</h4>
                      <p className="text-xs opacity-70 mb-3">robert@all-hands.dev</p>
                      <ul className="space-y-2 text-sm">
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>Log Out</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>Log In to Mobile</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>My Profile</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>My Preferences</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>My Organizations</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>My Application Keys</a></li>
                      </ul>
                      <div className="mt-4">
                        <span className="text-sm font-medium">Theme : </span>
                        <div className="inline-flex space-x-1 p-1 rounded-md bg-stone-800">
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className={`p-1 rounded-full ${
                              theme === 'light' ? getThemeClasses('active-button-bg') : ''
                            } hover:opacity-90`}
                            onClick={() => setTheme('light')}
                            title="Light Mode"
                          >
                            <Sun className={`w-4 h-4 ${theme === 'light' ? getThemeClasses('active-button-text') : getThemeClasses('button-text')}`} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className={`p-1 rounded-full ${
                              theme === 'dark' ? getThemeClasses('active-button-bg') : ''
                            } hover:opacity-90`}
                            onClick={() => setTheme('dark')}
                            title="Dark Mode"
                          >
                            <Moon className={`w-4 h-4 ${theme === 'dark' ? getThemeClasses('active-button-text') : getThemeClasses('button-text')}`} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className={`p-1 rounded-full ${
                              theme === 'sepia' ? getThemeClasses('active-button-bg') : ''
                            } hover:opacity-90`}
                            onClick={() => setTheme('sepia')}
                            title="Sepia Mode"
                          >
                            <Palette className={`w-4 h-4 ${theme === 'sepia' ? getThemeClasses('active-button-text') : getThemeClasses('button-text')}`} />
                          </motion.button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span>Increase Contrast</span>
                        {/* Placeholder for toggle switch */}
                        <div className="w-8 h-4 bg-gray-600 rounded-full flex items-center p-0.5 cursor-pointer">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Organization Settings Column */}
                    <div className="flex-1 pl-4">
                      <h4 className="font-semibold text-sm mb-2">Organization Settings</h4>
                      <p className="text-xs opacity-70 mb-3">All Hands AI</p>
                      <ul className="space-y-2 text-sm">
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>Plan & Usage</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>Users</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>Teams</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>Roles</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>Service Accounts</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>API Keys</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>Application Keys</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>Audit Trail</a></li>
                        <li><a href="#" className={`block py-1 hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')} rounded-md px-2`}>Sensitive Data Scanner</a></li>
                      </ul>
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">SWITCH ORGANIZATIONS</h4>
                        <div className={`flex items-center justify-between py-1 px-2 rounded-md ${getThemeClasses('active-button-bg')} ${getThemeClasses('active-button-text')} cursor-pointer`}>
                          <span>All Hands AI</span>
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right-side content area (top nav + message column + canvas) */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <nav className={`flex items-center justify-between px-4 py-3 ${getThemeClasses('bg')} flex-shrink-0`}>
          {/* Project Title and Git Repo/Branch */}
          <div className="flex items-center space-x-4">
            {/* Server Status Indicator */}
            <StatusIndicator status={serverStatus} hoverText={statusHoverText} />
            {isEditingProjectTitle ? (
              <input
                ref={projectTitleInputRef}
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onBlur={() => setIsEditingProjectTitle(false)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingProjectTitle(false);
                  }
                }}
                className={`bg-transparent border-b ${getThemeClasses('border')} focus:outline-none text-lg font-light ${getThemeClasses('text')}`}
              />
            ) : (
              <span className="text-lg font-light cursor-pointer" onClick={() => setIsEditingProjectTitle(true)}>
                {projectTitle}
              </span>
            )}
          </div>

          {/* Git Controls and New Buttons (Right-aligned) */}
          <div className="flex items-center space-x-3 ml-auto"> {/* Used ml-auto to push to right */}
            {/* New Share Button */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border border-white text-white hover:bg-white hover:text-stone-900 transition-colors`}
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </motion.button>

            {/* New Run Button */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border border-white text-white hover:bg-white hover:text-stone-900 transition-colors`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Run</span>
            </motion.button>

            {/* Canvas Toggle Icon (moved here) */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {isCanvasActive ? (
                <PanelRightClose
                  className={`w-5 h-5 ${getThemeClasses('icon-color')} ${getThemeClasses('hover-icon-color')}`}
                  onClick={() => setIsCanvasActive(false)}
                  title="Hide Canvas"
                />
              ) : (
                <PanelRightOpen
                  className={`w-5 h-5 ${getThemeClasses('icon-color')} ${getThemeClasses('hover-icon-color')}`}
                  onClick={() => setIsCanvasActive(true)}
                  title="Show Canvas"
                />
              )}
            </motion.div>
          </div>
        </nav>

        {/* Container for Message Column, Resizer, and Main Canvas (with padding and spacing) */}
        <div className={`flex-grow flex flex-row p-4 ${isCanvasActive ? 'space-x-2' : ''}`}>
          {/* AI Message Thread Column */}
          <motion.div
            className={`flex flex-col overflow-hidden rounded-xl ${getThemeClasses('panel-bg')}`}
            animate={isCanvasActive ?
              { width: messageColumnWidth, marginLeft: 0, marginRight: 0 } :
              { width: '100%', marginLeft: 'auto', marginRight: 'auto' }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ minWidth: isCanvasActive ? `${dynamicMinMessageColumnWidth}px` : 'auto', maxWidth: isCanvasActive ? `${maxMessageColumnWidth}px` : '760px' }}
          >
            {/* Intro Card */}
            <AnimatePresence>
              {showIntroCard && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center h-full w-full p-8" // Added p-8 for padding
                >
                  <h2 className="text-2xl font-semibold mb-6 text-center">Welcome back, Rob!</h2> {/* Increased mb */}
                  <div
                    className={`p-8 rounded-xl shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} max-w-lg text-center mx-auto`} // Increased p, max-w
                  >
                    <h3 className="text-xl font-semibold mb-6">Start a New Project or Continue</h3> {/* Increased mb */}
                    <div className="flex flex-col md:flex-row justify-center items-center md:space-x-8 space-y-6 md:space-y-0"> {/* Added responsive spacing */}
                      {/* Left Side: Select Repo/Branch */}
                      <div className="flex flex-col items-center space-y-4"> {/* Increased space-y */}
                        <div className="relative" ref={introRepoDropdownRef} onMouseEnter={() => setShowIntroRepoDropdown(true)} onMouseLeave={() => setShowIntroRepoDropdown(false)}>
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-base ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-90`} // Increased padding, font size
                            onClick={() => { setShowIntroRepoDropdown(!showIntroRepoDropdown); setIsCanvasActive(true); setShowIntroCard(false); }}
                          >
                            <Github className="w-5 h-5" />
                            <span>Select Repo</span>
                            {showIntroRepoDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </motion.button>
                          <AnimatePresence>
                            {showIntroRepoDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className={`absolute left-0 mt-2 w-40 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`} // Increased width
                              >
                                <div className="py-1">
                                  <a href="#" className={`block px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`} onClick={() => { setIsCanvasActive(true); setShowIntroCard(false); }}>Repo A</a>
                                  <a href="#" className={`block px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`} onClick={() => { setIsCanvasActive(true); setShowIntroCard(false); }}>Repo B</a>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="relative" ref={introBranchDropdownRef} onMouseEnter={() => setShowIntroBranchDropdown(true)} onMouseLeave={() => setShowIntroBranchDropdown(false)}>
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-base ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-90`} // Increased padding, font size
                            onClick={() => { setShowIntroBranchDropdown(!showIntroBranchDropdown); setIsCanvasActive(true); setShowIntroCard(false); }}
                          >
                            <GitBranch className="w-5 h-5" />
                            <span>Select Branch</span>
                            {showIntroBranchDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </motion.button>
                          <AnimatePresence>
                            {showIntroBranchDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className={`absolute left-0 mt-2 w-40 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`} // Increased width
                              >
                                <div className="py-1">
                                  <a href="#" className={`block px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`} onClick={() => { setIsCanvasActive(true); setShowIntroCard(false); }}>Develop</a>
                                  <a href="#" className={`block px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`} onClick={() => { setIsCanvasActive(true); setShowIntroCard(false); }}>Feature/X</a>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      {/* Right Side: New Repo */}
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-base text-stone-500 mb-4">OR</span> {/* Increased font size, mb */}
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className={`px-6 py-3 rounded-md text-base border border-white text-white hover:bg-white hover:text-stone-900 transition-colors`} // Increased padding, font size
                          onClick={() => { setIsCanvasActive(true); setShowIntroCard(false); }}
                        >
                          New Repo
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Thread Area */}
            <div className="relative flex-grow overflow-hidden">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading-spinner"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-solid border-transparent border-t-white"></div>
                      <p className="mt-4 text-white">Loading messages...</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="loaded-messages"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 overflow-y-scroll space-y-4 px-4 pt-4 pb-4"
                  >
                    {aiMessages.map((msg, index) => {
                      const IconComponent = messageTypeIcons[msg.type];
                      const iconColorClass = messageTypeColors[msg.type]?.text;
                      const borderColorClass = messageTypeColors[msg.type]?.border;
                      const bgColorSubtleClass = messageTypeColors[msg.type]?.bg_subtle;

                      const isUserMessage = msg.role === 'user';
                      const isActionRequired = msg.status === 'action_required';
                      const isInProgress = msg.status === 'in_progress';
                      const isSuccess = msg.status === 'success';
                      const isFail = msg.status === 'fail';
                      const isPillMessage = msg.type === 'code' || msg.type === 'microagent_ready' || msg.type === 'build';
                      const canOpenCanvas = canvasChangingMessageTypes.includes(msg.type);


                      // Determine the icon for completion status
                      let CompletionIcon = null;
                      let completionIconColorClass = '';
                      if (isSuccess) {
                        CompletionIcon = CheckCircle;
                        completionIconColorClass = messageTypeColors.success.text;
                      } else if (isFail) {
                        CompletionIcon = CircleX;
                        completionIconColorClass = messageTypeColors.fail.text;
                      }

                      return (
                        <div
                          key={index}
                          className={`flex flex-col ${isUserMessage ? 'items-end' : 'items-start'}`} // Changed to items-end for user messages
                          onMouseEnter={() => setHoveredMessageIndex(index)}
                          onMouseLeave={() => setHoveredMessageIndex(null)}
                        >
                          {/* Message Header (for AI messages only) */}
                          {!isUserMessage && msg.headerText && (
                            <div className={`flex items-start space-x-1 mb-1 ${getThemeClasses('text')} opacity-75 text-xs`}>
                              {IconComponent && (
                                <IconComponent className={`w-3 h-3 ${iconColorClass}`} />
                              )}
                              <span>{msg.headerText}</span>
                            </div>
                          )}

                          <div
                            className={`max-w-[80%] p-3 relative rounded-xl break-words
                              ${isUserMessage ? getThemeClasses('user-message-bg') : getThemeClasses('ai-message-bg')}
                              ${isUserMessage ? getThemeClasses('user-message-text') : getThemeClasses('text')}
                              ${borderColorClass ? `border ${borderColorClass}` : ''}
                              ${isPillMessage ? `${bgColorSubtleClass} border-opacity-50` : ''}
                              text-sm font-light cursor-pointer
                              `}
                          >
                            <div className="flex items-start space-x-2"> {/* Changed items-center to items-start */}
                              {msg.type === 'code' ? (
                                // Added whitespace-pre-wrap for text wrapping
                                <pre className={`w-full overflow-auto rounded-md p-2 whitespace-pre-wrap ${theme === 'dark' ? 'bg-stone-800 text-stone-200' : theme === 'light' ? 'bg-stone-200 text-stone-800' : 'bg-[rgb(215,205,190)] text-[rgb(100,80,60)]'}`}>
                                  <code>{msg.text}</code>
                                </pre>
                              ) : msg.type === 'tetris_game' ? (
                                <TetrisGame theme={theme} getThemeClasses={getThemeClasses} />
                              ) : (
                                <span className={isUserMessage ? '' : 'font-normal'}>
                                  {msg.text}
                                </span>
                              )}

                              {isInProgress && (
                                <Spinner className="w-4 h-4 flex-shrink-0" />
                              )}
                              {CompletionIcon && !isInProgress && (
                                <CompletionIcon className={`w-4 h-4 flex-shrink-0 ${completionIconColorClass}`} />
                              )}
                              {canOpenCanvas && (
                                <ChevronRight className={`w-4 h-4 flex-shrink-0 self-center ${iconColorClass}`} />
                              )}
                            </div>

                            {isActionRequired && msg.actions && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {msg.actions.map((action, actionIdx) => (
                                  <motion.button
                                    key={actionIdx}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    // FIX: Changed template literal to string concatenation to resolve compilation error
                                    className={"px-2 py-1 rounded-md text-xs border " + borderColorClass + " " + iconColorClass + " hover:opacity-80"}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent message click from triggering canvas view change
                                      console.log(`Action: ${action.action}`);
                                      // Add logic for specific actions here
                                    }}
                                  >
                                    {action.label}
                                  </motion.button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Like/Unlike, Copy buttons - only for AI messages, outside the main content div */}
                          {msg.role === 'ai' && (
                            <div className="h-6 mt-2 relative w-full"> {/* Fixed height container for consistent spacing */}
                              <AnimatePresence>
                                {hoveredMessageIndex === index && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`absolute top-0 flex space-x-2 text-xs opacity-75 ${isUserMessage ? 'right-0' : 'left-0'}`}
                                    style={{ pointerEvents: hoveredMessageIndex === index ? 'auto' : 'none' }} // Enable/disable pointer events
                                  >
                                    <motion.button className={`flex items-center ${getThemeClasses('button-text')} hover:text-white`}>
                                      <ThumbsUp className="w-3 h-3" />
                                    </motion.button>
                                    <motion.button className={`flex items-center ${getThemeClasses('button-text')} hover:text-white`}>
                                      <ThumbsDown className="w-3 h-3" />
                                    </motion.button>
                                    <motion.button className={`flex items-center ${getThemeClasses('button-text')} hover:text-white`}>
                                      <Copy className="w-3 h-3" />
                                    </motion.button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Gradient */}
              <div className={`absolute top-0 left-0 right-0 h-16 pointer-events-none z-10 ${theme === 'dark' ? 'bg-gradient-to-b from-stone-900 to-transparent' : theme === 'light' ? 'bg-gradient-to-b from-stone-100 to-transparent' : 'bg-gradient-to-b from-[rgb(235,225,210)] to-transparent'}`}></div>

              {/* Bottom Gradient */}
              <div className={`absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-10 ${theme === 'dark' ? 'bg-gradient-to-t from-stone-900 to-transparent' : theme === 'light' ? 'bg-gradient-to-t from-stone-100 to-transparent' : 'bg-gradient-to-t from-[rgb(235,225,210)] to-transparent'}`}></div>
            </div>

            {/* Error Pill (moved outside the input container) */}
            <AnimatePresence>
              {showErrorPill && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-500 text-white p-2 rounded-md flex items-center justify-between text-xs mx-4 mb-2"
                >
                  <span>An error occurred.</span>
                  <div className="flex items-center space-x-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="border border-white text-white px-2 py-1 rounded-md hover:bg-white hover:text-red-500 transition-colors" onClick={() => setShowErrorPoll(false)}>
                      Retry
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowErrorPoll(false)} className="text-white hover:text-red-200">
                      <X className="w-5 h-5" /> {/* Increased size */}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Message Input and Server Status Container */}
            <div className={`p-2 rounded-xl ${getThemeClasses('input-bg')}`}>
              {/* Message Input Area with border and rounded corners */}
              <div className={`p-2 relative mb-2 border-b ${getThemeClasses('border')}`}>
                <div className="flex items-center">
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Paperclip className={`w-5 h-5 mr-2 ${getThemeClasses('icon-color')} ${getThemeClasses('hover-icon-color')}`} whileHover={{ scale: 1.1 }} />
                  </motion.div>
                  <input
                    type="text"
                    className={`flex-grow ${getThemeClasses('input-bg')} ${getThemeClasses('text')} pl-3 pr-10 py-2 rounded-md focus:outline-none text-sm ${getThemeClasses('placeholder-text')}`}
                    placeholder="What do you want to build?"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />
                  <motion.button
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full flex items-center justify-center ${getThemeClasses('button-bg')} hover:opacity-90 focus:outline-none`}
                    onClick={handleSendMessage}
                  >
                    <Send className={`w-4 h-4 text-white`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} />
                  </motion.button>
                </div>
              </div>

              {/* Server/Agent Status Pill and Pause/Continue Button */}
              <div className={`p-2 flex items-center justify-between text-xs`}>
                <div className="flex items-center space-x-2 relative group cursor-pointer" onClick={() => setShowServerControlDropdown(!showServerControlDropdown)} ref={serverControlDropdownRef}>
                  <span className={`w-2 h-2 rounded-full ${serverStatus === 'active' ? getThemeClasses('status-dot-running') : getThemeClasses('status-dot-stopped')}`}></span>
                  <span className={`${getThemeClasses('status-text')}`}>Server: {serverStatus === 'active' ? 'Running' : serverStatus === 'stopped' ? 'Stopped' : serverStatus === 'thinking' ? 'Thinking' : 'Error'}</span>
                  {showServerControlDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <AnimatePresence>
                    {showServerControlDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute bottom-full left-0 mb-2 w-max rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`}
                      >
                        <div className="py-1">
                          <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className={`block w-full text-left px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}
                            onClick={() => {
                              setServerStatus('stopped');
                              setStatusHoverText('Server is stopped.');
                              setShowErrorPoll(true);
                              setShowServerControlDropdown(false);
                            }}
                          >
                            <div className="flex items-center">
                              <CircleStop className="w-4 h-4 mr-2" /> {/* Added stop icon */}
                              Stop Server & Kill All Processes
                            </div>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full ${getThemeClasses('stop-button-bg-subtle')} ${getThemeClasses('stop-button-text')} hover:opacity-90`}
                  onClick={toggleServerProcess}
                >
                  {serverStatus === 'active' || serverStatus === 'thinking' || serverStatus === 'error' ? (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      <span>Pause Agent</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      <span>Continue</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Git Controls (my-project, main, Push, Pull, Create PR) - NEW LOCATION */}
            <div className="flex items-center space-x-3 p-2 mt-2"> {/* Added mt-2 for spacing */}
                <div className="relative" ref={repoDropdownRef} onMouseEnter={() => setShowRepoDropdown(true)} onMouseLeave={() => setShowRepoDropdown(false)}>
                  <div className="flex items-center space-x-1 text-sm cursor-pointer">
                    <Github className={`w-4 h-4 ${getThemeClasses('button-text')}`} />
                    <span className={`${getThemeClasses('button-text')}`}>my-project</span>
                    {showRepoDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </div>
                  <AnimatePresence>
                    {showRepoDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute left-0 bottom-full mb-2 w-32 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`}
                      >
                        <div className="py-1">
                          <a href="#" className={`block px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}>Repo A</a>
                          <a href="#" className={`block px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}>Repo B</a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative" ref={branchDropdownRef} onMouseEnter={() => setShowBranchDropdown(true)} onMouseLeave={() => setShowBranchDropdown(false)}>
                  <div className="flex items-center space-x-1 text-sm cursor-pointer">
                    <GitBranch className={`w-4 h-4 ${getThemeClasses('button-text')}`} />
                    <span className={`${getThemeClasses('button-text')}`}>main</span>
                    {showBranchDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </div>
                  <AnimatePresence>
                    {showBranchDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute left-0 bottom-full mb-2 w-32 rounded-md shadow-lg ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')} z-20`}
                      >
                        <div className="py-1">
                          <a href="#" className={`block px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}>Develop</a>
                          <a href="#" className={`block px-4 py-2 text-sm ${getThemeClasses('text')} hover:${getThemeClasses('active-button-bg')} hover:${getThemeClasses('active-button-text')}`}>Feature/X</a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${getThemeClasses('pill-button-bg')} ${getThemeClasses('pill-button-text')} hover:opacity-90`}>
                  <ArrowUpToLine className="w-4 h-4" />
                  <span>Push</span>
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${getThemeClasses('pill-button-bg')} ${getThemeClasses('pill-button-text')} hover:opacity-90`}>
                  <GitPullRequest className="w-4 h-4" />
                  <span>Pull</span>
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${getThemeClasses('pill-button-bg')} ${getThemeClasses('pill-button-text')} hover:opacity-90`}>
                  <GitPullRequest className="w-4 h-4" />
                  <span>Create PR</span>
                </motion.button>
              </div>
          </motion.div> {/* Closing motion.div for AI Message Thread Column */}

          {/* Resizer Handle (for message column) - only visible when canvas is active */}
          <AnimatePresence>
            {isCanvasActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-1 ${getThemeClasses('border')} cursor-ew-resize ${getThemeClasses('hover-resizer-bg')} transition-colors duration-200 flex-shrink-0 self-stretch`}
                onMouseDown={handleMouseDown}
              ></motion.div>
            )}
          </AnimatePresence>

          {/* Main Container for the All-Hands UI (canvas) - only visible when canvas is active */}
          <AnimatePresence>
            {isCanvasActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} // Simpler fade out and shrink
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex-grow rounded-xl overflow-hidden flex flex-col ${getThemeClasses('panel-bg')} border ${getThemeClasses('border')}`}
              >
                {/* Header Section */}
                <div className={`flex items-center justify-between p-3 ${getThemeClasses('border')} border-b`}>
                  <div className="flex items-center space-x-2">
                    <span className={`ml-4 text-sm font-semibold ${getThemeClasses('text')}`}>source/app.js</span>
                  </div>
                  {/* Icons and Buttons */}
                  <div className="flex items-center space-x-4">
                    {/* New Lucide Icons */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Code className={`w-5 h-5 ${getThemeClasses('icon-color')} ${getThemeClasses('hover-icon-color')}`} onClick={() => setCurrentCanvasView('code_view')} />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <FileText className={`w-5 h-5 ${getThemeClasses('icon-color')} ${getThemeClasses('hover-icon-color')}`} onClick={() => setCurrentCanvasView('file_structure_view')} />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <GitFork className={`w-5 h-5 ${getThemeClasses('icon-color')} ${getThemeClasses('hover-icon-color')}`} onClick={() => setCurrentCanvasView('changes_view')} />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Globe className={`w-5 h-5 ${getThemeClasses('icon-color')} ${getThemeClasses('hover-icon-color')}`} onClick={() => setCurrentCanvasView('browser_view')} />
                    </motion.div>
                    {/* Console Toggle Icon */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Terminal
                        className={`w-5 h-5 ${getThemeClasses('icon-color')} ${getThemeClasses('hover-icon-color')} ${isConsoleVisible ? 'text-green-400' : ''}`}
                        onClick={() => setIsConsoleVisible(!isConsoleVisible)}
                        title={isConsoleVisible ? "Hide Console" : "Show Console"}
                      />
                    </motion.div>

                    {/* Code, Preview buttons */}
                    <div className={`flex space-x-1 ${getThemeClasses('button-bg')} rounded-md p-1`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1 rounded-md text-xs font-medium ${
                          activeTab === 'Code' ? getThemeClasses('active-button-bg') : getThemeClasses('button-text')
                        } ${activeTab === 'Code' ? getThemeClasses('active-button-text') : ''} hover:opacity-90`}
                        onClick={() => setActiveTab('Code')}
                      >
                        Code
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1 rounded-md text-xs font-medium ${
                          activeTab === 'Preview' ? getThemeClasses('active-button-bg') : getThemeClasses('button-text')
                        } ${activeTab === 'Preview' ? getThemeClasses('active-button-text') : ''} hover:opacity-90`}
                        onClick={() => setActiveTab('Preview')}
                      >
                        Preview
                      </motion.button>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <X
                        className={`w-5 h-5 ${getThemeClasses('icon-color')} ${getThemeClasses('hover-icon-color')}`}
                        onClick={() => setIsCanvasActive(false)} // Closes the canvas as requested
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Content Area (Code Editor / Preview) */}
                <div className="flex-grow p-4 relative"> {/* Added relative positioning */}
                  <AnimatePresence mode="wait">
                    {expandedMessageData ? (
                      <motion.div
                        key="expanded-canvas"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute inset-0 p-4 rounded-xl ${getThemeClasses('input-bg')} ${getThemeClasses('text')} flex flex-col`}
                      >
                        <div className="flex justify-end mb-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => setExpandedMessageData(null)}
                            className={`p-2 rounded-full ${getThemeClasses('button-bg')} hover:opacity-90 focus:outline-none`}
                          >
                            <X className={`w-5 h-5 ${getThemeClasses('icon-color')}`} />
                          </motion.button>
                        </div>
                        <div className="flex-grow overflow-auto">
                          {expandedMessageData.type === 'code' ? (
                            <pre className={`w-full h-full overflow-auto rounded-md p-2 whitespace-pre-wrap ${theme === 'dark' ? 'bg-stone-800 text-stone-200' : theme === 'light' ? 'bg-stone-200 text-stone-800' : 'bg-[rgb(215,205,190)] text-[rgb(100,80,60)]'}`}>
                              <code>{expandedMessageData.text}</code>
                            </pre>
                          ) : (
                            <p className="font-normal">{expandedMessageData.text}</p>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="main-canvas"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-grow w-full h-full" // Ensure it takes full space
                      >
                        {renderCanvasContent()}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Canvas Error Modal (Moved to be a child of the main canvas container) */}
                  <AnimatePresence>
                    {showCanvasErrorModal && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg shadow-xl w-80 text-center z-50"
                        style={{ backgroundColor: theme === 'dark' ? '#292524' : theme === 'light' ? '#f5f5f4' : 'rgb(235,225,210)', border: `1px solid ${theme === 'dark' ? '#57534e' : theme === 'light' ? '#a8a29e' : 'rgb(180,160,140)'}` }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          className={`absolute top-2 right-2 p-1 rounded-full ${getThemeClasses('button-bg')} hover:opacity-90 focus:outline-none`}
                          onClick={() => setShowCanvasErrorModal(false)}
                        >
                          <X className={`w-5 h-5 ${getThemeClasses('icon-color')}`} />
                        </motion.button>
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <AlertCircle className={`w-8 h-8 ${messageTypeColors.error.text}`} />
                          <h3 className={`text-lg font-semibold ${getThemeClasses('text')}`}>Something went wrong</h3>
                          <p className={`text-sm ${getThemeClasses('text')} opacity-80`}>There was a problem when running your code.</p>
                          <div className="flex space-x-2 mt-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className={`px-2 py-1 rounded-md text-xs border ${messageTypeColors.error.border} ${messageTypeColors.error.text} hover:opacity-80`}
                              onClick={() => { console.log('Fix error clicked'); setShowCanvasErrorModal(false); }}
                            >
                              Fix error
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className={`px-2 py-1 rounded-md text-xs border ${getThemeClasses('button-bg')} ${getThemeClasses('button-text')} hover:opacity-80`}
                              onClick={() => { console.log('Show console clicked'); setShowCanvasErrorModal(false); setIsConsoleVisible(true); }}
                            >
                              Show console
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>


                {/* Console Resizer Handle */}
                {isConsoleVisible && (
                  <div
                    className={`h-1 ${getThemeClasses('border')} cursor-ns-resize ${getThemeClasses('hover-resizer-bg')} transition-colors duration-200 flex-shrink-0`}
                    onMouseDown={handleConsoleMouseDown}
                  ></div>
                )}

                {/* Console Section */}
                <AnimatePresence>
                  {isConsoleVisible && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: consoleHeight }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 ${getThemeClasses('border')} border-t overflow-hidden`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold ${getThemeClasses('text')}`}>Console</span>
                        {/* Console controls/icons */}
                        <div className="flex space-x-2">
                          {/* Removed Eraser Icon */}
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsConsoleVisible(!isConsoleVisible)} className={`${getThemeClasses('icon-color')} ${getThemeClasses('hover-icon-color')}`}>
                            {isConsoleVisible ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          </motion.button>
                        </div>
                      </div>
                      <div
                        className={`w-full ${getThemeClasses('input-bg')} ${getThemeClasses('placeholder-text')} p-3 rounded-md overflow-auto font-mono text-xs font-light`}
                        style={{ height: `${consoleHeight}px` }}
                      >
                        {consoleOutput.split('\n').map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
