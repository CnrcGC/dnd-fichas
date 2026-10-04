// Antecedentes do manual básico (PHB) — resumos com nossas próprias
// palavras. Cada um concede 2 perícias treinadas automaticamente,
// equipamento inicial (texto, não vira itens de verdade ainda) e uma
// característica narrativa.
const ANTECEDENTES_BASE = [
  {
    id: "acolito",
    nome: "Acólito",
    descricao: "Passou a vida servindo em um templo, aprendendo rituais e doutrina.",
    periciasConcedidas: ["intuicao", "religiao"],
    idiomasEscolha: 2,
    equipamento: "Símbolo sagrado, livro de orações, roupas comuns, 15 po",
    caracteristica: {
      nome: "Refúgio do Templo",
      descricao: "Templos e casas de culto da sua fé te dão ajuda básica de graça.",
    },
  },
  {
    id: "charlatao",
    nome: "Charlatão",
    descricao: "Sobrevive usando identidades falsas, lábia e pequenos golpes cuidadosamente preparados.",
    periciasConcedidas: ["enganacao", "prestidigitacao"],
    ferramentasFixas: ["ferramentas-disfarce", "ferramentas-falsificacao"],
    equipamento: "Roupas finas, kit de disfarce, ferramentas do golpe favorito, 15 po",
    caracteristica: {
      nome: "Identidade Falsa",
      descricao: "Mantém uma segunda identidade completa, com documentos, contatos e disfarces apropriados.",
    },
  },
  {
    id: "criminoso",
    nome: "Criminoso",
    descricao: "Tem um histórico de quebrar a lei e viver à margem dela.",
    periciasConcedidas: ["enganacao", "furtividade"],
    ferramentasFixas: ["ferramentas-ladino"],
    ferramentasEscolha: { quantidade: 1, grupo: "jogos" },
    equipamento: "Pé-de-cabra, roupas escuras com capuz, 15 po",
    caracteristica: {
      nome: "Contato Criminoso",
      descricao: "Você tem um contato confiável no submundo do crime, seu elo com uma rede de outros criminosos.",
    },
  },
  {
    id: "artista",
    nome: "Artista",
    descricao: "Aprendeu a conquistar uma plateia por meio de música, atuação ou outra forma de espetáculo.",
    periciasConcedidas: ["acrobacia", "atuacao"],
    ferramentasFixas: ["ferramentas-disfarce"],
    ferramentasEscolha: {
      quantidade: 1,
      opcoes: ["alaude", "flauta", "tambor", "harpa", "lira", "violino", "gaita-de-foles", "dulcimer", "trompa", "flauta-de-pa", "charamela"],
    },
    equipamento: "Instrumento musical, presente de um admirador, traje, 15 po",
    caracteristica: {
      nome: "Pela Demanda Popular",
      descricao: "Sempre encontra um lugar onde se apresentar e costuma receber comida e hospedagem modestas em troca.",
    },
  },
  {
    id: "heroi-do-povo",
    nome: "Herói do Povo",
    descricao: "Vem de origem humilde, mas já fez algo que o tornou querido pela gente comum.",
    periciasConcedidas: ["adestrarAnimais", "sobrevivencia"],
    ferramentasFixas: ["veiculos-terrestres"],
    ferramentasEscolha: { quantidade: 1, grupo: "artesao" },
    equipamento: "Kit de artesão, uma pá, roupas comuns, 10 po",
    caracteristica: {
      nome: "Hospitalidade Rústica",
      descricao: "Gente comum te esconde e ajuda, mesmo sob risco pessoal.",
    },
  },
  {
    id: "artesao-guildado",
    nome: "Artesão Guildado",
    descricao: "Aprendeu um ofício e é membro reconhecido de uma guilda de artesãos.",
    periciasConcedidas: ["intuicao", "persuasao"],
    ferramentasEscolha: { quantidade: 1, grupo: "artesao" }, idiomasEscolha: 1,
    equipamento: "Ferramentas do seu ofício, carta da guilda, roupas de viajante, 15 po",
    caracteristica: {
      nome: "Filiação à Guilda",
      descricao: "Membros da sua guilda te dão suporte, hospedagem e contatos em outras cidades.",
    },
  },
  {
    id: "eremita",
    nome: "Eremita",
    descricao: "Viveu isolado por um longo período, em busca de reflexão ou segredo.",
    periciasConcedidas: ["medicina", "religiao"],
    idiomasEscolha: 1, ferramentasFixas: ["kit-ervanario"],
    equipamento: "Kit de curandeiro, diário espiritual, roupas comuns, 5 po",
    caracteristica: {
      nome: "Descoberta",
      descricao: "Seu tempo em reclusão te revelou um grande segredo ou uma verdade oculta sobre o universo.",
    },
  },
  {
    id: "nobre",
    nome: "Nobre",
    descricao: "Nasceu em berço de riqueza, privilégio e poder.",
    periciasConcedidas: ["historia", "persuasao"],
    idiomasEscolha: 1, ferramentasEscolha: { quantidade: 1, grupo: "jogos" },
    equipamento: "Roupas finas, um anel de sinete, 25 po",
    caracteristica: {
      nome: "Posição Privilegiada",
      descricao: "Sua origem nobre abre portas — as pessoas assumem que você tem autoridade e o direito de estar em qualquer lugar.",
    },
  },
  {
    id: "forasteiro",
    nome: "Forasteiro",
    descricao: "Cresceu longe das cidades, viajando por regiões selvagens e aprendendo a viver da terra.",
    periciasConcedidas: ["atletismo", "sobrevivencia"],
    idiomasEscolha: 1,
    ferramentasEscolha: {
      quantidade: 1,
      opcoes: ["alaude", "flauta", "tambor", "harpa", "lira", "violino", "gaita-de-foles", "dulcimer", "trompa", "flauta-de-pa", "charamela"],
    },
    equipamento: "Cajado, armadilha de caça, troféu de um animal, roupas de viajante, 10 po",
    caracteristica: {
      nome: "Andarilho",
      descricao: "Recorda mapas e terrenos com facilidade e consegue encontrar alimento e água para um pequeno grupo em terras férteis.",
    },
  },
  {
    id: "sabio",
    nome: "Sábio",
    descricao: "Passou anos estudando os segredos do universo em bibliotecas e academias.",
    periciasConcedidas: ["arcanismo", "historia"],
    idiomasEscolha: 2,
    equipamento: "Tinteiro, livro sobre um tema que você estuda, roupas comuns, 10 po",
    caracteristica: {
      nome: "Pesquisador",
      descricao: "Quando não sabe uma informação, geralmente sabe onde ou com quem procurá-la.",
    },
  },
  {
    id: "marinheiro",
    nome: "Marinheiro",
    descricao: "Passou anos a bordo de embarcações, enfrentando longas viagens, tempestades e portos distantes.",
    periciasConcedidas: ["atletismo", "percepcao"],
    ferramentasFixas: ["ferramentas-navegador", "veiculos-aquaticos"],
    equipamento: "Clava, corda de seda, amuleto da sorte, roupas comuns, 10 po",
    caracteristica: {
      nome: "Passagem de Navio",
      descricao: "Pode conseguir transporte marítimo gratuito para si e seus companheiros quando houver uma embarcação amiga disponível.",
    },
  },
  {
    id: "soldado",
    nome: "Soldado",
    descricao: "Serviu numa força militar, aprendendo disciplina, tática e combate.",
    periciasConcedidas: ["atletismo", "intimidacao"],
    ferramentasFixas: ["veiculos-terrestres"],
    ferramentasEscolha: { quantidade: 1, grupo: "jogos" },
    equipamento: "Símbolo de patente, troféu de um inimigo caído, roupas comuns, 10 po",
    caracteristica: {
      nome: "Posto Militar",
      descricao: "Você pode invocar seu posto pra conseguir acesso a acampamentos militares e apoio de outros soldados de sua nação.",
    },
  },
  {
    id: "orfao",
    nome: "Órfão",
    descricao: "Cresceu sozinho nas ruas e aprendeu a sobreviver sem dinheiro, proteção ou uma família.",
    periciasConcedidas: ["prestidigitacao", "furtividade"],
    ferramentasFixas: ["ferramentas-disfarce", "ferramentas-ladino"],
    equipamento: "Faca pequena, mapa da cidade, lembrança dos pais, roupas comuns, 10 po",
    caracteristica: {
      nome: "Segredos da Cidade",
      descricao: "Conhece passagens e atalhos urbanos que permitem atravessar cidades mais rapidamente fora de combate.",
    },
  },
];

