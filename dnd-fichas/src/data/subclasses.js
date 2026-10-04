// Duas subclasses disponíveis por classe. As características por nível ficam
// em habilidadesSubclasses.js, enquanto as regras especiais de magia e de
// recursos ficam em seus módulos próprios.

export const NIVEL_ESCOLHA_SUBCLASSE = {
  barbaro: 3,
  bardo: 3,
  bruxo: 1,
  clerigo: 1,
  druida: 2,
  feiticeiro: 1,
  guerreiro: 3,
  ladino: 3,
  mago: 2,
  monge: 3,
  paladino: 3,
  patrulheiro: 3,
};

const SUBCLASSES_BASE = [
  { id: "berserker", classeId: "barbaro", nome: "Trilha do Berserker", nivel: 3, descricao: "Entra num estado de fúria ainda mais intensa (Frenesi), causando dano extra mas sofrendo exaustão depois." },
  { id: "totem-guerreiro", classeId: "barbaro", nome: "Trilha do Totem Guerreiro", nivel: 3, descricao: "Escolhe um espírito totêmico (Urso, Águia ou Lobo) que concede um benefício passivo durante a fúria." },

  { id: "colegio-conhecimento", classeId: "bardo", nome: "Colégio do Conhecimento", nivel: 3, descricao: "Ganha proficiência em 3 perícias extras e pode usar Palavras de Corte pra atrapalhar rolagens de inimigos." },
  // RULEBOOK FACT: Livro do Jogador (2014), p. 55,
  // "Proficiência Adicional" e "Inspiração em Combate".
  { id: "colegio-bravura", classeId: "bardo", nome: "Colégio da Bravura", nivel: 3, descricao: "Ganha proficiência com armaduras médias, escudos e armas marciais; outra criatura com seu dado de Inspiração pode usá-lo no dano ou na CA contra um ataque." },

  // RULEBOOK FACT: Livro do Jogador (2014), pp. 59-60,
  // "Lista de Magia Expandida" e "Presença Feérica".
  { id: "patrono-arquifada", classeId: "bruxo", nome: "Patrono: O Arquifada", nivel: 1, descricao: "Amplia sua lista de magias de Bruxo e usa Presença Feérica para tentar enfeitiçar ou amedrontar criaturas próximas." },
  { id: "patrono-corruptor", classeId: "bruxo", nome: "Patrono: O Corruptor", nivel: 1, descricao: "Pacto com um demônio; ganha PV temporário extra ao reduzir um inimigo a 0 PV." },
  { id: "patrono-grande-antigo", classeId: "bruxo", nome: "Patrono: O Grande Antigo", nivel: 1, descricao: "O pacto desperta comunicação telepática e poderes ligados à mente, entropia e controle." },

  { id: "dominio-conhecimento", classeId: "clerigo", nome: "Domínio do Conhecimento", nivel: 1, descricao: "Concede idiomas, perícias especializadas e poderes de descoberta, leitura de pensamentos e visão do passado." },
  { id: "dominio-enganacao", classeId: "clerigo", nome: "Domínio da Enganação", nivel: 1, descricao: "Concede bênçãos furtivas, duplicidade ilusória e poderes de ocultação." },
  { id: "dominio-guerra", classeId: "clerigo", nome: "Domínio da Guerra", nivel: 1, descricao: "Concede treinamento marcial e poderes para orientar ataques e combater na linha de frente." },
  { id: "dominio-vida", classeId: "clerigo", nome: "Domínio da Vida", nivel: 1, descricao: "Magias de cura ficam mais eficientes; ganha proficiência com armaduras pesadas." },
  { id: "dominio-luz", classeId: "clerigo", nome: "Domínio da Luz", nivel: 1, descricao: "Ganha truques extras de dano radiante/fogo e pode causar um clarão cegante nos inimigos." },
  { id: "dominio-natureza", classeId: "clerigo", nome: "Domínio da Natureza", nivel: 1, descricao: "Concede um truque de Druida, treinamento com armadura pesada e poderes sobre animais, plantas e elementos." },
  { id: "dominio-tempestade", classeId: "clerigo", nome: "Domínio da Tempestade", nivel: 1, descricao: "Concede treinamento marcial e poderes de trovão, relâmpago e tempestade." },

  { id: "circulo-terra", classeId: "druida", nome: "Círculo da Terra", nivel: 2, descricao: "Ganha magias extras de acordo com o terreno e pode recuperar espaços de magia uma vez por dia." },
  { id: "circulo-lua", classeId: "druida", nome: "Círculo da Lua", nivel: 2, descricao: "Pode se transformar em bestas mais poderosas em combate, usando Forma Selvagem como ação bônus." },

  { id: "linhagem-draconica", classeId: "feiticeiro", nome: "Linhagem Dracônica", nivel: 1, descricao: "Ascendência dracônica dá PV extra, resistência a um tipo de dano e melhora sua CA sem armadura." },
  { id: "magia-selvagem", classeId: "feiticeiro", nome: "Magia Selvagem", nivel: 1, descricao: "Ao conjurar magias, pode disparar um Surto Selvagem: um efeito mágico aleatório e imprevisível." },

  { id: "campeao", classeId: "guerreiro", nome: "Campeão", nivel: 3, descricao: "Aumenta a faixa de acerto crítico dos seus ataques com armas." },
  { id: "cavaleiro-arcano", classeId: "guerreiro", nome: "Cavaleiro Arcano", nivel: 3, descricao: "Guerreiro que combina combate e magias arcanas." },
  { id: "mestre-de-batalha", classeId: "guerreiro", nome: "Mestre de Batalha", nivel: 3, descricao: "Aprende manobras de combate especiais (Superioridade em Combate) usando dados de superioridade." },

  { id: "ladrao", classeId: "ladino", nome: "Ladrão", nivel: 3, descricao: "Fica mais ágil com objetos e escalada, e pode usar itens mágicos rapidamente como ação bônus." },
  { id: "trapaceiro-arcano", classeId: "ladino", nome: "Trapaceiro Arcano", nivel: 3, descricao: "Ladino que usa magias arcanas para enganar e se infiltrar." },
  // RULEBOOK FACT: Livro do Jogador (2014), p. 92, "Assassinar".
  { id: "assassino", classeId: "ladino", nome: "Assassino", nivel: 3, descricao: "Tem vantagem nas jogadas de ataque contra criaturas que ainda não agiram; ataques que atinjam criaturas surpreendidas são críticos." },

  { id: "escola-evocacao", classeId: "mago", nome: "Escola de Evocação", nivel: 2, descricao: "Pode moldar magias de área pra não atingir aliados, e causa dano extra com magias de evocação." },
  { id: "escola-abjuracao", classeId: "mago", nome: "Escola de Abjuração", nivel: 2, descricao: "Pode criar um Escudo Arcano que absorve dano ao conjurar magias de abjuração." },
  { id: "escola-adivinhacao", classeId: "mago", nome: "Escola de Adivinhação", nivel: 2, descricao: "Especializa-se em presságios, recupera recursos ao conjurar adivinhações e amplia seus sentidos." },
  { id: "escola-conjuracao", classeId: "mago", nome: "Escola de Conjuração", nivel: 2, descricao: "Cria objetos menores, teleporta-se e fortalece criaturas que conjura." },
  { id: "escola-encantamento", classeId: "mago", nome: "Escola de Encantamento", nivel: 2, descricao: "Hipnotiza criaturas e aprende a redirecionar ou dividir encantamentos." },
  { id: "escola-ilusao", classeId: "mago", nome: "Escola de Ilusão", nivel: 2, descricao: "Aprimora ilusões menores e aprende a moldar ilusões já conjuradas." },
  { id: "escola-necromancia", classeId: "mago", nome: "Escola de Necromancia", nivel: 2, descricao: "Extrai vigor da morte e fortalece mortos-vivos criados por suas magias." },
  { id: "escola-transmutacao", classeId: "mago", nome: "Escola de Transmutação", nivel: 2, descricao: "Transforma materiais e cria uma pedra capaz de conceder benefícios mutáveis." },

  // RULEBOOK FACT: Livro do Jogador (2014), p. 105, "Técnica da Mão Aberta".
  { id: "mao-aberta", classeId: "monge", nome: "Caminho da Mão Aberta", nivel: 3, descricao: "Golpes da Rajada de Golpes podem derrubar, empurrar ou impedir reações do alvo." },
  { id: "sombra", classeId: "monge", nome: "Caminho da Sombra", nivel: 3, descricao: "Aprende truques de magia sombria: teleportar entre sombras e criar escuridão." },
  { id: "quatro-elementos", classeId: "monge", nome: "Caminho dos Quatro Elementos", nivel: 3, descricao: "Aprende disciplinas elementais alimentadas por pontos de chi." },

  { id: "juramento-devocao", classeId: "paladino", nome: "Juramento da Devoção", nivel: 3, descricao: "Focado em honra e proteção; ganha magias sagradas extras e pode punir inimigos com mais força." },
  { id: "juramento-vinganca", classeId: "paladino", nome: "Juramento da Vingança", nivel: 3, descricao: "Focado em perseguir e abater um alvo específico, com vantagem em ataques contra ele." },
  { id: "juramento-ancioes", classeId: "paladino", nome: "Juramento dos Anciões", nivel: 3, descricao: "Protege a luz e a vida, usando a natureza para restringir inimigos e defender aliados da magia." },

  { id: "cacador", classeId: "patrulheiro", nome: "Caçador", nivel: 3, descricao: "Ganha talentos de combate especializados contra tipos específicos de ameaça." },
  // RULEBOOK FACT: Livro do Jogador (2014), p. 119,
  // "Companheiro Animal" e "Vínculo com o Companheiro".
  { id: "mestre-das-feras", classeId: "patrulheiro", nome: "Mestre das Feras", nivel: 3, descricao: "Cria um vínculo com um companheiro animal que age na própria iniciativa e obedece aos seus comandos; seus benefícios evoluem com o nível." },
  { id: "rastreador-subterraneo", classeId: "patrulheiro", nome: "Conclave do Rastreador Subterrâneo", nivel: 3, descricao: "Especialista em emboscadas e exploração subterrânea, com magia adicional e defesas mentais." },
];

