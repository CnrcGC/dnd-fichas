import { test } from "node:test";
import assert from "node:assert/strict";
import {
  YUSONG_SOUND_STORAGE_KEY,
  playYusongRollSound,
  readYusongSoundMuted,
  writeYusongSoundMuted,
} from "../src/systems/yusong/sound.js";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("FE-05G-B preserva e atualiza a preferência de som legada", () => {
  const storage = memoryStorage({ [YUSONG_SOUND_STORAGE_KEY]: "true" });
  assert.equal(readYusongSoundMuted(storage), true);
  assert.deepEqual(writeYusongSoundMuted(false, storage), { ok: true, muted: false });
  assert.equal(readYusongSoundMuted(storage), false);
});

test("FE-05G-B falha com segurança sem storage ou Web Audio", () => {
  const brokenStorage = { getItem: () => { throw new Error("indisponível"); }, setItem: () => { throw new Error("indisponível"); } };
  assert.equal(readYusongSoundMuted(brokenStorage), false);
  assert.equal(writeYusongSoundMuted(true, brokenStorage).ok, false);
  assert.equal(playYusongRollSound({ total: 10, rolls: [{ sides: 20, value: 10 }] }, { windowRef: {}, muted: false }), false);
  assert.equal(playYusongRollSound({ total: 10, rolls: [] }, { windowRef: {}, muted: true }), false);
  assert.equal(playYusongRollSound(
    { total: 10, rolls: [] },
    { windowRef: { AudioContext: class { constructor() { throw new Error("bloqueado"); } } }, muted: false },
  ), false);
});
