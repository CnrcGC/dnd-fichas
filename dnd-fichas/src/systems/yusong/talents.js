const talentDefinitions = [
  // BRUTO
  {
    id: "devolucao",
    name: "Devolução",
    category: "bruto",
    staminaCostPercent: 15,
    action: "Padrão",
    prerequisites: "5 FOR, 5 POD",
    description:
      "O usuário sabe devolver ataques com a mesma potência que recebeu. Adiciona o último dano total recebido, sem contar RDs, na sua próxima rolagem de ataque.",
  },
  {
    id: "corpo-de-ferro",
    name: "Corpo de Ferro",
    category: "bruto",
    staminaCostPercent: 13,
    action: "Padrão",
    prerequisites: "5 CON",
    description:
      "O usuário tem uma resistência gigante, podendo aguentar até ataques super poderosos. Recebe apenas metade do próximo dano recebido.",
  },
  {
    id: "passo-do-tita",
    name: "Passo do Titã",
    category: "bruto",
    staminaCostPercent: 10,
    action: "Completa",
    prerequisites: "3 FOR, 4 TAM",
    description:
      "Você faz uma ação chamativa e puxa o agressor de outra pessoa para você.",
  },
  {
    id: "esmaga-ossos",
    name: "Esmaga Ossos",
    category: "bruto",
    staminaCostPercent: 18,
    action: "Livre",
    prerequisites: "4 FOR",
    description:
      "Quando você tirar dano máximo, pode rolar um dado de um nível inferior ao dano e somá-lo.",
  },
  {
    id: "forca-abrupta",
    name: "Força Abrupta",
    category: "bruto",
    staminaCostPercent: 15,
    action: "Movimento",
    prerequisites: "",
    description:
      "O usuário começa a usar 100% da sua força, ganhando +3 de Força até o final da cena.",
  },
  {
    id: "face-do-medo",
    name: "Face do Medo",
    category: "bruto",
    staminaCostPercent: 10,
    action: "Movimento",
    prerequisites: "5 TAM",
    description:
      "Uma expressão vazia e amedrontadora faz todos lhe temerem. O alvo realiza um teste de Poder contra Poder, Carisma ou Tamanho do usuário. Se falhar, entra em Amedrontado. O alvo recebe -5 nesse teste.",
  },
  {
    id: "voraz",
    name: "Voraz",
    category: "bruto",
    staminaCostPercent: 20,
    action: "Padrão",
    prerequisites: "5 FOR",
    description:
      "O usuário se move de maneira bestial, entrando em estado de fúria e recebendo +2 nos testes físicos e de luta.",
  },
  {
    id: "sedento",
    name: "Sedento",
    category: "bruto",
    staminaCostPercent: 0,
    action: "Passiva",
    prerequisites: "7 FOR",
    description:
      "O usuário é movido pela derrota dos inimigos. Ganha +1 ação na rodada em que desmaiar ou matar um alvo.",
  },
  {
    id: "predador",
    name: "Predador",
    category: "bruto",
    staminaCostPercent: 10,
    action: "Padrão",
    prerequisites: "5 TAM",
    description:
      "O usuário usa técnicas de caça contra um alvo, recebendo +4 em todos os testes contra esse alvo por 1d4+1 rodadas.",
  },
  {
    id: "demonio",
    name: "Demônio",
    category: "bruto",
    staminaCostPercent: 0,
    action: "Passiva",
    prerequisites: "5 POD, 5 CON",
    description:
      "O usuário se transforma conforme a luta. Enquanto estiver com metade da Vida Real, ganha +1d no dano.",
  },

  // ÁGIL
  {
    id: "filho-do-vento",
    name: "Filho do Vento",
    category: "agil",
    staminaCostPercent: 13,
    action: "Movimento",
    prerequisites: "4 AGI",
    description:
      "O usuário se torna um com o vento. Durante 1d6 rodadas, cada esquiva realizada com Filho do Vento concede 1 Ponto de Vento. Ao obter este talento, também recebe Tornado, Trem Bala e Clack Boom.",
    grants: ["tornado", "trem-bala", "clack-boom"],
  },
  {
    id: "tornado",
    name: "Tornado",
    category: "agil",
    staminaCostPercent: 0,
    specialCost: "1 Ponto de Vento",
    action: "Livre",
    prerequisites: "Derivado de Filho do Vento",
    derivedFrom: "filho-do-vento",
    description:
      "Sua velocidade surreal facilita esquivas. Ganha +4 no teste de uma esquiva.",
  },
  {
    id: "trem-bala",
    name: "Trem Bala",
    category: "agil",
    staminaCostPercent: 0,
    specialCost: "1 Ponto de Vento",
    action: "Livre",
    prerequisites: "Derivado de Filho do Vento",
    derivedFrom: "filho-do-vento",
    description:
      "Um ataque tão rápido e potente que o inimigo mal consegue resistir. Ganha +4 no teste de ataque.",
  },
  {
    id: "clack-boom",
    name: "Clack Boom",
    category: "agil",
    staminaCostPercent: 0,
    specialCost: "2 Pontos de Vento",
    action: "Livre",
    prerequisites: "Derivado de Filho do Vento",
    derivedFrom: "filho-do-vento",
    description:
      "Um contra-ataque na velocidade de um tiro. É um acerto automático e adiciona +1d6 de dano para cada 2 Pontos de Vento consumidos.",
  },
  {
    id: "reacao-instantanea",
    name: "Reação Instantânea",
    category: "agil",
    staminaCostPercent: 13,
    action: "Livre",
    prerequisites: "7 REA",
    description:
      "Sempre que for pedida iniciativa, você pode gastar Stamina para agir primeiro e receber +2 na Esquiva.",
  },
  {
    id: "sexto-sentido",
    name: "Sexto Sentido",
    category: "agil",
    staminaCostPercent: 25,
    action: "Reação",
    prerequisites: "5 REA",
    description:
      "Você prevê os ataques do alvo e esquiva naturalmente, realizando uma esquiva automática.",
  },
  {
    id: "ankle-breaker",
    name: "Ankle-Breaker",
    category: "agil",
    staminaCostPercent: 10,
    action: "Movimento",
    prerequisites: "4 AGI",
    description:
      "Você se movimenta de forma ágil para derrubar o inimigo. Faça um teste usando 2 membros seus + Força contra um teste de Força do alvo. Você recebe +4 nesse teste.",
  },
  {
    id: "instinto",
    name: "Instinto",
    category: "agil",
    staminaCostPercent: 13,
    action: "Padrão",
    prerequisites: "4 POD",
    description:
      "Após perder a esperança nos aliados, o instinto sobrepõe a razão. O usuário luta sozinho, ignorando auxílio de aliados, e adiciona +2d8 nas rolagens de luta.",
  },
  {
    id: "anti-queda",
    name: "Anti Queda",
    category: "agil",
    staminaCostPercent: 0,
    action: "Passiva",
    prerequisites: "5 REA",
    description:
      "Quando um ataque derrubaria o usuário, ele se levanta automaticamente, perdendo a desvantagem.",
  },
  {
    id: "sincronia-do-vento",
    name: "Sincronia do Vento",
    category: "agil",
    staminaCostPercent: 18,
    action: "Padrão",
    prerequisites: "5 AGI, 5 REA",
    description:
      "Para cada aliado da classe Ágil, você pode fazer um ataque junto a ele.",
  },
  {
    id: "passos-da-noite",
    name: "Passos da Noite",
    category: "agil",
    staminaCostPercent: 8,
    action: "Livre",
    prerequisites: "5 AGI",
    description:
      "Seus passos são quase imperceptíveis. Você tem vantagem em testes de Furtividade e +4 nesses testes.",
  },

  // TÁTICO
  {
    id: "aprendiz-nato",
    name: "Aprendiz Nato",
    category: "tatico",
    staminaCostPercent: 0,
    specialCost: "Varia",
    action: "Varia",
    prerequisites: "7 INT",
    description:
      "Quando alguém usar um talento que você não possui, você pode copiar o talento utilizado, gastando uma quantidade de Stamina igual ao talento copiado.",
  },
  {
    id: "mestre-em-armas",
    name: "Mestre em Armas",
    category: "tatico",
    staminaCostPercent: 20,
    action: "Padrão",
    prerequisites: "5 INT",
    description:
      "Qualquer objeto em sua mão vira uma verdadeira arma. Você recebe vantagem quando estiver armado.",
  },
  {
    id: "acao-calculada",
    name: "Ação Calculada",
    category: "tatico",
    staminaCostPercent: 15,
    action: "Padrão",
    prerequisites: "3 INT",
    description:
      "Todos os seus movimentos são pensados meticulosamente. Some +2 em todos os testes de combate, incluindo dano, esquiva e contra-ataque, por 1d4+1 rodadas.",
  },
  {
    id: "brecha",
    name: "Brecha",
    category: "tatico",
    staminaCostPercent: 10,
    action: "Reação",
    prerequisites: "4 REA",
    description:
      "Você analisa uma brecha na armadura inimiga. O próximo golpe nesse ponto fraco soma +1d6 no dano do ataque por 1d6 rodadas.",
  },
  {
    id: "anular",
    name: "Anular",
    category: "tatico",
    staminaCostPercent: 25,
    action: "Varia",
    prerequisites: "7 POD, 7 INT",
    description:
      "Ao analisar o oponente durante o combate, você se adapta e pode não sofrer os efeitos de um talento adversário enquanto se mantiver focado.",
  },
  {
    id: "premeditar",
    name: "Premeditar",
    category: "tatico",
    staminaCostPercent: 13,
    action: "Livre",
    prerequisites: "5 REA",
    description:
      "Quando um inimigo for atacar um aliado, você consegue avisar antes do ataque chegar, dando vantagem para a reação do aliado.",
  },
  {
    id: "pressao-espiritual",
    name: "Pressão Espiritual",
    category: "tatico",
    staminaCostPercent: 15,
    action: "Completa",
    prerequisites: "4 TAM",
    description:
      "Você emana sua presença no ambiente. Faça um teste de Tamanho contra Poder do oponente. Se seu resultado for maior, o adversário fica Ansioso.",
  },
  {
    id: "bioanalise",
    name: "Bioanálise",
    category: "tatico",
    staminaCostPercent: 20,
    action: "Padrão",
    prerequisites: "5 REA, 5 INT",
    description:
      "Você conhece pontos vulneráveis do corpo humano. Enquanto o alvo estiver em pose de luta, você tem +4 em testes de Ataque e Esquiva.",
  },
  {
    id: "calmaria",
    name: "Calmaria",
    category: "tatico",
    staminaCostPercent: 10,
    action: "Completo",
    prerequisites: "5 POD",
    description:
      "Controlando a respiração com movimentos suaves, você consegue se acalmar e se livrar de qualquer efeito mental que o aflija.",
  },

  // COMANDO
  {
    id: "zona",
    name: "Zona",
    category: "comando",
    staminaCostPercent: 20,
    action: "Completo",
    prerequisites: "7 POD",
    description:
      "Um domínio pertencente aos escolhidos. Você utiliza 100% da sua capacidade, dobrando seus resultados de luta.",
  },
  {
    id: "declaracao-de-guerra",
    name: "Declaração de Guerra",
    category: "comando",
    staminaCostPercent: 10,
    action: "Padrão",
    prerequisites: "4 TAM",
    description:
      "Falas pesadas e desestabilizadoras impõem sua superioridade. Recebe +5 em testes de Intimidação.",
  },
  {
    id: "vida-longa-ao-rei",
    name: "Vida Longa ao Rei",
    category: "comando",
    staminaCostPercent: 40,
    action: "Padrão",
    prerequisites: "5 CON",
    description:
      "Você consegue resistir a golpes que normalmente desmaiariam pessoas, restaurando uma armadura zerada.",
  },
  {
    id: "general",
    name: "General",
    category: "comando",
    staminaCostPercent: 15,
    action: "Padrão",
    prerequisites: "3 CAR",
    description:
      "Você realiza falas encorajadoras. Todos os membros da party ficam Motivados.",
  },
  {
    id: "lingua-afiada",
    name: "Língua Afiada",
    category: "comando",
    staminaCostPercent: 13,
    action: "Livre",
    prerequisites: "4 CAR",
    description:
      "Suas mentiras são naturais e persuasivas. Recebe +2 em testes para Lábia.",
  },
  {
    id: "determinado",
    name: "Determinado",
    category: "comando",
    staminaCostPercent: 18,
    action: "Movimento",
    prerequisites: "4 POD",
    description:
      "Você usa sua força de vontade para refazer um teste de resistência.",
  },
  {
    id: "blefe-sutil",
    name: "Blefe Sutil",
    category: "comando",
    staminaCostPercent: 15,
    action: "Movimento",
    prerequisites: "",
    description:
      "Movimentos precisos e convincentes são trocados por golpes mais certeiros. Recebe vantagem no teste de ataque.",
  },
  {
    id: "guarda-de-campo",
    name: "Guarda de Campo",
    category: "comando",
    staminaCostPercent: 10,
    action: "Movimento",
    prerequisites: "4 INT",
    description:
      "Você cria estratégias sobre o alvo, como impedir movimentos de esquiva ou movimentação colocando obstáculos e armadilhas táticas.",
  },

  // GERAL
  {
    id: "dinamico",
    name: "Dinâmico",
    category: "geral",
    staminaCostPercent: 0,
    action: "Passiva",
    prerequisites: "4 REA",
    description:
      "Ao enfrentar 2 pessoas ou mais em batalha, você ganha +1 ação e +2 em todos os testes.",
  },
  {
    id: "bloqueio-forcado",
    name: "Bloqueio Forçado",
    category: "geral",
    staminaCostPercent: 18,
    action: "Livre",
    prerequisites: "5 REA",
    description:
      "Você sacrifica um dos membros para impedir um dano explosivo em ponto vital.",
  },
  {
    id: "controle-forcado",
    name: "Controle Forçado",
    category: "geral",
    staminaCostPercent: 20,
    action: "Completo",
    prerequisites: "",
    description:
      "Ao estar fora de si em um estado mental instável, você pode forçar o controle através da dor. Quanto maior o dano causado, maior a efetividade.",
  },
  {
    id: "abencoado",
    name: "Abençoado",
    category: "geral",
    staminaCostPercent: 0,
    action: "Passiva",
    prerequisites: "",
    description:
      "Todas as rolagens de Sorte possuem vantagem. Quando critar em um ataque, tirando o resultado máximo no dado, adicione +15 na rolagem.",
  },
  {
    id: "aura",
    name: "Aura",
    category: "geral",
    staminaCostPercent: 0,
    action: "Passiva",
    prerequisites: "4 TAM, 4 POD",
    description:
      "Sua presença muda a tensão no clima e torna o ar denso. Você tem +4 em testes de Intimidação.",
  },
  {
    id: "sanguineo",
    name: "Sanguíneo",
    category: "geral",
    staminaCostPercent: 0,
    action: "Passiva",
    prerequisites: "",
    description:
      "Escolha entre Socos, Chutes, Esquivas, Contra-ataques, Bloqueios ou Perícias. Some +3 nessas rolagens.",
  },
  {
    id: "ego-real",
    name: "Ego Real",
    category: "geral",
    staminaCostPercent: 0,
    action: "Passiva",
    prerequisites: "4 POD",
    description:
      "Enquanto seu Poder for maior que o dos oponentes, some +3 em todas as suas rolagens.",
  },
  {
    id: "quebrar-limite",
    name: "Quebrar Limite",
    category: "geral",
    staminaCostPercent: 23,
    action: "Padrão",
    prerequisites: "7 POD",
    description:
      "Reduza sua Armadura pela metade, arredondando para cima. Em troca, adicione +1d do tipo mais alto do seu ataque a todas as rolagens de luta, incluindo ataques, esquivas e contra-ataques.",
  },
  {
    id: "genio",
    name: "Gênio",
    category: "geral",
    staminaCostPercent: 25,
    action: "Reação",
    prerequisites: "5 INT",
    description:
      "Uma vez por sessão, você pode maximizar o resultado para forçar um crítico.",
  },
  {
    id: "malandro",
    name: "Malandro",
    category: "geral",
    staminaCostPercent: 25,
    action: "Reação",
    prerequisites: "5 POD",
    description:
      "Uma vez por sessão, você pode zerar o teste de um oponente ou aliado com uma ação questionável que só você faria.",
  },
  {
    id: "resiliencia",
    name: "Resiliência",
    category: "geral",
    staminaCostPercent: 0,
    action: "Passiva",
    prerequisites: "5 CON",
    description:
      "Se a armadura do personagem for destruída de uma vez só, ele não desmaia. Além disso, ganha +2 RD.",
  },
];


export const YUSONG_TALENT_CATEGORIES = Object.freeze([
  { id: "all", label: "Todos" },
  { id: "geral", label: "Geral" },
  { id: "bruto", label: "Bruto" },
  { id: "agil", label: "Ágil" },
  { id: "tatico", label: "Tático" },
  { id: "comando", label: "Comando" },
]);

export const YUSONG_TALENTS = Object.freeze(talentDefinitions.map((talent) => Object.freeze({
  ...talent,
  ...(talent.grants ? { grants: Object.freeze([...talent.grants]) } : {}),
})));

export function filterYusongTalents({ search = "", category = "all" } = {}) {
  const normalizedSearch = String(search).trim().toLocaleLowerCase("pt-BR");
  return YUSONG_TALENTS.filter((talent) => {
    const matchesCategory = category === "all" || talent.category === category;
    const matchesSearch = !normalizedSearch || talent.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });
}

export function getYusongTalent(talentId) {
  return YUSONG_TALENTS.find((talent) => talent.id === talentId) ?? null;
}

