const referenciaLJ = (printedPage, section) => ({
  ruleId: "R-CHAR", bookId: "LJ", edition: "dnd5e-books-2014", printedPage, section,
});

const metadados = (printedPage, section) => ({
  catalogVersion: 1,
  rulesProfile: "dnd5e-books-2014",
  verificationStatus: "verified",
  automationLevel: "assisted",
  sourceRefs: [referenciaLJ(printedPage, section)],
});

const traco = (id, nome, descricao, automationLevel = "descriptive") => ({
  id, nome, descricao, automationLevel,
});

export const SUBRACAS = [
  {
    id: "anao-colina", racaId: "anao", nome: "Anão da Colina",
    bonusAtributos: { sabedoria: 1 },
    tracos: [traco("tenacidade-ana", "Tenacidade Anã", "O máximo de PV aumenta em 1 por nível de personagem.", "assisted")],
    ...metadados(20, "Anão da Colina"),
  },
  {
    id: "anao-montanha", racaId: "anao", nome: "Anão da Montanha",
    bonusAtributos: { forca: 2 }, proficienciasArmaduras: ["leves", "medias"],
    tracos: [traco("treinamento-anao-armaduras", "Treinamento Anão com Armaduras", "Concede proficiência com armaduras leves e médias.", "automated")],
    ...metadados(20, "Anão da Montanha"),
  },
  {
    id: "alto-elfo", racaId: "elfo", nome: "Alto Elfo",
    bonusAtributos: { inteligencia: 1 }, idiomasEscolha: 1,
    proficienciasArmas: ["espada-longa", "espada-curta", "arco-curto", "arco-longo"],
    tracos: [traco("truque-alto-elfo", "Truque", "Escolha um truque da lista de Mago; Inteligência é o atributo de conjuração.")],
    ...metadados(24, "Alto Elfo"),
  },
  {
    id: "elfo-floresta", racaId: "elfo", nome: "Elfo da Floresta",
    bonusAtributos: { sabedoria: 1 }, deslocamento: 10.5,
    proficienciasArmas: ["espada-longa", "espada-curta", "arco-curto", "arco-longo"],
    tracos: [traco("mascara-selvagem", "Máscara da Natureza", "Pode tentar se esconder quando estiver levemente obscurecido por fenômenos naturais.")],
    ...metadados(24, "Elfo da Floresta"),
  },
  {
    id: "elfo-negro-drow", racaId: "elfo", nome: "Elfo Negro (Drow)",
    bonusAtributos: { carisma: 1 }, proficienciasArmas: ["rapieira", "espada-curta", "besta-de-mao"],
    tracos: [
      traco("visao-escuro-superior", "Visão no Escuro Superior", "O alcance da visão no escuro é 36 metros."),
      traco("sensibilidade-luz-solar", "Sensibilidade à Luz Solar", "Sob luz solar direta, certas jogadas de ataque e Percepção baseadas em visão sofrem desvantagem."),
      traco("magia-drow", "Magia Drow", "Concede luzes dançantes e, em níveis posteriores, fogo das fadas e escuridão usando Carisma."),
    ],
    ...metadados(24, "Elfo Negro (Drow)"),
  },
  {
    id: "halfling-pes-leves", racaId: "halfling", nome: "Halfling Pés-Leves",
    bonusAtributos: { carisma: 1 },
    tracos: [traco("furtividade-natural", "Furtividade Natural", "Pode tentar se esconder atrás de uma criatura maior.")],
    ...metadados(28, "Halfling Pés-Leves"),
  },
  {
    id: "halfling-robusto", racaId: "halfling", nome: "Halfling Robusto",
    bonusAtributos: { constituicao: 1 }, resistenciasDano: ["veneno"],
    tracos: [traco("resiliencia-robusta", "Resiliência dos Robustos", "Concede vantagem contra veneno e resistência a dano de veneno.")],
    ...metadados(28, "Halfling Robusto"),
  },
  {
    id: "gnomo-floresta", racaId: "gnomo", nome: "Gnomo da Floresta",
    bonusAtributos: { destreza: 1 },
    tracos: [
      traco("ilusionista-nato", "Ilusionista Nato", "Conhece o truque ilusão menor, usando Inteligência."),
      traco("falar-bestinhas", "Falar com Bestas Pequenas", "Comunica ideias simples a bestas Pequenas ou menores."),
    ],
    ...metadados(37, "Gnomo da Floresta"),
  },
  {
    id: "gnomo-rochas", racaId: "gnomo", nome: "Gnomo das Rochas",
    bonusAtributos: { constituicao: 1 }, ferramentasFixas: ["ferramentas-funileiro"],
    tracos: [
      traco("conhecimento-artifice", "Conhecimento de Artífice", "Dobra a proficiência em História relacionada a itens mágicos, alquímicos ou tecnológicos."),
      traco("engenhoqueiro", "Engenhoqueiro", "Permite construir pequenos dispositivos com ferramentas de funileiro."),
    ],
    ...metadados(37, "Gnomo das Rochas"),
  },
];

