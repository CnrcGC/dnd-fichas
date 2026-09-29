import { PILARES_CLASSES, PILARES_MARTIAL_ARTS, PILARES_ORIGINS, PILARES_SCHOOLS, PILARES_TYPES } from "./identityOptions";
import { YUSONG_ATTRIBUTES, distributeYusongPoints } from "./rules";
import { YUSONG_SKILL_IDS } from "./skills";
import { YUSONG_TALENTS } from "./talents";

// Compatibility source: src/utils/randomCharacter.js from the owner-supplied
// Fichas-Yusong-main (2).zip. The remote DiceBear avatar was intentionally
// omitted: character generation must remain complete while offline.
export const YUSONG_GIVEN_NAMES = Object.freeze([
  "Ji-ho", "Min-jun", "Seo-yeon", "Ha-eun", "Dae-sung", "Yuna", "Tae-yang",
  "Soo-min", "Hyun-woo", "Areum", "Joon-ho", "Eun-bi", "Si-woo", "Na-yeon",
  "Kyung-mi", "Do-yun", "Yeji", "Jin-woo", "Chae-won", "Sung-min",
]);

export const YUSONG_SURNAMES = Object.freeze([
  "Kang", "Han", "Yoon", "Choi", "Park", "Kim", "Lee", "Seo", "Jung", "Oh",
  "Baek", "Song", "Yang", "Cho", "Shin",
]);

function randomIndex(length, random) {
  const value = Number(random());
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError("O gerador aleatório deve retornar um valor entre 0 e 1.");
  }
  return Math.floor(value * length);
}

function pickRandom(list, random) {
  return list[randomIndex(list.length, random)];
}

function randomInt(minimum, maximum, random) {
  return minimum + randomIndex(maximum - minimum + 1, random);
}

export function generateYusongRandomProfile({ random = Math.random } = {}) {
  const schools = PILARES_SCHOOLS.filter((school) => school.id !== "custom");
  const school = pickRandom(schools, random);
  const type = pickRandom(PILARES_TYPES, random);
  const characterClass = pickRandom(PILARES_CLASSES, random);
  const origin = pickRandom(PILARES_ORIGINS, random);
  const martialArt = pickRandom(PILARES_MARTIAL_ARTS, random);
  const displayName = `${pickRandom(YUSONG_SURNAMES, random)} ${pickRandom(YUSONG_GIVEN_NAMES, random)}`;
  const attributes = distributeYusongPoints(YUSONG_ATTRIBUTES, 18, 1, 7, random);
  const skills = distributeYusongPoints(YUSONG_SKILL_IDS, 8, 0, 3, random);
  const eligibleTalents = YUSONG_TALENTS.filter((talent) =>
    (talent.category === characterClass.id || talent.category === "geral") &&
    !String(talent.prerequisites ?? "").trim()
  );
  const talent = eligibleTalents.length ? structuredClone(pickRandom(eligibleTalents, random)) : null;

  return {
    identity: {
      displayName,
      age: String(randomInt(16, 19, random)),
      height: `${(randomInt(155, 190, random) / 100).toFixed(2)}m`,
      image: "",
    },
    selections: {
      school: school.id,
      type: type.id,
      characterClass: characterClass.id,
      origin,
      martialArt,
    },
    attributes,
    skills,
    talent,
  };
}
