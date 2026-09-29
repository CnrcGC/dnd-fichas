import { getPilaresSchool, PILARES_CLASSES, PILARES_TYPES } from "./identityOptions.js";

export const PILARES_CARD_WIDTH = 900;
export const PILARES_CARD_HEIGHT = 540;

const findLabel = (options, value, fallback) => options.find((option) => option.id === value)?.name ?? fallback;
const asText = (value, fallback = "Não informado") => String(value ?? "").trim() || fallback;

export function sanitizeYusongCardFilename(displayName) {
  const safeName = asText(displayName, "lutador")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "lutador";
  return `carteirinha-${safeName}.png`;
}

export function buildYusongCardSummary(character, derived) {
  const school = getPilaresSchool(character?.selections?.school);
  const talents = Array.isArray(character?.talents)
    ? character.talents.slice(0, 4).map((talent) => asText(talent?.name, "Talento sem nome"))
    : [];

  return {
    title: "CARTEIRINHA DE LUTADOR · PILARES DE ATLAS",
    school,
    displayName: asText(character?.identity?.displayName, "Lutador sem nome"),
    className: findLabel(PILARES_CLASSES, character?.selections?.characterClass, "Classe não informada"),
    typeName: findLabel(PILARES_TYPES, character?.selections?.type, "Tipo não informado"),
    origin: asText(character?.selections?.origin),
    martialArt: asText(character?.selections?.martialArt),
    level: Number(character?.identity?.level) || 1,
    age: asText(character?.identity?.age, "—"),
    life: `${Number(character?.resources?.currentLife) || 0} / ${Number(derived?.resources?.maximumLife) || 0}`,
    stamina: `${Number(character?.resources?.currentStamina) || 0} / ${Number(derived?.resources?.maximumStamina) || 0}`,
    dodge: asText(derived?.reactions?.dodge, "—"),
    counterAttack: asText(derived?.reactions?.counterAttack, "—"),
    talents,
  };
}

function roundedRect(context, x, y, width, height, radius = 16) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function fitText(context, text, maximumWidth) {
  const value = String(text);
  if (context.measureText(value).width <= maximumWidth) return value;
  let shortened = value;
  while (shortened.length > 1 && context.measureText(`${shortened}…`).width > maximumWidth) shortened = shortened.slice(0, -1);
  return `${shortened}…`;
}

function drawPattern(context, school) {
  context.save();
  context.globalAlpha = 0.16;
  context.strokeStyle = school.darkAccent;
  context.fillStyle = school.darkAccent;
  context.lineWidth = 2;
  if (school.pattern === "dots") {
    for (let x = 28; x < PILARES_CARD_WIDTH; x += 42) for (let y = 28; y < PILARES_CARD_HEIGHT; y += 42) {
      context.beginPath(); context.arc(x, y, 2.5, 0, Math.PI * 2); context.fill();
    }
  } else if (school.pattern === "grid") {
    for (let x = 0; x < PILARES_CARD_WIDTH; x += 48) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, PILARES_CARD_HEIGHT); context.stroke(); }
    for (let y = 0; y < PILARES_CARD_HEIGHT; y += 48) { context.beginPath(); context.moveTo(0, y); context.lineTo(PILARES_CARD_WIDTH, y); context.stroke(); }
  } else if (school.pattern === "diamond") {
    for (let x = -PILARES_CARD_HEIGHT; x < PILARES_CARD_WIDTH; x += 64) {
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x + PILARES_CARD_HEIGHT, PILARES_CARD_HEIGHT); context.stroke();
      context.beginPath(); context.moveTo(x + PILARES_CARD_HEIGHT, 0); context.lineTo(x, PILARES_CARD_HEIGHT); context.stroke();
    }
  } else if (school.pattern === "bars") {
    for (let x = 0; x < PILARES_CARD_WIDTH; x += 72) context.fillRect(x, 0, 18, PILARES_CARD_HEIGHT);
  } else if (school.pattern === "steps") {
    for (let y = 20; y < PILARES_CARD_HEIGHT; y += 54) {
      context.beginPath(); context.moveTo(0, y); context.lineTo(46, y); context.lineTo(46, y + 24); context.lineTo(92, y + 24); context.lineTo(92, y + 48); context.lineTo(PILARES_CARD_WIDTH, y + 48); context.stroke();
    }
  } else {
    for (let x = -PILARES_CARD_HEIGHT; x < PILARES_CARD_WIDTH; x += 46) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x + PILARES_CARD_HEIGHT, PILARES_CARD_HEIGHT); context.stroke(); }
  }
  context.restore();
}

