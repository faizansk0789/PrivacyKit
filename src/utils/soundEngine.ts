/**
 * Web Audio API synthesizer for clean, subtle UI sound feedback and haptics.
 * Operates 100% locally with zero external audio assets.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let hapticEnabled = true;

// Initialize or get the AudioContext safely
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('privacykit_sound_enabled');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  }
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('privacykit_sound_enabled', enabled ? 'true' : 'false');
  }
}

export function toggleSound(): boolean {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  if (next) {
    playPop();
  }
  return next;
}

export function isHapticEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('privacykit_haptic_enabled');
    if (saved !== null) {
      hapticEnabled = saved === 'true';
    }
  }
  return hapticEnabled;
}

export function setHapticEnabled(enabled: boolean): void {
  hapticEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('privacykit_haptic_enabled', enabled ? 'true' : 'false');
  }
}

export function toggleHaptic(): boolean {
  const next = !isHapticEnabled();
  setHapticEnabled(next);
  if (next) {
    triggerHaptic(3);
  }
  return next;
}

/**
 * Trigger subtle, restrained tactile haptic vibrations.
 * Applies a 0.35x scale factor (capped to gentle micro-pulses) to drastically reduce vibration intensity site-wide.
 * Respects the user's haptic toggle setting.
 */
export function triggerHaptic(duration: number | number[] = 6): void {
  if (!isHapticEnabled()) return;
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (Array.isArray(duration)) {
        // Scale down pattern intervals for soft, whisper-quiet micro-vibrations
        const softenedPattern = duration.map((val, idx) =>
          idx % 2 === 0 ? Math.max(1, Math.round(val * 0.3)) : Math.round(val * 0.6)
        );
        navigator.vibrate(softenedPattern);
      } else {
        // Scale down single vibration duration to gentle micro-tap (max 6ms)
        const softMs = Math.max(1, Math.min(6, Math.round(duration * 0.35)));
        navigator.vibrate(softMs);
      }
    } catch (e) {
      // Ignored if vibration is not supported or blocked
    }
  }
}

/**
 * Micro click / button press pop
 */
export function playPop(): void {
  if (!isSoundEnabled()) return;
  triggerHaptic(4);
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    // Ignore audio playback errors
  }
}

/**
 * Ultra-light hover blip
 */
export function playHover(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.025);

    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch (e) {
    // Ignore
  }
}

/**
 * Subtle tactile 'click-clack' audio feedback for neomorphic clay-card hover states.
 * Synthesizes a delicate dual-transient mechanical thud/tick evoking extruded physical tactile surfaces.
 */
let lastClickClackTime = 0;

export function playClayCardHover(): void {
  if (!isSoundEnabled()) return;
  
  // Rate-limit click-clack so rapid mouse sweeps remain crisp, musical and never muddy
  const currentTimeMs = Date.now();
  if (currentTimeMs - lastClickClackTime < 65) {
    return;
  }
  lastClickClackTime = currentTimeMs;

  triggerHaptic(5);
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Transient 1: Initial crisp 'click' impulse (micro snappy contact)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const filter1 = ctx.createBiquadFilter();

    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(1200, now);
    filter1.Q.setValueAtTime(3.5, now);

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(860, now);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.016);

    gain1.gain.setValueAtTime(0.028, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.018);

    // Transient 2: Subtle hollow resonant 'clack' body (occurring ~18ms later)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const filter2 = ctx.createBiquadFilter();

    const t2 = now + 0.014;

    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(900, t2);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(420, t2);
    osc2.frequency.exponentialRampToValueAtTime(180, t2 + 0.024);

    gain2.gain.setValueAtTime(0.022, t2);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.024);

    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(t2);
    osc2.stop(t2 + 0.026);
  } catch (e) {
    // Ignore audio errors gracefully
  }
}

/**
 * Satisfying crisp success chime for completing tasks/scans
 */
export function playSuccess(): void {
  if (!isSoundEnabled()) return;
  triggerHaptic(20);
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.045, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch (e) {
    // Ignore
  }
}

/**
 * Quick toggle switch sound
 */
export function playToggle(state?: boolean): void {
  if (!isSoundEnabled()) return;
  triggerHaptic(12);
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    const startFreq = state ? 350 : 550;
    const endFreq = state ? 650 : 280;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    // Ignore
  }
}

/**
 * Futuristic radar sweep sound for privacy audits
 */
export function playSweep(): void {
  if (!isSoundEnabled()) return;
  triggerHaptic(15);
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    // Ignore
  }
}

/**
 * Error / warning sound
 */
export function playError(): void {
  if (!isSoundEnabled()) return;
  triggerHaptic([30, 50, 30]);
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    // Ignore
  }
}
