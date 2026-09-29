export const YUSONG_SOUND_STORAGE_KEY = "pilares-de-atlas:sound-muted";

export function readYusongSoundMuted(storage = globalThis.localStorage) {
  try {
    return storage?.getItem(YUSONG_SOUND_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeYusongSoundMuted(muted, storage = globalThis.localStorage) {
  const value = Boolean(muted);
  try {
    storage?.setItem(YUSONG_SOUND_STORAGE_KEY, String(value));
    return { ok: true, muted: value };
  } catch (error) {
    return { ok: false, muted: value, error };
  }
}

let audioContext = null;

// Compatibility behavior from the owner-supplied Pilares project: feedback is
// synthesized locally and never downloads an audio asset.
export function playYusongRollSound(result, { windowRef = globalThis.window, muted = readYusongSoundMuted() } = {}) {
  if (muted || !result || !windowRef) return false;
  const AudioContextClass = windowRef.AudioContext || windowRef.webkitAudioContext;
  if (!AudioContextClass) return false;
  try {
    audioContext ??= new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});

    const rolls = Array.isArray(result.rolls) ? result.rolls : [];
    const critical = rolls.some((roll) => roll.sides && roll.value === roll.sides);
    const fumble = rolls.some((roll) => roll.value === 1) || Number(result.total) <= 0;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(fumble ? 260 : critical ? 660 : 480, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.16);
    return true;
  } catch {
    return false;
  }
}