export const RACAS = [
  {
    id: "humano", nome: "Humano", descricao: "Versáteis e adaptáveis.",
    bonusAtributos: { forca: 1, destreza: 1, constituicao: 1, inteligencia: 1, sabedoria: 1, carisma: 1 },
    tamanho: "medio", deslocamento: 9, idiomasFixos: ["comum"], idiomasEscolha: 1,
    tracos: [], ...metadados(31, "Traços Raciais dos Humanos"),
  },
  {
    id: "elfo", nome: "Elfo", descricao: "Ágeis, longevos e ligados à magia.",
    bonusAtributos: { destreza: 2 }, tamanho: "medio", deslocamento: 9,
    idiomasFixos: ["comum", "elfico"], periciasConcedidas: ["percepcao"],
    tracos: [
      traco("visao-escuro", "Visão no Escuro", "Enxerga na penumbra e no escuro até 18 metros."),
      traco("ancestral-feerico", "Ancestral Feérico", "Vantagem contra encantamento; magia não pode fazê-lo dormir."),
      traco("transe", "Transe", "Medita profundamente por 4 horas em vez de dormir."),
    ],
    requerSubraca: true, ...metadados(23, "Traços Raciais dos Elfos"),
  },
  {
    id: "anao", nome: "Anão", descricao: "Resistentes, tradicionais e hábeis artesãos.",
    bonusAtributos: { constituicao: 2 }, tamanho: "medio", deslocamento: 7.5,
    idiomasFixos: ["comum", "anao"],
    proficienciasArmas: ["machado-de-batalha", "machadinha", "martelo-leve", "martelo-de-guerra"],
    ferramentasEscolha: { quantidade: 1, opcoes: ["ferramentas-ferreiro", "ferramentas-cervejeiro", "ferramentas-pedreiro"] },
    resistenciasDano: ["veneno"],
    tracos: [
      traco("visao-escuro", "Visão no Escuro", "Enxerga na penumbra e no escuro até 18 metros."),
      traco("resiliencia-ana", "Resiliência Anã", "Vantagem contra veneno e resistência a dano de veneno."),
      traco("especializacao-rochas", "Especialização em Rochas", "Dobra a proficiência em História ligada à origem de trabalhos em pedra."),
    ],
    requerSubraca: true, ...metadados(20, "Traços Raciais dos Anões"),
  },
  {
    id: "halfling", nome: "Halfling", descricao: "Pequenos, corajosos e extraordinariamente sortudos.",
    bonusAtributos: { destreza: 2 }, tamanho: "pequeno", deslocamento: 7.5,
    idiomasFixos: ["comum", "halfling"],
    tracos: [
      traco("sortudo", "Sortudo", "Ao obter 1 natural em ataque, teste ou salvaguarda, pode rolar novamente o dado."),
      traco("bravura", "Bravura", "Vantagem contra amedrontado."),
      traco("agilidade-halfling", "Agilidade Halfling", "Pode atravessar o espaço de criaturas maiores."),
    ],
    requerSubraca: true, ...metadados(28, "Traços Raciais dos Halflings"),
  },
  {
    id: "draconato", nome: "Draconato", descricao: "Descendentes de dragões com sopro elemental.",
    bonusAtributos: { forca: 2, carisma: 1 }, tamanho: "medio", deslocamento: 9,
    idiomasFixos: ["comum", "draconico"],
    ancestralidadesDraconicas: [
      ["azul", "elétrico", "linha"], ["branco", "frio", "cone"], ["bronze", "elétrico", "linha"],
      ["cobre", "ácido", "linha"], ["latão", "fogo", "linha"], ["negro", "ácido", "linha"],
      ["ouro", "fogo", "cone"], ["prata", "frio", "cone"], ["verde", "veneno", "cone"],
      ["vermelho", "fogo", "cone"],
    ].map(([id, dano, forma]) => ({ id, nome: id[0].toUpperCase() + id.slice(1), dano, forma })),
    tracos: [
      traco("arma-sopro", "Arma de Sopro", "A ancestralidade define tipo de dano, forma e salvaguarda do sopro."),
      traco("resistencia-draconica", "Resistência a Dano", "Concede resistência ao tipo de dano da ancestralidade."),
    ],
    ...metadados(34, "Traços Raciais dos Draconatos"),
  },
  {
    id: "gnomo", nome: "Gnomo", descricao: "Curiosos, inventivos e resistentes à magia.",
    bonusAtributos: { inteligencia: 2 }, tamanho: "pequeno", deslocamento: 7.5,
    idiomasFixos: ["comum", "gnomico"],
    tracos: [
      traco("visao-escuro", "Visão no Escuro", "Enxerga na penumbra e no escuro até 18 metros."),
      traco("esperteza-gnomica", "Esperteza Gnômica", "Vantagem em salvaguardas mentais contra magia."),
    ],
    requerSubraca: true, ...metadados(37, "Traços Raciais dos Gnomos"),
  },
  {
    id: "meio-elfo", nome: "Meio-Elfo", descricao: "Versáteis, sociáveis e ligados a duas heranças.",
    bonusAtributos: { carisma: 2 }, atributosEscolhaLivre: 2, tamanho: "medio", deslocamento: 9,
    idiomasFixos: ["comum", "elfico"], idiomasEscolha: 1, periciasEscolha: { quantidade: 2, opcoes: "todas" },
    tracos: [
      traco("visao-escuro", "Visão no Escuro", "Enxerga na penumbra e no escuro até 18 metros."),
      traco("ancestral-feerico", "Ancestral Feérico", "Vantagem contra encantamento; magia não pode fazê-lo dormir."),
    ],
    ...metadados(39, "Traços Raciais dos Meio-Elfos"),
  },
  {
    id: "meio-orc", nome: "Meio-Orc", descricao: "Fortes, tenazes e ameaçadores.",
    bonusAtributos: { forca: 2, constituicao: 1 }, tamanho: "medio", deslocamento: 9,
    idiomasFixos: ["comum", "orc"], periciasConcedidas: ["intimidacao"],
    tracos: [
      traco("visao-escuro", "Visão no Escuro", "Enxerga na penumbra e no escuro até 18 metros."),
      traco("resistencia-implacavel", "Resistência Implacável", "Uma vez por descanso longo, cairia a 0 PV sem morrer instantaneamente e fica com 1 PV."),
      traco("ataques-selvagens", "Ataques Selvagens", "Acertos críticos corpo a corpo acrescentam um dado de dano da arma."),
    ],
    ...metadados(41, "Traços Raciais dos Meio-Orcs"),
  },
  {
    id: "tiefling", nome: "Tiefling", descricao: "Herdeiros de uma linhagem infernal.",
    bonusAtributos: { carisma: 2, inteligencia: 1 }, tamanho: "medio", deslocamento: 9,
    idiomasFixos: ["comum", "infernal"], resistenciasDano: ["fogo"],
    tracos: [
      traco("visao-escuro", "Visão no Escuro", "Enxerga na penumbra e no escuro até 18 metros."),
      traco("resistencia-infernal", "Resistência Infernal", "Concede resistência a dano de fogo."),
      traco("legado-infernal", "Legado Infernal", "Concede taumaturgia e, em níveis posteriores, repreensão infernal e escuridão usando Carisma."),
    ],
    ...metadados(43, "Traços Raciais dos Tieflings"),
  },
];

