
import { PieceType, Color, Position } from '../types';

// Simple synthesizer for game sounds using Web Audio API

// Safe access to AudioContext
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  // Try to resume if suspended (browsers auto-suspend audio contexts until user interaction)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const playSound = (type: 'move' | 'capture' | 'select' | 'win') => {
  const ctx = initAudio();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'move') {
    // "Thock" sound - distinct wooden knock
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.start(t);
    osc.stop(t + 0.1);

  } else if (type === 'capture') {
    // "Crack" sound - sharper and louder
    osc.type = 'square';
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    
    osc.start(t);
    osc.stop(t + 0.15);
    
    // Layer a low thud for impact
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(100, t);
    osc2.frequency.linearRampToValueAtTime(30, t + 0.2);
    
    gain2.gain.setValueAtTime(0.4, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    
    osc2.start(t);
    osc2.stop(t + 0.2);

  } else if (type === 'select') {
    // Soft high "blip"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    
    osc.start(t);
    osc.stop(t + 0.05);

  } else if (type === 'win') {
    // Victory arpeggio
    const now = t;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
    
    notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        
        o.type = 'sine';
        o.frequency.value = freq;
        
        g.gain.setValueAtTime(0.1, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
        
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.5);
    });
  }
};

// --- TTS Logic for Chinese Xiangqi Notation ---

const PIECE_NAMES: Record<string, string> = {
  'red-general': '帅', 'black-general': '将',
  'red-advisor': '仕', 'black-advisor': '士',
  'red-elephant': '相', 'black-elephant': '象',
  'red-horse': '马', 'black-horse': '马',
  'red-chariot': '车', 'black-chariot': '车',
  'red-cannon': '炮', 'black-cannon': '炮',
  'red-soldier': '兵', 'black-soldier': '卒',
};

const CHINESE_NUMS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

export const speakMove = (
  pieceType: PieceType, 
  color: Color, 
  from: Position, 
  to: Position
) => {
  if (!('speechSynthesis' in window)) return;

  // 1. Piece Name
  const pieceName = PIECE_NAMES[`${color}-${pieceType}`];

  // 2. Coordinates & Direction
  // Red: X 0-8 (Left to Right visually) -> Files 9 to 1 (Right to Left standard)
  // Black: X 0-8 (Left to Right visually) -> Files 1 to 9 (Left to Right standard)
  
  let startColStr = '';
  let endColOrStepsStr = '';
  let dirStr = '';

  const isRed = color === 'red';
  
  // Columns for logic (1-9)
  const redCol = 9 - from.x;
  const blackCol = from.x + 1;
  const startCol = isRed ? redCol : blackCol;

  const targetRedCol = 9 - to.x;
  const targetBlackCol = to.x + 1;
  const targetCol = isRed ? targetRedCol : targetBlackCol;

  // Format Start Column
  startColStr = isRed ? CHINESE_NUMS[startCol] : startCol.toString();

  // Determine Direction
  const dy = to.y - from.y;
  const dx = to.x - from.x;

  if (dy === 0) {
    dirStr = '平';
    endColOrStepsStr = isRed ? CHINESE_NUMS[targetCol] : targetCol.toString();
  } else {
    // Vertical Movement
    // Red: y9 -> y0 is Forward (negative dy)
    // Black: y0 -> y9 is Forward (positive dy)
    const isMovingForward = isRed ? dy < 0 : dy > 0;
    dirStr = isMovingForward ? '进' : '退';

    // Logic for linear pieces (Chariot, Cannon, Soldier, General) moving vertically: Count Steps
    // Logic for diagonal pieces (Horse, Elephant, Advisor): Use Target Column
    const isLinearMover = ['chariot', 'cannon', 'soldier', 'general'].includes(pieceType);

    if (isLinearMover) {
      const steps = Math.abs(dy);
      endColOrStepsStr = isRed ? CHINESE_NUMS[steps] : steps.toString();
    } else {
      endColOrStepsStr = isRed ? CHINESE_NUMS[targetCol] : targetCol.toString();
    }
  }

  const text = `${pieceName}${startColStr}${dirStr}${endColOrStepsStr}`;

  // Speak
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 1.0; 
  window.speechSynthesis.speak(utterance);
};
