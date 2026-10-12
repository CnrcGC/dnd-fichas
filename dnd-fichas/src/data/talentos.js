import { MANOBRAS_MESTRE_BATALHA } from "./escolhasSubclasses";

const opcao = (id, nome) => ({ id, nome });
const atributos = (...ids) => ids.map((id) => opcao(id, id[0].toUpperCase() + id.slice(1)));
const danosElementais = ["acido", "eletrico", "fogo", "frio", "trovao"]
  .map((id) => opcao(id, id[0].toUpperCase() + id.slice(1)));
const classesConjuradoras = ["bardo", "bruxo", "clerigo", "druida", "feiticeiro", "mago"]
  .map((id) => opcao(id, id[0].toUpperCase() + id.slice(1)));

const escolha = (id, nome, quantidade, extras = {}) => ({ id, nome, quantidade, ...extras });
const talento = (id, nome, printedPage, descricao, extras = {}) => ({
  id,
  nome,
  descricao,
  catalogVersion: 1,
  rulesProfile: "dnd5e-books-2014",
  verificationStatus: "verified",
  automationLevel: extras.automationLevel ?? "descriptive",
  sourceRefs: [{
    ruleId: `R-FEAT-${id.toUpperCase()}`,
    bookId: "LJ",
    edition: "dnd5e-books-2014",
    printedPage,
    section: nome,
  }],
  ...extras,
});

