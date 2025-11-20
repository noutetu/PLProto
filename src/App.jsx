import { useState, useEffect, useRef } from 'react'
import './App.css'
import { audioManager } from './audio/AudioContextManager';

// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;
const SCROLL_SPEED = 10000; // Pixels per second
const BPM = 120; // Beats per minute
const BEAT_INTERVAL = 60 / BPM;

// Game States
const SCREEN_TITLE = 'TITLE';
const SCREEN_GAME = 'GAME';
const SCREEN_RESULT = 'RESULT';

function App() {
  const [screen, setScreen] = useState(SCREEN_TITLE);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState({ score: 0, missCount: 0, clear: false });

  const startGame = () => {
    audioManager.init(); // Initialize AudioContext on user gesture
    setScreen(SCREEN_GAME);
  };

  const endGame = (finalScore, isClear, missCount) => {
    setLastResult({ score: finalScore, clear: isClear, missCount: missCount || 0 });
    setScreen(SCREEN_RESULT);
    if (isClear) {
      audioManager.playSynthSFX('clear');
    }
  };

  const toTitle = () => {
    setScreen(SCREEN_TITLE);
  };

  return (
    <div className="app-container">
      {screen === SCREEN_TITLE && <TitleScreen onStart={startGame} />}
      {screen === SCREEN_GAME && <GameScreen onEnd={endGame} />}
      {screen === SCREEN_RESULT && <ResultScreen result={lastResult} onRetry={startGame} onTitle={toTitle} />}
    </div>
  )
}

