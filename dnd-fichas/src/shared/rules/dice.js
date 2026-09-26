const DICE_TERM = /([+-]?)(\d*)d(\d+)|([+-]?\d+)/gi;

export function parseDiceNotation(notation) {
  const compact = String(notation ?? "").replace(/\s+/g, "");
  if (!compact) throw new TypeError("A notação de dados está vazia.");

  const terms = [];
  let cursor = 0;
  for (const match of compact.matchAll(DICE_TERM)) {
    if (match.index !== cursor) throw new TypeError(`Notação de dados inválida: ${notation}.`);
    cursor += match[0].length;
    if (match[3]) {
      const count = Number(match[2] || 1);
      const sides = Number(match[3]);
      if (!Number.isSafeInteger(count) || count < 1 || count > 100 || sides < 2 || sides > 1000) {
        throw new RangeError("A quantidade ou o número de faces está fora dos limites.");
      }
      terms.push({ type: "dice", sign: match[1] === "-" ? -1 : 1, count, sides });
    } else {
      terms.push({ type: "constant", value: Number(match[4]) });
    }
  }
  if (cursor !== compact.length) throw new TypeError(`Notação de dados inválida: ${notation}.`);
  return terms;
}

export function rollDice(notation, random = Math.random) {
  const terms = parseDiceNotation(notation);
  const rolls = [];
  let total = 0;
  for (const term of terms) {
    if (term.type === "constant") {
      total += term.value;
      continue;
    }
    for (let index = 0; index < term.count; index += 1) {
      const raw = Number(random());
      if (!Number.isFinite(raw) || raw < 0 || raw >= 1) {
        throw new RangeError("O gerador aleatório deve retornar um valor entre 0 (inclusivo) e 1 (exclusivo). ");
      }
      const value = Math.floor(raw * term.sides) + 1;
      rolls.push({ sides: term.sides, value, sign: term.sign });
      total += value * term.sign;
    }
  }
  return { notation: String(notation), rolls, total };
}