// Livro do Jogador, capítulo 6, pp. 167–171. Os IDs antigos foram mantidos
// quando já existiam para não quebrar fichas salvas.
export const TALENTOS = [
  talento("adepto-elemental", "Adepto Elemental", 167, "Escolha um tipo elemental: suas magias ignoram resistência a esse dano e tratam resultados 1 nos dados de dano como 2.", { preRequisito: { conjurador: true }, repetivel: true, escolhas: [escolha("tipo-dano", "Tipo de dano", 1, { opcoes: danosElementais })], automationLevel: "assisted" }),
  talento("adepto-marcial", "Adepto Marcial", 167, "Aprende duas manobras de Mestre de Batalha e recebe um dado de superioridade d6, recuperado em descanso curto ou longo.", { escolhas: [escolha("manobras", "Manobras", 2, { opcoes: MANOBRAS_MESTRE_BATALHA }), escolha("atributo-cd", "Atributo da CD", 1, { opcoes: atributos("forca", "destreza") })], recursos: [{ id: "dado-superioridade-adepto", nome: "Dado de Superioridade (Adepto Marcial)", formulaMaximo: { base: 1 }, restauraEm: "curto" }], automationLevel: "assisted" }),
  talento("alerta", "Alerta", 167, "Recebe +5 na iniciativa, não pode ser surpreendido enquanto consciente e não concede vantagem apenas por não enxergar o atacante."),
  talento("combatente-duas-armas", "Ambidestro", 167, "Recebe +1 na CA com uma arma corpo a corpo em cada mão, pode lutar com armas não leves de uma mão e sacar ou guardar duas armas."),
  talento("atacante-selvagem", "Atacante Bestial", 167, "Uma vez por turno, pode rolar novamente os dados de dano de um ataque corpo a corpo com arma e escolher um dos resultados."),
  talento("atirador-certeiro", "Atirador Aguçado", 167, "Ataques com armas à distância ignoram longo alcance e cobertura parcial; pode aceitar –5 no ataque para receber +10 no dano."),
  talento("atirador-magia", "Atirador de Magia", 167, "Dobra o alcance de ataques mágicos, ignora cobertura parcial e ensina um truque de ataque.", { preRequisito: { conjurador: true }, escolhas: [escolha("classe", "Lista de magia", 1, { opcoes: classesConjuradoras }), escolha("truque", "Truque de ataque", 1, { tipo: "texto" })], automationLevel: "assisted" }),
  talento("atleta", "Atleta", 168, "Aumenta Força ou Destreza em 1 e facilita levantar, escalar e saltar com corrida curta.", { escolhas: [escolha("atributo", "Atributo", 1, { opcoes: atributos("forca", "destreza"), incrementoAtributo: 1 })], automationLevel: "assisted" }),
  talento("ator", "Ator", 168, "Aumenta Carisma em 1 e melhora disfarces vocais e interpretações de outra pessoa.", { incrementoAtributo: { atributo: "carisma", valor: 1 }, automationLevel: "assisted" }),
  talento("combatente-montado", "Combatente Montado", 168, "Aprimora ataques montados, permite redirecionar ataques e protege a montaria contra efeitos de Destreza."),
  talento("conjurador-guerra", "Conjurador de Guerra", 169, "Ajuda a manter concentração, permite componentes somáticos com mãos ocupadas e conjurar uma magia no lugar de ataque de oportunidade.", { preRequisito: { conjurador: true } }),
  talento("conjurador-ritual", "Conjurador de Ritual", 169, "Concede um livro com dois rituais de nível 1 de uma lista escolhida e permite copiar outros rituais elegíveis.", { preRequisito: { atributoQualquer: ["inteligencia", "sabedoria"], valorMinimo: 13 }, escolhas: [escolha("classe", "Lista de magia", 1, { opcoes: classesConjuradoras }), escolha("rituais", "Rituais iniciais", 2, { tipo: "texto" })], automationLevel: "assisted" }),
  talento("curandeiro", "Curandeiro", 169, "Aprimora o uso de kit de primeiros-socorros para estabilizar e restaurar pontos de vida."),
  talento("duelista-defensivo", "Duelista Defensivo", 169, "Com arma de acuidade proficiente, usa a reação para somar proficiência à CA contra um ataque corpo a corpo.", { preRequisito: { atributo: "destreza", valorMinimo: 13 } }),
  talento("perito-besta-mao", "Especialista em Besta", 169, "Ignora recarga de bestas, evita desvantagem por inimigo adjacente e permite um ataque bônus com besta de mão em condições específicas."),
  talento("brigao-taverna", "Especialista em Briga", 169, "Aumenta Força ou Constituição em 1, melhora ataques desarmados e permite agarrar como ação bônus após certos acertos.", { escolhas: [escolha("atributo", "Atributo", 1, { opcoes: atributos("forca", "constituicao"), incrementoAtributo: 1 })], automationLevel: "assisted" }),
  talento("explorador-cavernas", "Explorador de Cavernas", 169, "Aprimora a detecção e a resistência a portas secretas e armadilhas durante exploração."),
  talento("imobilizador", "Imobilizador", 169, "Concede vantagem contra criatura agarrada e permite tentar imobilizá-la, deixando ambos impedidos.", { preRequisito: { atributo: "forca", valorMinimo: 13 } }),
  talento("iniciado-magia", "Iniciado em Magia", 170, "Aprende dois truques e uma magia de nível 1 de uma única lista conjuradora.", { escolhas: [escolha("classe", "Lista de magia", 1, { opcoes: classesConjuradoras }), escolha("truques", "Truques", 2, { tipo: "texto" }), escolha("magia", "Magia de nível 1", 1, { tipo: "texto" })], automationLevel: "assisted" }),
  talento("investida-poderosa", "Investida Poderosa", 170, "Após usar Disparada e avançar em linha reta, permite um ataque ou empurrão como ação bônus com benefício adicional."),
  talento("lider-inspirador", "Líder Inspirador", 170, "Após dez minutos de discurso, concede PV temporários a até seis criaturas que possam compreender você.", { preRequisito: { atributo: "carisma", valorMinimo: 13 } }),
  talento("mestre-arma-haste", "Maestria em Arma de Haste", 170, "Permite ataque bônus com a extremidade de certas armas e provoca ataques de oportunidade quando inimigos entram no alcance."),
  talento("maestria-armadura-media", "Maestria em Armadura Média", 170, "Remove a desvantagem de Furtividade e amplia o limite de Destreza na CA de armaduras médias.", { preRequisito: { proficienciaArmadura: "medias" } }),
  talento("mestre-armadura-pesada", "Maestria em Armadura Pesada", 170, "Aumenta Força em 1 e reduz dano físico de ataques não mágicos enquanto usa armadura pesada.", { preRequisito: { proficienciaArmadura: "pesadas" }, incrementoAtributo: { atributo: "forca", valor: 1 }, automationLevel: "assisted" }),
  talento("matador-conjuradores", "Matador de Conjuradores", 170, "Concede reação contra conjuração próxima e vantagens para romper concentração e resistir a magias adjacentes."),
  talento("mente-afiada", "Mente Afiada", 170, "Aumenta Inteligência em 1 e aprimora orientação, noção do tempo e memória recente.", { incrementoAtributo: { atributo: "inteligencia", valor: 1 }, automationLevel: "assisted" }),
  talento("mestre-armas", "Mestre de Armas", 170, "Aumenta Força ou Destreza em 1 e concede proficiência em quatro armas escolhidas.", { escolhas: [escolha("atributo", "Atributo", 1, { opcoes: atributos("forca", "destreza"), incrementoAtributo: 1 }), escolha("armas", "Armas", 4, { opcoesDinamicas: "armas" })], automationLevel: "assisted" }),
  talento("mestre-armas-grandes", "Mestre das Armas Grandes", 171, "Pode obter ataque bônus após crítico ou derrubar uma criatura e trocar –5 no ataque por +10 no dano com arma pesada."),
  talento("mestre-escudo", "Mestre de Escudo", 171, "Enquanto usa escudo, pode empurrar após Atacar e recebe benefícios contra certos efeitos de Destreza."),
  talento("movel", "Mobilidade", 171, "Aumenta deslocamento em 3 m, facilita Disparada em terreno difícil e evita ataques de oportunidade de alvos atacados."),
  talento("observador", "Observador", 171, "Aumenta Inteligência ou Sabedoria em 1, permite ler lábios e concede +5 à Percepção e Investigação passivas.", { escolhas: [escolha("atributo", "Atributo", 1, { opcoes: atributos("inteligencia", "sabedoria"), incrementoAtributo: 1 })], automationLevel: "assisted" }),
  talento("habilidoso", "Perito", 171, "Concede proficiência em três perícias ou ferramentas escolhidas.", { escolhas: [escolha("proficiencias", "Perícias ou ferramentas", 3, { opcoesDinamicas: "pericias-ou-ferramentas" })], automationLevel: "assisted" }),
  talento("poliglota", "Poliglota", 171, "Aumenta Inteligência em 1, ensina três idiomas e permite criar criptogramas.", { incrementoAtributo: { atributo: "inteligencia", valor: 1 }, escolhas: [escolha("idiomas", "Idiomas", 3, { opcoesDinamicas: "idiomas" })], automationLevel: "assisted" }),
  talento("protecao-leve", "Proteção Leve", 171, "Aumenta Força ou Destreza em 1 e concede proficiência em armaduras leves.", { escolhas: [escolha("atributo", "Atributo", 1, { opcoes: atributos("forca", "destreza"), incrementoAtributo: 1 })], concedeArmaduras: ["leves"], automationLevel: "assisted" }),
  talento("protecao-moderada", "Proteção Moderada", 171, "Aumenta Força ou Destreza em 1 e concede proficiência em armaduras médias e escudos.", { preRequisito: { proficienciaArmadura: "leves" }, escolhas: [escolha("atributo", "Atributo", 1, { opcoes: atributos("forca", "destreza"), incrementoAtributo: 1 })], concedeArmaduras: ["medias"], concedeEscudo: true, automationLevel: "assisted" }),
  talento("protecao-pesada", "Proteção Pesada", 171, "Aumenta Força em 1 e concede proficiência em armaduras pesadas.", { preRequisito: { proficienciaArmadura: "medias" }, incrementoAtributo: { atributo: "forca", valor: 1 }, concedeArmaduras: ["pesadas"], automationLevel: "assisted" }),
  talento("resiliente", "Resiliente", 171, "Aumenta um atributo em 1 e concede proficiência na salvaguarda correspondente.", { escolhas: [escolha("atributo", "Atributo e salvaguarda", 1, { opcoes: atributos("forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"), incrementoAtributo: 1 })], automationLevel: "assisted" }),
  talento("resistente-phb", "Resistente", 171, "Aumenta Constituição em 1 e estabelece um mínimo de cura ao gastar Dados de Vida.", { incrementoAtributo: { atributo: "constituicao", valor: 1 }, automationLevel: "assisted" }),
  talento("robusto", "Robusto", 171, "Aumenta o máximo de PV em duas vezes o nível atual e acrescenta 2 PV a cada nível futuro.", { automationLevel: "assisted" }),
  talento("sentinela", "Sentinela", 171, "Ataques de oportunidade param o alvo, ignoram Desengajar e podem reagir a ataques contra aliados próximos."),
  talento("sorrateiro", "Sorrateiro", 171, "Melhora esconder-se sob obscurecimento leve, preserva posição após erro à distância e evita penalidade visual da penumbra.", { preRequisito: { atributo: "destreza", valorMinimo: 13 } }),
  talento("sortudo", "Sortudo", 171, "Concede três pontos de sorte para influenciar ataques, testes e salvaguardas próprios ou ataques contra você.", { recursos: [{ id: "pontos-sorte", nome: "Pontos de Sorte", formulaMaximo: { base: 3 }, restauraEm: "longo" }], automationLevel: "assisted" }),
];

export const NIVEIS_ASI_POR_CLASSE = {
  guerreiro: [4, 6, 8, 12, 14, 16, 19],
  ladino: [4, 8, 10, 12, 16, 19],
};

// Versões anteriores usavam `resistente` para representar Resiliente
// (Constituição). A entrada continua consultável para que fichas salvas não
// mudem silenciosamente de regra após a atualização do catálogo.
const TALENTO_RESISTENTE_LEGADO = {
  ...TALENTOS.find((item) => item.id === "resiliente"),
  id: "resistente",
  nome: "Resiliente (Constituição)",
  descricao: "Aumenta Constituição em 1 e concede proficiência em salvaguardas de Constituição.",
  escolhas: [],
  incrementoAtributo: { atributo: "constituicao", valor: 1 },
  legacyAliasFor: "resiliente",
};

export function niveisAsiDaClasse(classeId) {
  return NIVEIS_ASI_POR_CLASSE[classeId] ?? [4, 8, 12, 16, 19];
}

export function obterTalento(id) {
  return TALENTOS.find((item) => item.id === id)
    ?? (id === TALENTO_RESISTENTE_LEGADO.id ? TALENTO_RESISTENTE_LEGADO : null);
}