export const PAGINAS_SUBCLASSES = {
  berserker: [49, 49], "totem-guerreiro": [49, 50],
  "colegio-conhecimento": [54, 55], "colegio-bravura": [55, 55],
  "patrono-arquifada": [59, 60], "patrono-corruptor": [60, 60], "patrono-grande-antigo": [60, 61],
  "dominio-conhecimento": [66, 67], "dominio-enganacao": [67, 68], "dominio-guerra": [68, 68],
  "dominio-luz": [68, 69], "dominio-natureza": [69, 69], "dominio-tempestade": [69, 70], "dominio-vida": [70, 70],
  "circulo-terra": [75, 76], "circulo-lua": [76, 76],
  "linhagem-draconica": [80, 81], "magia-selvagem": [81, 82],
  campeao: [85, 86], "cavaleiro-arcano": [86, 87], "mestre-de-batalha": [87, 88],
  assassino: [92, 92], ladrao: [92, 92], "trapaceiro-arcano": [92, 93],
  "escola-abjuracao": [97, 98], "escola-adivinhacao": [98, 98], "escola-conjuracao": [98, 99],
  "escola-encantamento": [99, 99], "escola-evocacao": [99, 100], "escola-ilusao": [100, 100],
  "escola-necromancia": [100, 101], "escola-transmutacao": [101, 101],
  "mao-aberta": [105, 106], sombra: [106, 106], "quatro-elementos": [106, 107],
  "juramento-devocao": [112, 112], "juramento-ancioes": [112, 113], "juramento-vinganca": [114, 114],
  "mestre-das-feras": [119, 120], cacador: [120, 121], "rastreador-subterraneo": [121, 121],
};

export const SUBCLASSES = SUBCLASSES_BASE.map((subclasse) => {
  const [printedPage, endPrintedPage] = PAGINAS_SUBCLASSES[subclasse.id];
  return {
    ...subclasse,
    catalogVersion: 1,
    rulesProfile: "dnd5e-books-2014",
    verificationStatus: "verified",
    automationLevel: "assisted",
    sourceRefs: [{
      ruleId: `R-SUBCLASS-${subclasse.id.toUpperCase()}`,
      bookId: "LJ",
      edition: "dnd5e-books-2014",
      printedPage,
      endPrintedPage,
      section: subclasse.nome,
    }],
  };
});

export function obterSubclassesPorClasse(classeId) {
  return SUBCLASSES.filter((s) => s.classeId === classeId);
}

export function obterSubclasse(id) {
  return SUBCLASSES.find((s) => s.id === id) ?? null;
}

export function obterNivelEscolhaSubclasse(classeId) {
  return NIVEL_ESCOLHA_SUBCLASSE[classeId] ?? null;
}
