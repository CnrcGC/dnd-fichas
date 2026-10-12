// Raças do manual básico (PHB), com os bônus de atributo padrão.
// Meio-Elfo permite escolher dois atributos distintos para +1.
export const RACAS = [
  {
    id: "humano",
    nome: "Humano",
    descricao: "Versáteis e adaptáveis, ganham um pequeno bônus em todos os atributos.",
    bonusAtributos: {
      forca: 1,
      destreza: 1,
      constituicao: 1,
      inteligencia: 1,
      sabedoria: 1,
      carisma: 1,
    },
    deslocamento: 9,
    idiomasFixos: ["comum"], idiomasEscolha: 1,
  },
  {
    id: "elfo",
    nome: "Elfo",
    descricao: "Ágeis e de sentidos apurados, com longevidade e afinidade natural com magia.",
    bonusAtributos: { destreza: 2 },
    deslocamento: 9,
    idiomasFixos: ["comum", "elfico"], periciasConcedidas: ["percepcao"],
  },
  {
    id: "anao",
    nome: "Anão",
    descricao: "Resistentes e teimosos, vêm de uma tradição de mineração e forja.",
    bonusAtributos: { constituicao: 2 },
    subracas: [
      { id: "anao-colina", nome: "Anão da Colina", bonusAtributos: { sabedoria: 1 }, pvPorNivel: 1 },
      { id: "anao-montanha", nome: "Anão da Montanha", bonusAtributos: { forca: 2 }, armaduras: ["leves", "medias"] },
    ],
    deslocamento: 7,
    idiomasFixos: ["comum", "anao"],
    ferramentasEscolha: {
      quantidade: 1,
      opcoes: ["ferramentas-ferreiro", "ferramentas-cervejeiro", "ferramentas-pedreiro"],
    },
  },
  {
    id: "halfling",
    nome: "Halfling",
    descricao: "Pequenos, sortudos e surpreendentemente corajosos apesar do tamanho.",
    bonusAtributos: { destreza: 2 },
    deslocamento: 7,
    idiomasFixos: ["comum", "halfling"],
  },
  {
    id: "draconato",
    nome: "Draconato",
    descricao: "Descendentes de dragões, com presença imponente e sopro elemental.",
    bonusAtributos: { forca: 2, carisma: 1 },
    deslocamento: 9,
    idiomasFixos: ["comum", "draconico"],
  },
  {
    id: "gnomo",
    nome: "Gnomo",
    descricao: "Curiosos e inventivos, com uma mente afiada pra mecanismos e magia.",
    bonusAtributos: { inteligencia: 2 },
    deslocamento: 7,
    idiomasFixos: ["comum", "gnomico"],
  },
  {
  id: "meio-elfo",
  nome: "Meio-Elfo",
  bonusAtributos: { carisma: 2 },
  atributosEscolhaLivre: 2,
  deslocamento: 9,
  idiomasFixos: ["comum", "elfico"], idiomasEscolha: 1,
  periciasEscolha: { quantidade: 2, opcoes: "todas" },
},
  {
    id: "meio-orc",
    nome: "Meio-Orc",
    descricao: "Fortes e resilientes, com uma ferocidade que os torna temíveis em combate.",
    bonusAtributos: { forca: 2, constituicao: 1 },
    deslocamento: 9,
    idiomasFixos: ["comum", "orc"],
  },
  {
    id: "tiefling",
    nome: "Tiefling",
    descricao: "Marcados por uma ascendência infernal distante, carismáticos e resistentes a fogo.",
    bonusAtributos: { carisma: 2, inteligencia: 1 },
    deslocamento: 9,
    idiomasFixos: ["comum", "infernal"],
  },
];

export function obterRaca(id, subracaId) {
  const raca = RACAS.find((item) => item.id === id) ?? null;
  const subraca = raca?.subracas?.find((item) => item.id === subracaId);
  if (!subraca) return raca;
  return { ...raca, nome: subraca.nome, bonusAtributos: { ...raca.bonusAtributos, ...subraca.bonusAtributos }, pvPorNivel: subraca.pvPorNivel ?? 0, armaduras: subraca.armaduras ?? [] };
}
