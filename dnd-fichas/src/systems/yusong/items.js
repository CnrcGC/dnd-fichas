const itemDefinitions = [
  {
    id: "soqueiras",
    name: "Soqueiras",
    category: "Arma",
    damage: "+1d6+4",
    use: "Socos",
    durability: 32,
    description:
      "Uma soqueira, também conhecida como soco-inglês, é uma arma de impacto projetada para ser encaixada nos dedos da mão. Geralmente feita de metal, aumenta a força do golpe ao distribuir a energia do impacto em uma área menor. Aumenta o dano dos socos em +1d6+4. Vida da Soqueira: 32.",
  },
  {
    id: "bastoes-artes-marciais",
    name: "Bastões de Artes Marciais",
    category: "Arma",
    damage: "+1d8+1",
    use: "Ataques com mãos",
    durability: 18,
    description:
      "Bastões de madeira usados em artes marciais. Incluem Bo, Jo, Hanbo, Shinai e Tonfa, cada um com tamanho e tradição próprios. Aumenta o dano dos ataques com as mãos em +1d8+1. Vida do Bastão: 18.",
  },
  {
    id: "bo",
    name: "Bo",
    category: "Arma",
    damage: "+1d8+1",
    use: "Bastão longo",
    durability: 18,
    description:
      "Bastão longo tradicionalmente usado no Kobudo e no Karate de Okinawa. Mede cerca de 1,80m e é utilizado para golpes, bloqueios e técnicas de alavanca.",
  },
  {
    id: "jo",
    name: "Jo",
    category: "Arma",
    damage: "+1d8+1",
    use: "Bastão médio",
    durability: 18,
    description:
      "Bastão médio com cerca de 1,20m, amplamente utilizado no Aikido e no Jojutsu. Permite técnicas rápidas e precisas.",
  },
  {
    id: "hanbo",
    name: "Hanbo",
    category: "Arma",
    damage: "+1d8+1",
    use: "Bastão curto",
    durability: 18,
    description:
      "Bastão curto de aproximadamente 90 cm, usado em defesa pessoal e técnicas derivadas do Jujutsu.",
  },
  {
    id: "shinai",
    name: "Shinai",
    category: "Arma",
    damage: "+1d8+1",
    use: "Simulador de espada",
    durability: 18,
    description:
      "Arma de bambu usada no Kendo para simular uma espada japonesa.",
  },
  {
    id: "tonfa",
    name: "Tonfa",
    category: "Arma",
    damage: "+1d8+1",
    use: "Bastão curto",
    durability: 18,
    description:
      "Bastões curtos com cabo perpendicular, usados no Kobudo e em algumas técnicas de combate policial.",
  },
  {
    id: "bastoes-ferro",
    name: "Bastões de Ferro",
    category: "Arma",
    damage: "+2d8+4",
    use: "Ataques com mãos",
    durability: 40,
    description:
      "Armas improvisadas e brutais, comuns em confrontos urbanos. Podem variar desde pedaços de ferro enferrujados encontrados na cidade até bastões de beisebol de metal. Aumenta o dano dos ataques com as mãos em +2d8+4. Vida do Bastão: 40.",
  },
  {
    id: "katana-espada",
    name: "Katana/Espada",
    category: "Arma",
    damage: "+3d12+6",
    use: "Ataques com mãos",
    durability: 84,
    description:
      "Espadas medievais ou katanas curvadas, longas e ágeis. Aumenta o dano dos ataques com as mãos em +3d12+6 e o alcance em 1m. Esse dano não pode ser diminuído. Vida da Katana/Espada: 84.",
  },
  {
    id: "faca",
    name: "Lâmina Curta Robusta",
    category: "Arma",
    damage: "+1d10+2",
    use: "Ataques com mãos",
    durability: 24,
    description:
      "Uma lâmina curta e robusta, rápida e precisa nas mãos certas. Aumenta o dano dos ataques em +1d10+2. Esse dano não pode ser diminuído. Vida da Lâmina Curta Robusta: 24.",
  },
  {
    id: "faquinha",
    name: "Lâmina Curta Leve",
    category: "Arma",
    damage: "+1d6+1",
    use: "Ataques com mãos",
    durability: 14,
    description:
      "Versão menor e mais leve da lâmina curta. Causa +1d6+1 de dano, que não pode ser diminuído. Vida da Lâmina Curta Leve: 14.",
  },
];


export const YUSONG_SYSTEM_ITEMS = Object.freeze(itemDefinitions.map((item) => Object.freeze({ ...item })));

export function getYusongSystemItem(itemId) {
  return YUSONG_SYSTEM_ITEMS.find((item) => item.id === itemId) ?? null;
}

export function createYusongSystemItem(itemId, { id, quantity = 1 } = {}) {
  const definition = getYusongSystemItem(itemId);
  if (!definition) return null;
  return {
    ...structuredClone(definition),
    id: String(id || crypto.randomUUID()),
    quantity: Math.max(1, Math.floor(Number(quantity) || 1)),
    source: "system",
    systemItemId: definition.id,
  };
}

