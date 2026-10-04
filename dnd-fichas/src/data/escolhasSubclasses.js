import { ESTILOS_COMBATE } from "./escolhasClasses";

const opcao = (id, nome, requisitos = {}) => ({ id, nome, requisitos });
const fonte = (subclasseId, printedPage, endPrintedPage, section) => [{
  ruleId: `R-SUBCLASS-CHOICE-${subclasseId.toUpperCase()}-${section.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
  bookId: "LJ",
  edition: "dnd5e-books-2014",
  printedPage,
  endPrintedPage,
  section,
}];

export const MANOBRAS_MESTRE_BATALHA = [
  "aparar", "ataque-ameacador", "ataque-desarmante", "ataque-distrativo", "ataque-estendido",
  "ataque-finta", "ataque-manobra", "ataque-preciso", "ataque-provocante", "ataque-varredura",
  "comandar", "contra-atacar", "derrubar", "empurrar", "passo-evasivo", "presenca-marcante",
].map((id) => opcao(id, id.split("-").map((parte) => parte[0].toUpperCase() + parte.slice(1)).join(" ")));

export const DISCIPLINAS_ELEMENTAIS = [
  opcao("chicote-agua", "Chicote de Água"), opcao("garras-serpente-fogo", "Garras da Serpente de Fogo"),
  opcao("punho-ar-inquebrantavel", "Punho do Ar Inquebrantável"), opcao("investida-espiritos-vendaval", "Investida dos Espíritos do Vendaval"),
  opcao("forma-rio-corrente", "Forma do Rio Corrente"), opcao("punho-quatro-trovoes", "Punho dos Quatro Trovões"),
  opcao("varrer-cinzas", "Varrer as Cinzas"), opcao("agarrar-vento-norte", "Agarrar o Vento Norte", { nivelMinimo: 6 }),
  opcao("gongue-pico", "Gongue do Pico", { nivelMinimo: 6 }), opcao("chamas-fenix", "Chamas da Fênix", { nivelMinimo: 11 }),
  opcao("cavalgar-vento", "Cavalgar o Vento", { nivelMinimo: 11 }), opcao("postura-nevoa", "Postura de Névoa", { nivelMinimo: 11 }),
  opcao("defesa-montanha-eterna", "Defesa da Montanha Eterna", { nivelMinimo: 17 }), opcao("onda-terra-rolante", "Onda da Terra Rolante", { nivelMinimo: 17 }),
  opcao("rio-chama-faminta", "Rio da Chama Faminta", { nivelMinimo: 17 }), opcao("sopro-inverno", "Sopro do Inverno", { nivelMinimo: 17 }),
];

const TOTENS = [opcao("aguia", "Águia"), opcao("lobo", "Lobo"), opcao("urso", "Urso")];
const TERRENOS = ["artico", "costa", "deserto", "floresta", "montanha", "pantano", "planicie", "subterraneo"]
  .map((id) => opcao(id, id[0].toUpperCase() + id.slice(1)));
const ANCESTRAIS_DRACONICOS = [
  ["azul", "elétrico"], ["branco", "frio"], ["bronze", "elétrico"], ["cobre", "ácido"], ["latão", "fogo"],
  ["negro", "ácido"], ["ouro", "fogo"], ["prata", "frio"], ["verde", "veneno"], ["vermelho", "fogo"],
].map(([id, dano]) => opcao(id, `${id[0].toUpperCase() + id.slice(1)} — ${dano}`));

export const ESCOLHAS_SUBCLASSES = [
  { id: "totem-espirito", subclasseId: "totem-guerreiro", nivel: 3, nome: "Totem Espiritual", quantidade: 1, opcoes: TOTENS, sourceRefs: fonte("totem-guerreiro", 49, 50, "Totem Espiritual") },
  { id: "totem-aspecto", subclasseId: "totem-guerreiro", nivel: 6, nome: "Aspecto da Besta", quantidade: 1, opcoes: TOTENS, sourceRefs: fonte("totem-guerreiro", 50, 50, "Aspecto da Besta") },
  { id: "conhecimento-pericias-bardo", subclasseId: "colegio-conhecimento", nivel: 3, nome: "Proficiências Adicionais", quantidade: 3, opcoesDinamicas: "todas-pericias", sourceRefs: fonte("colegio-conhecimento", 54, 55, "Proficiência Adicional") },
  { id: "conhecimento-pericias", subclasseId: "dominio-conhecimento", nivel: 1, nome: "Perícias de Conhecimento", quantidade: 2, opcoesFixas: ["arcanismo", "historia", "natureza", "religiao"], opcoesDinamicas: "pericias-fixas", sourceRefs: fonte("dominio-conhecimento", 66, 67, "Bênçãos do Conhecimento") },
  { id: "conhecimento-idiomas", subclasseId: "dominio-conhecimento", nivel: 1, nome: "Idiomas de Conhecimento", quantidade: 2, opcoesDinamicas: "idiomas", sourceRefs: fonte("dominio-conhecimento", 66, 67, "Bênçãos do Conhecimento") },
  { id: "natureza-truque", subclasseId: "dominio-natureza", nivel: 1, nome: "Truque de Druida", quantidade: 1, tipo: "texto", sourceRefs: fonte("dominio-natureza", 69, 69, "Acólito da Natureza") },
  { id: "natureza-pericia", subclasseId: "dominio-natureza", nivel: 1, nome: "Perícia de Natureza", quantidade: 1, opcoesFixas: ["adestrarAnimais", "natureza", "sobrevivencia"], opcoesDinamicas: "pericias-fixas", sourceRefs: fonte("dominio-natureza", 69, 69, "Acólito da Natureza") },
  { id: "circulo-terreno", subclasseId: "circulo-terra", nivel: 3, nome: "Terreno do Círculo", quantidade: 1, opcoes: TERRENOS, sourceRefs: fonte("circulo-terra", 75, 76, "Magias de Círculo") },
  { id: "ancestral-draconico", subclasseId: "linhagem-draconica", nivel: 1, nome: "Ancestral Dracônico", quantidade: 1, opcoes: ANCESTRAIS_DRACONICOS, sourceRefs: fonte("linhagem-draconica", 80, 81, "Ancestral Dracônico") },
  { id: "campeao-estilo-adicional", subclasseId: "campeao", nivel: 10, nome: "Estilo de Combate Adicional", quantidade: 1, opcoes: ESTILOS_COMBATE, excluirEscolhasClasse: ["guerreiro-estilo"], sourceRefs: fonte("campeao", 85, 86, "Estilo de Luta Adicional") },
  { id: "mestre-batalha-manobras", subclasseId: "mestre-de-batalha", nivel: 3, nome: "Manobras", quantidadePorNivel: [[3, 3], [7, 5]], opcoes: MANOBRAS_MESTRE_BATALHA, sourceRefs: fonte("mestre-de-batalha", 87, 88, "Superioridade em Combate") },
  { id: "mestre-batalha-ferramenta", subclasseId: "mestre-de-batalha", nivel: 3, nome: "Ferramenta de Artesão", quantidade: 1, opcoesDinamicas: "ferramentas-artesao", sourceRefs: fonte("mestre-de-batalha", 87, 88, "Estudioso da Guerra") },
  { id: "adivinhacao-terceiro-olho", subclasseId: "escola-adivinhacao", nivel: 10, nome: "O Terceiro Olho", quantidade: 1, opcoes: [opcao("visao-escuro", "Visão no Escuro"), opcao("visao-eterea", "Visão Etérea"), opcao("compreensao-maior", "Compreensão Maior"), opcao("ver-invisibilidade", "Ver Invisibilidade")], sourceRefs: fonte("escola-adivinhacao", 98, 98, "O Terceiro Olho") },
  { id: "transmutacao-pedra", subclasseId: "escola-transmutacao", nivel: 6, nome: "Benefício da Pedra de Transmutador", quantidade: 1, opcoes: [opcao("visao-escuro", "Visão no Escuro"), opcao("deslocamento", "Deslocamento Aumentado"), opcao("salvaguarda-constituicao", "Proficiência em Constituição"), opcao("resistencia-elemental", "Resistência Elemental")], sourceRefs: fonte("escola-transmutacao", 101, 101, "Pedra de Transmutador") },
  { id: "transmutacao-resistencia", subclasseId: "escola-transmutacao", nivel: 6, nome: "Tipo de Resistência da Pedra", quantidade: 1, dependeDe: { escolhaId: "transmutacao-pedra", valor: "resistencia-elemental" }, opcoes: [opcao("acido", "Ácido"), opcao("eletrico", "Elétrico"), opcao("fogo", "Fogo"), opcao("frio", "Frio"), opcao("trovejante", "Trovejante")], sourceRefs: fonte("escola-transmutacao", 101, 101, "Pedra de Transmutador") },
  { id: "quatro-elementos-disciplinas", subclasseId: "quatro-elementos", nivel: 3, nome: "Disciplinas Elementais", quantidadePorNivel: [[3, 1], [6, 2]], opcoes: DISCIPLINAS_ELEMENTAIS, sourceRefs: fonte("quatro-elementos", 106, 107, "Disciplinas Elementais") },
  { id: "cacador-presa", subclasseId: "cacador", nivel: 3, nome: "Presa do Caçador", quantidade: 1, opcoes: [opcao("matador-colossos", "Matador de Colossos"), opcao("matador-gigantes", "Matador de Gigantes"), opcao("quebrador-hordas", "Quebrador de Hordas")], sourceRefs: fonte("cacador", 120, 121, "Presa do Caçador") },
  { id: "cacador-tatica", subclasseId: "cacador", nivel: 7, nome: "Táticas Defensivas", quantidade: 1, opcoes: [opcao("escapar-horda", "Escapar da Horda"), opcao("defesa-multiataque", "Defesa contra Multiataque"), opcao("vontade-aco", "Vontade de Aço")], sourceRefs: fonte("cacador", 120, 121, "Táticas Defensivas") },
].map((escolha) => ({ ...escolha, catalogVersion: 1, rulesProfile: "dnd5e-books-2014", verificationStatus: "verified", automationLevel: "assisted" }));

export function obterEscolhasPorSubclasse(subclasseId, nivel = 20) {
  return ESCOLHAS_SUBCLASSES.filter((item) => item.subclasseId === subclasseId && item.nivel <= Number(nivel));
}