const PAGINAS_ANTECEDENTES = {
  acolito: 127,
  charlatao: 128,
  criminoso: 129,
  artista: 130,
  "heroi-do-povo": 131,
  "artesao-guildado": 132,
  eremita: 134,
  nobre: 135,
  forasteiro: 136,
  sabio: 137,
  marinheiro: 139,
  soldado: 140,
  orfao: 141,
};

export const REGRA_PERSONALIZACAO_ANTECEDENTE = {
  pericias: 2,
  combinacaoIdiomasFerramentas: 2,
  descricao: "Permite trocar a característica, escolher duas perícias e uma combinação total de duas proficiências em ferramentas ou idiomas.",
  sourceRefs: [{ ruleId: "R-BACKGROUND-CUSTOM", bookId: "LJ", edition: "dnd5e-books-2014", printedPage: 125, section: "Personalizando um Antecedente" }],
};

export const ANTECEDENTES = ANTECEDENTES_BASE.map((antecedente) => ({
  ...antecedente,
  equipamentoInicial: { descricao: antecedente.equipamento },
  personalizacaoPermitida: true,
  catalogVersion: 1,
  rulesProfile: "dnd5e-books-2014",
  verificationStatus: "verified",
  automationLevel: "assisted",
  sourceRefs: [{
    ruleId: `R-BACKGROUND-${antecedente.id.toUpperCase()}`,
    bookId: "LJ",
    edition: "dnd5e-books-2014",
    printedPage: PAGINAS_ANTECEDENTES[antecedente.id],
    section: antecedente.nome,
  }],
}));

export function obterAntecedente(id) {
  return ANTECEDENTES.find((antecedente) => antecedente.id === id) ?? null;
}