function TitleScreen({ onStart }) {
  return (
    <div className="screen title-screen">
      <div className="ecg-monitor">
        <div className="monitor-header">
          <span className="bpm-display">BPM: 120</span>
          <span className="status-ready">● READY</span>
        </div>
        <h1 className="game-title">HEARTBEAT RUNNER</h1>
        <div className="ecg-line-container">
          <svg className="ecg-line" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* 
              3 Distinct Patterns looping (Diverse Shapes):
              Pattern A: Standard Sharp (P -> QRS -> T)
              Pattern B: M-shaped R-wave (RSR') + Inverted T-wave
              Pattern C: Deep Q-wave start (QS) + Tall R
            */}
            <polyline className="heartbeat" points="
              0,50
              100,50
              120,48 130,50 140,48 150,50
              200,50 220,50 240,40 260,10 280,40 300,90 320,50 340,40 360,50
              400,50 420,40 440,50
              500,50

              600,50
              620,48 630,50 640,48 650,50
              700,50 720,50 740,40 760,10 770,40 780,15 800,50 820,50
              860,50 880,60 900,50
              1000,50

              1100,50
              1120,48 1130,50 1140,48 1150,50
              1200,50 1220,50 1240,80 1260,10 1280,50 1300,50
              1340,50 1360,40 1380,50
              1500,50

              1600,50
              1620,48 1630,50 1640,48 1650,50
              1700,50 1720,50 1740,40 1760,10 1780,40 1800,90 1820,50 1840,40 1860,50
              1900,50 1920,40 1940,50
              2000,50

              2100,50
              2120,48 2130,50 2140,48 2150,50
              2200,50 2220,50 2240,40 2260,10 2270,40 2280,15 2300,50 2320,50
              2360,50 2380,60 2400,50
              2500,50
            " filter="url(#glow)">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="-1500 0"
                dur="6s"
                repeatCount="indefinite"
              />
            </polyline>
          </svg>
        </div>
        <p className="subtitle">CARDIAC RHYTHM RUNNER</p>
      </div>

      <div className="game-instructions">
        <div className="instruction-section">
          <h3>操作(ジャンプ)</h3>
          <p><strong>PC:</strong> スペース または 左クリック</p>
          <p><strong>スマートフォン:</strong> 画面タップ</p>
        </div>

        <div className="instruction-section">
          <h3>ガイド</h3>
          <p><span style={{ color: '#ffffff' }}>■</span> 白い障害物を避けよう</p>
        </div>

        <p className="audio-warning">※ 音声必須</p>
      </div>

      <button className="start-btn" onClick={onStart}>
        <span className="btn-icon">▶</span> START MONITORING
      </button>
    </div>
  );
}


function ResultScreen({ result, onRetry, onTitle }) {
  const getResultStatus = () => {
    if (!result.clear) return { title: "RANK C", color: "#ff0000", status: "FAILED" };
    if (result.missCount === 0) return { title: "RANK PERFECT", color: "#00ffff", status: "PERFECT" };
    if (result.missCount <= 2) return { title: "RANK A", color: "#00ff41", status: "EXCELLENT" };
    return { title: "RANK B", color: "#ffff00", status: "GOOD" };
  };

  const { title, color, status } = getResultStatus();

  return (
    <div className="screen result-screen">
      <div className="result-monitor" style={{ borderColor: color, boxShadow: `0 0 30px ${color}66, inset 0 0 30px ${color}1a` }}>
        <div className="result-header">
          <span className="timestamp" style={{ color: color }}>{new Date().toLocaleTimeString()}</span>
          <span className="status" style={{ color: color }}>● {status}</span>
        </div>
        <h2 className="result-title" style={{ color: color, textShadow: `0 0 10px ${color}` }}>
          {title}
        </h2>
        <div className="ecg-result">
          <svg className="ecg-line" viewBox="0 0 800 100" preserveAspectRatio="none">
            {result.clear ? (
              <polyline className="heartbeat" points="0,50 100,50 120,50 130,20 140,80 150,50 200,50 300,50 320,50 330,20 340,80 350,50 400,50 800,50" />
            ) : (
              <polyline className="flatline" points="0,50 800,50" />
            )}
          </svg>
        </div>

        {/* Main Score - Distance & Miss */}
        <div className="main-score">
          <div className="score-item">
            <div className="score-label">DISTANCE</div>
            <div className="score-value">
              {Math.floor(result.score)} <span className="unit">m</span>
            </div>
          </div>
          <div className="score-item">
            <div className="score-label">MISS</div>
            <div className="score-value">
              {result.missCount}
            </div>
          </div>
        </div>

        {/* Secondary Info */}
        <div className="secondary-info">
          <div className="info-item">
            <span className="info-label">BPM</span>
            <span className="info-value">120</span>
          </div>
          <div className="info-item">
            <span className="info-label">STATUS</span>
            <span className="info-value" style={{ color: color }}>{status}</span>
          </div>
        </div>
      </div>
      <div className="actions">
        <button className="retry-btn" onClick={onRetry}>
          <span className="btn-icon">↻</span> RETRY
        </button>
        <button className="title-btn" onClick={onTitle}>
          <span className="btn-icon">◀</span> MENU
        </button>
      </div>
    </div>
  );
}

function GameScreen({ onEnd }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const gameState = useRef({
    startTime: 0,
    player: { y: 0, velocity: 0, isJumping: false },
    obstacles: [],
    guides: [],
    score: 0,
    missCount: 0,
    life: 5,
    beatTime: 0,
    nextBeat: 0,
    beatCount: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Start Drum Loop and sync game start time
    const firstBeatTime = audioManager.startDrumLoop(BPM);

    // Initialize Game State
    gameState.current = {
      startTime: firstBeatTime, // Sync with audio
      player: { x: 100, y: 300, width: 30, height: 30, velocity: 0, isJumping: false, groundY: 300 },
      obstacles: [],
      guides: [], // { x, type: 'rhythm' | 'jump', hit: false }
      score: 0,
      missCount: 0,
      life: 5,
      beatTime: 0,
      nextBeat: 0,
      beatCount: 0,
      distance: 0,
      flash: { color: null, intensity: 0 },
      screenShake: { x: 0, y: 0, intensity: 0 },
      particles: [],
      trail: [],
      scoreDisplay: 0,
      backgroundOffset: 0,
      stars: [] // Starfield
    };

    // Generate starfield
    for (let i = 0; i < 200; i++) {
      gameState.current.stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        z: Math.random(), // Depth (0 = far, 1 = near)
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.5
      });
    }

    // Generate initial pattern
    // In a real game, this would be parsed from a map file
    const generateLevel = () => {
      const pattern = [];
      const totalDuration = 120; // 2 minutes

      // Helper function to add notes at specific time intervals
      const addNote = (time, type) => {
        const x = 100 + time * SCROLL_SPEED;
        pattern.push({ type, x, time, y: 315 });
      };

      const addObstacle = (time) => {
        const x = 100 + time * SCROLL_SPEED;
        pattern.push({ type: 'obstacle', x: x + 400, width: 40, height: 40 });
      };

      // Define rhythm patterns (each is 4 beats)
      // Each pattern is an array of note timings within 4 beats
      const rhythmPatterns = [
        // Pattern 0: Simple quarter notes
        [0, 1, 2],
        // Pattern 1: Quarter + eighth notes
        [0, 1, 1.5, 2],
        // Pattern 2: Eighth note pairs
        [0, 0.5, 1, 1.5, 2],
        // Pattern 3: Sixteenth note burst at start
        [0, 0.25, 0.5, 0.75, 1, 2],
        // Pattern 4: Syncopated rhythm
        [0, 0.5, 1.5, 2],
        // Pattern 5: Dense eighths
        [0, 0.5, 1, 1.5, 2, 2.5],
        // Pattern 6: Sixteenth triplets
        [0, 0.33, 0.66, 1, 2],
        // Pattern 7: Mixed density
        [0, 0.25, 0.5, 1, 2],
        // Pattern 8: Sparse with burst
        [0, 1.75, 2, 2.25, 2.5, 2.75],
        // Pattern 9: Galloping rhythm
        [0, 0.25, 1, 1.25, 2],
        // Pattern 10: Double time
        [0, 0.5, 1, 1.5, 2, 2.5],
        // Pattern 11: Sixteenth run
        [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        // Pattern 12: Off-beat emphasis
        [0.5, 1, 1.5, 2, 2.5],
        // Pattern 13: Complex syncopation
        [0, 0.25, 0.75, 1.5, 2, 2.75],
        // Pattern 14: Rapid fire
        [0, 0.125, 0.25, 0.375, 0.5, 1, 2],
        // Pattern 15: Swing feel
        [0, 0.66, 1, 1.66, 2]
      ];

      let currentTime = 0;
      let measureCount = 0;

      while (currentTime < totalDuration) {
        // Select pattern based on progression
        let patternIndex;
        if (measureCount < 8) {
          // Early game: simpler patterns (0-3)
          patternIndex = Math.floor(Math.random() * 4);
        } else if (measureCount < 16) {
          // Mid game: medium complexity (0-7)
          patternIndex = Math.floor(Math.random() * 8);
        } else if (measureCount < 24) {
          // Late-mid game: higher complexity (0-11)
          patternIndex = Math.floor(Math.random() * 12);
        } else {
          // End game: all patterns
          patternIndex = Math.floor(Math.random() * rhythmPatterns.length);
        }

        const selectedPattern = rhythmPatterns[patternIndex];
        const measureStartTime = currentTime;

        // Add rhythm notes for this measure
        selectedPattern.forEach(offset => {
          const noteTime = measureStartTime + offset * BEAT_INTERVAL;
          if (noteTime < totalDuration) {
            addNote(noteTime, 'rhythm');
          }
        });

        // Add jump guide on beat 3 (index 2)
        const jumpTime = measureStartTime + 2 * BEAT_INTERVAL;
        if (jumpTime < totalDuration) {
          addNote(jumpTime, 'jump');
        }

        // Add obstacle on beat 4 (index 3)
        const obstacleTime = measureStartTime + 3 * BEAT_INTERVAL;
        if (obstacleTime < totalDuration) {
          addObstacle(obstacleTime);
        }

        // Move to next measure (4 beats)
        currentTime += 4 * BEAT_INTERVAL;
        measureCount++;
      }

      return pattern;
    };

    const levelData = generateLevel();
    gameState.current.guides = levelData.filter(d => d.type !== 'obstacle');
    gameState.current.obstacles = levelData.filter(d => d.type === 'obstacle');


    const update = () => {
      const now = audioManager.getRawTime();
      const currentSongTime = now - gameState.current.startTime;
      gameState.current.distance = currentSongTime * SCROLL_SPEED;

      // Player Physics
      const player = gameState.current.player;
      if (player.isJumping) {
        player.velocity += 8000 * 0.016; // Stronger Gravity for faster game
        player.y += player.velocity * 0.016;

        if (player.y >= player.groundY) {
          player.y = player.groundY;
          player.isJumping = false;
          player.velocity = 0;
        }
      }

      // Flash Decay
      if (gameState.current.flash.intensity > 0) {
        gameState.current.flash.intensity -= 0.04; // Slower fade out
        if (gameState.current.flash.intensity < 0) gameState.current.flash.intensity = 0;
      }

      // Screen Shake Decay
      if (gameState.current.screenShake.intensity > 0) {
        gameState.current.screenShake.intensity -= 0.5;
        if (gameState.current.screenShake.intensity < 0) gameState.current.screenShake.intensity = 0;
        gameState.current.screenShake.x = (Math.random() - 0.5) * gameState.current.screenShake.intensity;
        gameState.current.screenShake.y = (Math.random() - 0.5) * gameState.current.screenShake.intensity;
      }

      // Update Particles
      gameState.current.particles = gameState.current.particles.filter(p => {
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.vy += 500 * 0.016; // Gravity
        p.life -= 0.02;
        return p.life > 0;
      });

      // Update Trail
      gameState.current.trail.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        life: 1.0
      });
      gameState.current.trail = gameState.current.trail.filter(t => {
        t.life -= 0.05;
        return t.life > 0;
      });

      // Update Score Display (smooth animation)
      const targetScore = Math.floor(gameState.current.distance / 100);
      gameState.current.scoreDisplay += (targetScore - gameState.current.scoreDisplay) * 0.1;

      // Update Background Offset
      gameState.current.backgroundOffset = (gameState.current.distance * 0.5) % 100;

      // Update Stars (parallax scrolling)
      const speed = SCROLL_SPEED / 60; // Convert to per-frame speed
      gameState.current.stars.forEach(star => {
        // Stars move based on depth (z) - closer stars move faster
        star.x -= speed * star.z * 0.5;

        // Wrap around when star goes off screen
        if (star.x < -10) {
          star.x = GAME_WIDTH + 10;
          star.y = Math.random() * GAME_HEIGHT;
          star.z = Math.random();
        }

        // Twinkle effect
        star.brightness = 0.5 + Math.sin(Date.now() * 0.001 + star.x) * 0.3;
      });

      // Guide Overlap Check (for Flash & Sound)
      gameState.current.guides.forEach(g => {
        const screenX = g.x - gameState.current.distance;
        // Check if guide is roughly at player position (x=100)
        // Player width 30, x=100. Center approx 115.
        // Widened range for high-speed scrolling
        if (!g.triggered && Math.abs(screenX - 115) < 100) {
          g.triggered = true;

          // Enhanced effects based on guide type
          const isJumpGuide = g.type === 'jump';
          const color = isJumpGuide ? '#00ff00' : '#ffff00';

          // Screen shake (stronger for jump guides)
          gameState.current.screenShake = {
            x: 0,
            y: 0,
            intensity: isJumpGuide ? 5 : 3
          };

          // Flash effect (stronger for jump guides)
          gameState.current.flash = {
            color: color,
            intensity: isJumpGuide ? 1.0 : 0.8
          };

          // Create particles from guide position
          const numParticles = isJumpGuide ? 16 : 8;
          for (let i = 0; i < numParticles; i++) {
            const angle = (Math.PI * 2 * i) / numParticles;
            const speed = isJumpGuide ? 300 : 200;
            gameState.current.particles.push({
              x: player.x + player.width / 2,  // Player center X
              y: player.y + player.height / 2, // Player center Y
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              color: color
            });
          }

          // Play Sound (different for jump guides)
          if (isJumpGuide) {
            audioManager.playSynthSFX('warning'); // ECG warning beep for jump
          } else {
            audioManager.playSynthSFX('rhythm'); // Normal rhythm sound
          }
        }
      });

      // Collision Detection
      // Obstacles
      gameState.current.obstacles.forEach(obs => {
        if (obs.hit) return; // Skip already hit obstacles

        const obsScreenX = obs.x - gameState.current.distance;

        // X-axis collision check - widened range for high-speed scrolling
        // Check if obstacle is near player position (x=100, width=30, center ~115)
        const xCollision = Math.abs(obsScreenX + obs.width / 2 - 115) < 100;

        // Y-axis collision check: if player is on ground (not jumping high enough)
        // Obstacle is at ground level (y=330), height 40, so top is at y=290
        // Player needs to be above y=290 to clear it
        const yCollision = player.y + player.height > 330 - obs.height;

        if (xCollision && yCollision) {
          obs.hit = true;
          gameState.current.life--;
          gameState.current.missCount++;
          gameState.current.flash = { color: 'red', intensity: 1.0 }; // Max intensity for hit
          audioManager.playSynthSFX('hit');
        }
      });

      // Check Game Over
      if (gameState.current.life <= 0) {
        const finalScore = Math.floor(gameState.current.distance / 100);
        onEnd(finalScore, false, gameState.current.missCount);
        return; // Stop loop
      }

      // Check Clear (End of song)
      if (currentSongTime > 120) { // 120 seconds
        const finalScore = Math.floor(gameState.current.distance / 100);
        onEnd(finalScore, true, gameState.current.missCount);
        return;
      }

      draw(ctx, currentSongTime);
      requestRef.current = requestAnimationFrame(update);
    };

    const draw = (ctx, currentSongTime) => {
      // Apply screen shake
      ctx.save();
      ctx.translate(gameState.current.screenShake.x, gameState.current.screenShake.y);

      // Clear
      ctx.fillStyle = 'black';
      ctx.fillRect(-20, -20, GAME_WIDTH + 40, GAME_HEIGHT + 40);

      // ECG Monitor Background

      // Grid paper pattern
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
      ctx.lineWidth = 1;

      // Horizontal lines (like ECG paper)
      for (let y = 0; y < GAME_HEIGHT; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_WIDTH, y);
        ctx.stroke();
      }

      // Vertical time markers
      const timeOffset = (gameState.current.distance * 0.2) % 50;
      for (let x = -timeOffset; x < GAME_WIDTH + 50; x += 50) {
        ctx.strokeStyle = x % 100 === 0 ? 'rgba(0, 255, 65, 0.2)' : 'rgba(0, 255, 65, 0.1)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_HEIGHT);
        ctx.stroke();
      }

      // ECG heartbeat line running across top
      const ecgOffset = (gameState.current.distance * 0.5) % 200;
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = -ecgOffset; x < GAME_WIDTH + 200; x += 200) {
        // Baseline
        ctx.moveTo(x, 50);
        ctx.lineTo(x + 80, 50);
        // P wave
        ctx.lineTo(x + 90, 45);
        ctx.lineTo(x + 100, 50);
        // QRS complex (sharp spike)
        ctx.lineTo(x + 110, 50);
        ctx.lineTo(x + 115, 20);
        ctx.lineTo(x + 120, 80);
        ctx.lineTo(x + 125, 50);
        // T wave
        ctx.lineTo(x + 140, 45);
        ctx.lineTo(x + 150, 50);
        ctx.lineTo(x + 200, 50);
      }
      ctx.stroke();

      // Rhythm pulse indicator
      const beatPhase = (gameState.current.distance / (SCROLL_SPEED * BEAT_INTERVAL)) % 1;
      if (beatPhase < 0.1) {
        const pulseAlpha = (1 - beatPhase / 0.1) * 0.3;
        ctx.fillStyle = `rgba(0, 255, 65, ${pulseAlpha})`;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      }

      // Draw Floor
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 330);
      ctx.lineTo(GAME_WIDTH, 330);
      ctx.stroke();

      // Draw Player Trail
      gameState.current.trail.forEach((t, i) => {
        ctx.fillStyle = `rgba(0, 255, 255, ${t.life * 0.3})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Guides (skip triggered ones)
      gameState.current.guides.forEach(g => {
        if (g.triggered) return; // Don't draw if already triggered

        const screenX = g.x - gameState.current.distance;
        if (screenX > -50 && screenX < GAME_WIDTH + 50) {
          ctx.fillStyle = g.type === 'jump' ? '#00ff00' : '#ffff00';
          ctx.beginPath();
          ctx.arc(screenX, g.y, 10, 0, Math.PI * 2); // Use g.y
          ctx.fill();

          // Glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Obstacles (skip hit ones)
      gameState.current.obstacles.forEach(obs => {
        if (obs.hit) return; // Don't draw if already hit

        const screenX = obs.x - gameState.current.distance;
        if (screenX > -50 && screenX < GAME_WIDTH + 50) {
          // Glow effect for obstacles
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'white';
          ctx.fillStyle = 'white';
          ctx.fillRect(screenX, 330 - obs.height, obs.width, obs.height);
          ctx.shadowBlur = 0;

          // Danger indicator
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.lineWidth = 2;
          ctx.strokeRect(screenX - 2, 330 - obs.height - 2, obs.width + 4, obs.height + 4);
        }
      });

      // Draw Particles
      gameState.current.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw Player
      const p = gameState.current.player;
      ctx.fillStyle = 'cyan';
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'cyan';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.shadowBlur = 0;

      // Draw Edge Flash
      if (gameState.current.flash.intensity > 0) {
        const intensity = Math.min(gameState.current.flash.intensity, 1.0);
        const color = gameState.current.flash.color;

        ctx.save();
        ctx.globalCompositeOperation = 'screen'; // Additive blending for glow

        // Vignette effect - Stronger and wider, but clear center
        // Inner radius 0, Outer radius GAME_WIDTH
        const gradient = ctx.createRadialGradient(GAME_WIDTH / 2, GAME_HEIGHT / 2, 0, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0, 'transparent'); // Center 30% is clear (reduced from 50%)
        gradient.addColorStop(1, color); // Edges are colored

        ctx.globalAlpha = intensity;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        ctx.restore();
      }

      ctx.restore(); // Restore from screen shake

      // Draw UI - Medical Monitor Style
      ctx.fillStyle = '#00ff41';
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.shadowBlur = 3;
      ctx.shadowColor = '#00ff41';

      // Heart rate zones (life display)
      // Heart rate zones (life display)
      const life = gameState.current.life;
      const lifeColor = life >= 4 ? '#00ff41' : // High (4-5) Green
        life >= 2 ? '#ffff00' : '#ff0000';      // Medium (2-3) Yellow / Low (1) Red
      ctx.fillStyle = lifeColor;
      const lifeString = "●".repeat(Math.max(0, life));
      ctx.fillText(`LIFE: ${lifeString}`, 20, 30);

      // BPM display
      ctx.fillStyle = '#00ff41';
      ctx.fillText(`BPM: 120`, 20, 55);

      // Distance/Score
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillText(`DIST: ${Math.floor(gameState.current.scoreDisplay)}m`, 20, 85);
      ctx.shadowBlur = 0;

      // Time elapsed
      const elapsed = Math.floor(currentSongTime);
      ctx.font = '14px "Courier New", monospace';
      ctx.fillStyle = '#00ff41';
      ctx.fillText(`TIME: ${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`, GAME_WIDTH - 120, 30);
    };

    requestRef.current = requestAnimationFrame(update);

    // Input Handler
    const handleInput = (e) => {
      if (e.code === 'Space' || e.type === 'touchstart' || e.type === 'mousedown') {
        if (!gameState.current.player.isJumping) {
          gameState.current.player.isJumping = true;
          gameState.current.player.velocity = -1500; // Jump force

          // Special jump effects
          gameState.current.screenShake = { x: 0, y: 0, intensity: 8 };
          gameState.current.flash = { color: 'white', intensity: 1.2 };

          // Create particles
          for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            gameState.current.particles.push({
              x: gameState.current.player.x + 15,
              y: gameState.current.player.y + 15,
              vx: Math.cos(angle) * 200,
              vy: Math.sin(angle) * 200 - 100,
              life: 1.0,
              color: 'cyan'
            });
          }

          audioManager.playSynthSFX('jump');
        }
      }
    };

    window.addEventListener('keydown', handleInput);
    window.addEventListener('touchstart', handleInput);
    window.addEventListener('mousedown', handleInput);

    return () => {
      cancelAnimationFrame(requestRef.current);
      audioManager.stopDrumLoop();
      window.removeEventListener('keydown', handleInput);
      window.removeEventListener('touchstart', handleInput);
      window.removeEventListener('mousedown', handleInput);
    };
  }, [onEnd]);

  return <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} style={{ width: '100%', maxWidth: '800px', border: '1px solid #333' }} />;
}

export default App
