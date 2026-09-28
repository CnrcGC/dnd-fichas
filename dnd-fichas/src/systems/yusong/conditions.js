const conditionDefinitions = [
  {
    id: "amedrontado",
    name: "Amedrontado",
    description:
      "Ao se sentir preenchido pelo medo, a pessoa tem dificuldade em agir normalmente.",
    effect: "-4 em todas as ações.",
    rollModifier: -4,
  },
  {
    id: "desesperado",
    name: "Desesperado",
    description:
      "Pior que estar amedrontado, o sentimento evoluiu para um desespero verdadeiro e irracional.",
    effect: "-10 em todas as rolagens.",
    rollModifier: -10,
  },
  {
    id: "motivado",
    name: "Motivado",
    description:
      "A pessoa é preenchida de motivação pelas circunstâncias ao seu redor.",
    effect: "+4 em todos os testes realizados.",
    rollModifier: 4,
  },
  {
    id: "ansioso",
    name: "Ansioso",
    description:
      "A respiração se torna irregular e difícil de controlar. O alvo fica tenso, nervoso e ansioso.",
    effect: "Todas as ações têm o dobro de gasto de Stamina.",
  },
  {
    id: "exausto",
    name: "Exausto",
    description:
      "Ao chegar a 0 de Stamina, a pessoa fica totalmente exausta e incapaz de agir normalmente.",
    effect:
      "Ao realizar uma ação que gasta Stamina nesse estado, após sua realização, o personagem desmaia.",
  },
  {
    id: "enfurecido",
    name: "Enfurecido",
    description:
      "A raiva se sobressai entre os outros sentimentos e toma o lugar da razão, levando a ações ilógicas e agressivas.",
    effect:
      "Desvantagem em testes de Esquiva. Ao agir nesse estado, sofre 1d6 de dano. Recebe +2 em testes de Força e Luta.",
  },
  {
    id: "sangrando",
    name: "Sangrando",
    description:
      "O personagem está perdendo sangue e sua condição física piora enquanto não receber tratamento.",
    effect:
      "Sofre 1d6 de dano na Vida Real em intervalos definidos pelo mestre ou pela cena, até o sangramento ser tratado.",
  },
  {
    id: "agarrado",
    name: "Agarrado",
    description:
      "O personagem está preso por outro alvo, tendo seus movimentos limitados e dificuldade para se defender.",
    effect:
      "Deslocamento reduzido a 0. Não pode se esquivar enquanto estiver agarrado. Pode atacar apenas quem está agarrando, ou atacar outros alvos com desvantagem. Para se soltar, precisa gastar uma ação padrão e vencer um teste contra quem está agarrando.",
  },
  {
    id: "caido",
    name: "Caído",
    description:
      "O personagem está no chão, em posição vulnerável contra inimigos próximos.",
    effect:
      "Personagens corpo a corpo têm vantagem para acertar o alvo caído. É preciso gastar uma ação de movimento para se levantar.",
  },
];


export const YUSONG_CONDITIONS = Object.freeze(conditionDefinitions.map((condition) => Object.freeze({ ...condition })));
export const YUSONG_CONDITION_IDS = Object.freeze(YUSONG_CONDITIONS.map((condition) => condition.id));
export const YUSONG_CONDITION_ROLL_MODIFIERS = Object.freeze(Object.fromEntries(
  YUSONG_CONDITIONS.flatMap((condition) => Number.isFinite(condition.rollModifier) ? [[condition.id, condition.rollModifier]] : []),
));

export function getYusongCondition(conditionId) {
  return YUSONG_CONDITIONS.find((condition) => condition.id === conditionId) ?? null;
}

