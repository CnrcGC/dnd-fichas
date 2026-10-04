const referencia = (classeId, printedPage, endPrintedPage, section) => ({
  ruleId: `R-CLASS-CHOICE-${classeId.toUpperCase()}-${section.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
  bookId: "LJ",
  edition: "dnd5e-books-2014",
  printedPage,
  endPrintedPage,
  section,
});

const opcao = (id, nome, descricao, requisitos = {}) => ({ id, nome, descricao, requisitos });

export const ESTILOS_COMBATE = [
  opcao("arquearia", "Arquearia", "+2 nas jogadas de ataque com armas à distância."),
  opcao("defesa", "Defesa", "+1 na CA enquanto estiver usando armadura."),
  opcao("duelismo", "Duelismo", "+2 no dano ao empunhar uma arma corpo a corpo em uma mão e nenhuma outra arma."),
  opcao("armas-grandes", "Luta com Armas Grandes", "Permite rolar novamente certos resultados baixos nos dados de dano de armas empunhadas com duas mãos."),
  opcao("protecao", "Proteção", "Com escudo, pode usar a reação para impor desvantagem a um ataque contra aliado próximo."),
  opcao("duas-armas", "Luta com Duas Armas", "Permite somar o modificador de atributo ao dano do segundo ataque."),
];

export const METAMAGIAS = [
  opcao("magia-cuidadosa", "Magia Cuidadosa", "Protege criaturas escolhidas das piores consequências da salvaguarda da magia."),
  opcao("magia-distante", "Magia Distante", "Amplia o alcance da magia."),
  opcao("magia-potencializada", "Magia Potencializada", "Permite rolar novamente parte dos dados de dano."),
  opcao("magia-estendida", "Magia Estendida", "Dobra a duração de uma magia dentro do limite da característica."),
  opcao("magia-intensificada", "Magia Intensificada", "Impõe desvantagem na primeira salvaguarda de um alvo contra a magia."),
  opcao("magia-acelerada", "Magia Acelerada", "Transforma uma magia de ação em ação bônus."),
  opcao("magia-sutil", "Magia Sutil", "Remove componentes verbais e somáticos."),
  opcao("magia-gemea", "Magia Gêmea", "Faz uma magia elegível que teria um alvo afetar um segundo alvo."),
];

export const DADIVAS_PACTO = [
  opcao("pacto-corrente", "Pacto da Corrente", "Aprimora a obtenção e as opções do familiar."),
  opcao("pacto-lamina", "Pacto da Lâmina", "Permite criar ou vincular uma arma de pacto."),
  opcao("pacto-tomo", "Pacto do Tomo", "Concede um Livro das Sombras com três truques adicionais."),
];

export const INVOCACOES_MISTICAS = [
  opcao("explosao-agonizante", "Explosão Agonizante", "Soma Carisma ao dano de rajada mística.", { magia: "rajada-mistica" }),
  opcao("armadura-sombras", "Armadura de Sombras", "Permite conjurar armadura arcana em si sem gastar espaço."),
  opcao("passo-ascendente", "Passo Ascendente", "Permite conjurar levitação em si sem gastar espaço.", { nivelMinimo: 9 }),
  opcao("fala-bestas", "Fala das Bestas", "Permite conjurar falar com animais sem gastar espaço."),
  opcao("influencia-enganadora", "Influência Enganadora", "Concede proficiência em Enganação e Persuasão."),
  opcao("sussurros-enfeiticantes", "Sussurros Enfeitiçantes", "Permite conjurar compulsão uma vez por descanso longo.", { nivelMinimo: 7 }),
  opcao("livro-segredos-antigos", "Livro dos Segredos Antigos", "Permite registrar e conjurar rituais no Livro das Sombras.", { dadiva: "pacto-tomo" }),
  opcao("correntes-carceri", "Correntes de Cárceri", "Permite conjurar imobilizar monstro em certos extraplanares.", { nivelMinimo: 15, dadiva: "pacto-corrente" }),
  opcao("visao-diabo", "Visão do Diabo", "Enxerga normalmente em escuridão comum e mágica."),
  opcao("palavra-terrivel", "Palavra Terrível", "Permite conjurar confusão uma vez por descanso longo.", { nivelMinimo: 7 }),
  opcao("visao-mistica", "Visão Mística", "Permite conjurar detectar magia sem gastar espaço."),
  opcao("lanca-mistica", "Lança Mística", "Aumenta o alcance de rajada mística.", { magia: "rajada-mistica" }),
  opcao("olhos-guardiao-runas", "Olhos do Guardião das Runas", "Permite ler toda escrita."),
  opcao("vigor-abissal", "Vigor Abissal", "Permite conjurar vida falsa em si sem gastar espaço."),
  opcao("olhar-duas-mentes", "Olhar de Duas Mentes", "Permite perceber pelos sentidos de um humanoide voluntário."),
  opcao("bebedor-vida", "Bebedor de Vida", "Soma Carisma ao dano da arma de pacto.", { nivelMinimo: 12, dadiva: "pacto-lamina" }),
  opcao("mascara-muitas-faces", "Máscara de Muitas Faces", "Permite conjurar disfarçar-se sem gastar espaço."),
  opcao("mestre-multiplas-formas", "Mestre das Múltiplas Formas", "Permite conjurar alterar-se sem gastar espaço.", { nivelMinimo: 15 }),
  opcao("servos-caos", "Servos do Caos", "Permite conjurar conjurar elemental uma vez por descanso longo.", { nivelMinimo: 9 }),
  opcao("mente-pantanosa", "Mente Pantanosa", "Permite conjurar lentidão uma vez por descanso longo.", { nivelMinimo: 5 }),
  opcao("visoes-nevoentas", "Visões Nevoentas", "Permite conjurar imagem silenciosa sem gastar espaço."),
  opcao("uno-sombras", "Uno com as Sombras", "Permite ficar invisível em penumbra ou escuridão até agir ou se mover.", { nivelMinimo: 5 }),
  opcao("salto-sobrenatural", "Salto Sobrenatural", "Permite conjurar salto em si sem gastar espaço.", { nivelMinimo: 9 }),
  opcao("explosao-repelente", "Explosão Repelente", "Rajada mística pode empurrar o alvo.", { magia: "rajada-mistica" }),
  opcao("escultor-carne", "Escultor da Carne", "Permite conjurar metamorfose uma vez por descanso longo.", { nivelMinimo: 7 }),
  opcao("sinal-mau-agouro", "Sinal de Mau Agouro", "Permite conjurar rogar maldição uma vez por descanso longo.", { nivelMinimo: 5 }),
  opcao("ladrao-cinco-destinos", "Ladrão dos Cinco Destinos", "Permite conjurar perdição usando um espaço de magia."),
  opcao("lamina-sedenta", "Lâmina Sedenta", "Permite atacar duas vezes com a arma de pacto.", { nivelMinimo: 5, dadiva: "pacto-lamina" }),
  opcao("visoes-reinos-distantes", "Visões de Reinos Distantes", "Permite conjurar olho arcano sem gastar espaço.", { nivelMinimo: 15 }),
  opcao("voz-mestre-corrente", "Voz do Mestre da Corrente", "Aprimora comunicação e percepção pelo familiar.", { dadiva: "pacto-corrente" }),
  opcao("sussurros-tumba", "Sussurros da Tumba", "Permite conjurar falar com os mortos sem gastar espaço.", { nivelMinimo: 9 }),
  opcao("visao-bruxa", "Visão de Bruxa", "Revela formas verdadeiras próximas.", { nivelMinimo: 15 }),
];

const INIMIGOS_FAVORITOS = [
  "aberrações", "bestas", "celestiais", "constructos", "dragões", "elementais", "fadas",
  "corruptores", "gigantes", "monstruosidades", "limos", "plantas", "mortos-vivos",
].map((id) => opcao(id, id[0].toUpperCase() + id.slice(1), `Especialização contra ${id}.`));
INIMIGOS_FAVORITOS.push(opcao("humanoides", "Dois povos humanoides", "Escolha dois povos humanoides como inimigos favoritos."));

const TERRENOS_FAVORITOS = ["ártico", "costa", "deserto", "floresta", "montanha", "pântano", "planície", "subterrâneo"]
  .map((nome) => opcao(nome.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), nome[0].toUpperCase() + nome.slice(1), `Benefícios de Explorador Nato em ${nome}.`));

export const ESCOLHAS_CLASSES = [
  { id: "bardo-especializacao", classeId: "bardo", nivel: 3, nome: "Especialização", quantidadePorNivel: [[3, 2], [10, 4]], opcoesDinamicas: "pericias-proficientes", sourceRefs: [referencia("bardo", 54, 55, "Aptidão")] },
  { id: "bruxo-invocacoes", classeId: "bruxo", nivel: 2, nome: "Invocações Místicas", quantidadePorNivel: [[2, 2], [5, 3], [7, 4], [9, 5]], opcoes: INVOCACOES_MISTICAS, sourceRefs: [referencia("bruxo", 58, 61, "Invocações Místicas")] },
  { id: "bruxo-dadiva", classeId: "bruxo", nivel: 3, nome: "Dádiva de Pacto", quantidade: 1, opcoes: DADIVAS_PACTO, sourceRefs: [referencia("bruxo", 58, 59, "Dádiva do Pacto")] },
  { id: "feiticeiro-metamagia", classeId: "feiticeiro", nivel: 3, nome: "Metamagia", quantidade: 2, opcoes: METAMAGIAS, sourceRefs: [referencia("feiticeiro", 79, 80, "Metamágica")] },
  { id: "guerreiro-estilo", classeId: "guerreiro", nivel: 1, nome: "Estilo de Combate", quantidade: 1, opcoes: ESTILOS_COMBATE, sourceRefs: [referencia("guerreiro", 85, 85, "Estilo de Luta")] },
  { id: "ladino-especializacao", classeId: "ladino", nivel: 1, nome: "Especialização", quantidadePorNivel: [[1, 2], [6, 4]], opcoesDinamicas: "pericias-ou-ferramentas-proficientes", sourceRefs: [referencia("ladino", 91, 91, "Especialização")] },
  { id: "paladino-estilo", classeId: "paladino", nivel: 2, nome: "Estilo de Combate", quantidade: 1, opcoes: ESTILOS_COMBATE.filter((item) => ["defesa", "duelismo", "armas-grandes", "protecao"].includes(item.id)), sourceRefs: [referencia("paladino", 109, 110, "Estilo de Luta")] },
  { id: "patrulheiro-inimigo", classeId: "patrulheiro", nivel: 1, nome: "Inimigo Favorito", quantidadePorNivel: [[1, 1], [6, 2]], opcoes: INIMIGOS_FAVORITOS, sourceRefs: [referencia("patrulheiro", 116, 118, "Inimigo Favorito")] },
  { id: "patrulheiro-idioma-inimigo", classeId: "patrulheiro", nivel: 1, nome: "Idioma do Inimigo Favorito", quantidadePorNivel: [[1, 1], [6, 2]], opcional: true, opcoesDinamicas: "idiomas", sourceRefs: [referencia("patrulheiro", 116, 118, "Inimigo Favorito")] },
  { id: "patrulheiro-humanoides", classeId: "patrulheiro", nivel: 1, nome: "Povos humanoides favoritos", quantidade: 2, tipo: "texto", dependeDe: { escolhaId: "patrulheiro-inimigo", valor: "humanoides" }, sourceRefs: [referencia("patrulheiro", 116, 118, "Inimigo Favorito")] },
  { id: "patrulheiro-terreno", classeId: "patrulheiro", nivel: 1, nome: "Terreno Favorito", quantidadePorNivel: [[1, 1], [6, 2]], opcoes: TERRENOS_FAVORITOS, sourceRefs: [referencia("patrulheiro", 116, 118, "Explorador Nato")] },
  { id: "patrulheiro-estilo", classeId: "patrulheiro", nivel: 2, nome: "Estilo de Combate", quantidade: 1, opcoes: ESTILOS_COMBATE.filter((item) => ["arquearia", "defesa", "duelismo", "duas-armas"].includes(item.id)), sourceRefs: [referencia("patrulheiro", 117, 117, "Estilo de Luta")] },
].map((escolha) => ({
  ...escolha,
  catalogVersion: 1,
  rulesProfile: "dnd5e-books-2014",
  verificationStatus: "verified",
  automationLevel: "assisted",
}));

export function obterEscolhasPorClasse(classeId, nivel = 20) {
  return ESCOLHAS_CLASSES.filter((escolha) => escolha.classeId === classeId && escolha.nivel <= Number(nivel));
}