export function obterRaca(id) {
  return RACAS.find((raca) => raca.id === id) ?? null;
}

export function obterSubracasPorRaca(racaId) {
  return SUBRACAS.filter((subraca) => subraca.racaId === racaId);
}

export function obterSubraca(id) {
  return SUBRACAS.find((subraca) => subraca.id === id) ?? null;
}

export function subracaValidaParaRaca(racaId, subracaId) {
  return Boolean(subracaId && obterSubraca(subracaId)?.racaId === racaId);
}

export function obterBonusRaciais(racaId, subracaId, escolhasLivres = []) {
  const raca = obterRaca(racaId);
  const subraca = subracaValidaParaRaca(racaId, subracaId) ? obterSubraca(subracaId) : null;
  const bonus = { ...(raca?.bonusAtributos ?? {}) };
  for (const [atributo, valor] of Object.entries(subraca?.bonusAtributos ?? {})) {
    bonus[atributo] = (bonus[atributo] ?? 0) + valor;
  }
  for (const atributo of escolhasLivres ?? []) {
    if (atributo) bonus[atributo] = (bonus[atributo] ?? 0) + 1;
  }
  return bonus;
}

export function obterDeslocamentoRacial(racaId, subracaId) {
  const raca = obterRaca(racaId);
  const subraca = subracaValidaParaRaca(racaId, subracaId) ? obterSubraca(subracaId) : null;
  return subraca?.deslocamento ?? raca?.deslocamento ?? 9;
}

export function obterResistenciasRaciais(racaId, subracaId, escolhasRaciais = {}) {
  const raca = obterRaca(racaId);
  const subraca = subracaValidaParaRaca(racaId, subracaId) ? obterSubraca(subracaId) : null;
  const resistencias = new Set([...(raca?.resistenciasDano ?? []), ...(subraca?.resistenciasDano ?? [])]);
  if (racaId === "draconato") {
    const ancestralidade = raca?.ancestralidadesDraconicas?.find(
      (item) => item.id === escolhasRaciais.ancestralidadeDraconicaId
    );
    if (ancestralidade) resistencias.add(ancestralidade.dano);
  }
  return [...resistencias];
}