function drawStat(context, label, value, x, y, width) {
  roundedRect(context, x, y, width, 72, 12);
  context.fillStyle = "rgba(255,255,255,0.08)";
  context.fill();
  context.fillStyle = "#b8bfcc";
  context.font = "600 13px system-ui, sans-serif";
  context.fillText(label.toUpperCase(), x + 16, y + 23);
  context.fillStyle = "#ffffff";
  context.font = "700 23px system-ui, sans-serif";
  context.fillText(fitText(context, value, width - 32), x + 16, y + 54);
}

export function drawYusongFighterCard(canvas, character, derived) {
  canvas.width = PILARES_CARD_WIDTH;
  canvas.height = PILARES_CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("O navegador não oferece suporte à exportação da carteirinha.");
  const summary = buildYusongCardSummary(character, derived);

  context.fillStyle = "#10131a";
  context.fillRect(0, 0, PILARES_CARD_WIDTH, PILARES_CARD_HEIGHT);
  drawPattern(context, summary.school);
  context.fillStyle = summary.school.lightAccent;
  context.fillRect(0, 0, PILARES_CARD_WIDTH, 74);
  context.fillStyle = "#ffffff";
  context.font = "700 20px system-ui, sans-serif";
  context.fillText(summary.title, 32, 46);
  context.textAlign = "right";
  context.font = "600 16px system-ui, sans-serif";
  context.fillText(summary.school.name, 868, 45);
  context.textAlign = "left";

  context.beginPath();
  context.arc(132, 190, 76, 0, Math.PI * 2);
  context.fillStyle = "#171c27";
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = summary.school.darkAccent;
  context.stroke();
  context.fillStyle = summary.school.darkAccent;
  context.font = "800 44px system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText(summary.school.monogram, 132, 205);
  context.textAlign = "left";

  context.fillStyle = summary.school.darkAccent;
  context.font = "700 15px system-ui, sans-serif";
  context.fillText(`${summary.typeName} · ${summary.className}`.toUpperCase(), 236, 126);
  context.fillStyle = "#ffffff";
  context.font = "800 38px system-ui, sans-serif";
  context.fillText(fitText(context, summary.displayName, 620), 236, 172);
  context.fillStyle = "#d8dde7";
  context.font = "500 17px system-ui, sans-serif";
  context.fillText(fitText(context, `${summary.origin} · ${summary.martialArt}`, 620), 236, 205);
  context.fillText(`Nível ${summary.level} · Idade ${summary.age}`, 236, 235);

  drawStat(context, "Vida", summary.life, 32, 292, 196);
  drawStat(context, "Stamina", summary.stamina, 244, 292, 196);
  drawStat(context, "Esquiva", summary.dodge, 456, 292, 196);
  drawStat(context, "Contra-ataque", summary.counterAttack, 668, 292, 200);

  context.fillStyle = summary.school.darkAccent;
  context.font = "700 14px system-ui, sans-serif";
  context.fillText("TALENTOS EM DESTAQUE", 32, 410);
  context.fillStyle = "#ffffff";
  context.font = "600 17px system-ui, sans-serif";
  const talentText = summary.talents.length ? summary.talents.join("  ·  ") : "Nenhum talento cadastrado";
  context.fillText(fitText(context, talentText, 836), 32, 441);

  context.strokeStyle = "rgba(255,255,255,0.18)";
  context.beginPath(); context.moveTo(32, 474); context.lineTo(868, 474); context.stroke();
  context.fillStyle = "#b8bfcc";
  context.font = "500 13px system-ui, sans-serif";
  context.fillText("Resumo visual — os dados restauráveis permanecem na ficha local", 32, 506);
  context.textAlign = "right";
  context.fillText("PILARES DE ATLAS", 868, 506);

  return summary;
}

export function exportYusongFighterCard(character, derived, documentRef = document) {
  const canvas = documentRef.createElement("canvas");
  const summary = drawYusongFighterCard(canvas, character, derived);
  const link = documentRef.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = sanitizeYusongCardFilename(summary.displayName);
  link.click();
  return { filename: link.download, width: canvas.width, height: canvas.height, summary };
}
