// Sugestões de recursos comuns por classe, pra não precisar cadastrar
// tudo na mão. O número de usos é só um ponto de partida — ajustável
// depois, igual qualquer outro recurso.

const RECURSOS_CLASSES_BASE = [
  { id: "furia", classeId: "barbaro", nome: "Fúria", formulaMaximo: { faixas: [[1, 2], [3, 3], [6, 4], [12, 5], [17, 6]] }, restauraEm: "longo", nivelMinimo: 1 },
  { id: "inspiracao-bardo", classeId: "bardo", nome: "Inspiração de Bardo", nomePorNivel: [[1, "Inspiração de Bardo (d6)"], [5, "Inspiração de Bardo (d8)"]], tipoUsosMax: "modCarisma", restauraEm: "longo", restauraEmPorNivel: [[1, "longo"], [5, "curto"]], nivelMinimo: 1 },
  { id: "canalizar-divindade-clerigo", classeId: "clerigo", nome: "Canalizar Divindade", tipoUsosMax: "faixasNivel", faixas: [[2, 1], [6, 2], [18, 3]], restauraEm: "curto", nivelMinimo: 2 },
  { id: "forma-selvagem", classeId: "druida", nome: "Forma Selvagem", tipoUsosMax: "fixo", valorFixo: 2, restauraEm: "curto", nivelMinimo: 2 },
  { id: "pontos-feiticaria", classeId: "feiticeiro", nome: "Pontos de Feitiçaria", tipoUsosMax: "porNivel", restauraEm: "longo", nivelMinimo: 2 },
  { id: "segundo-folego", classeId: "guerreiro", nome: "Segundo Fôlego", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "curto" },
  { id: "surto-de-acao", classeId: "guerreiro", nome: "Surto de Ação", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "curto", nivelMinimo: 2 },
  { id: "indomavel", classeId: "guerreiro", nome: "Indomável", tipoUsosMax: "faixasNivel", faixas: [[9, 1], [13, 2], [17, 3]], restauraEm: "longo", nivelMinimo: 9 },
  { id: "recuperacao-arcana", classeId: "mago", nome: "Recuperação Arcana", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "longo" },
  { id: "pontos-ki", classeId: "monge", nome: "Pontos de Ki", tipoUsosMax: "porNivel", restauraEm: "curto", nivelMinimo: 2 },
  { id: "sentido-divino", classeId: "paladino", nome: "Sentido Divino", formulaMaximo: { base: 1, atributo: { chave: "carisma", usa: "modificador" }, minimo: 1 }, restauraEm: "longo", nivelMinimo: 1 },
  { id: "imposicao-maos", classeId: "paladino", nome: "Imposição de Mãos", formulaMaximo: { porNivel: 5, minimo: 5 }, restauraEm: "longo", nivelMinimo: 1 },
  { id: "canalizar-divindade-paladino", classeId: "paladino", nome: "Canalizar Divindade", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "curto", nivelMinimo: 3 },
];

const PAGINAS_CLASSES = {
  barbaro: [46, 50], bardo: [51, 55], bruxo: [56, 61], clerigo: [62, 70],
  druida: [71, 76], feiticeiro: [77, 82], guerreiro: [83, 88], mago: [94, 101],
  monge: [102, 107], paladino: [108, 114],
};

export const RECURSOS_CLASSES = RECURSOS_CLASSES_BASE.map((recurso) => {
  const [printedPage, endPrintedPage] = PAGINAS_CLASSES[recurso.classeId];
  return {
    ...recurso,
    catalogVersion: 1,
    rulesProfile: "dnd5e-books-2014",
    verificationStatus: "verified",
    automationLevel: "assisted",
    sourceRefs: [{ ruleId: `R-CLASS-RESOURCE-${recurso.id.toUpperCase()}`, bookId: "LJ", edition: "dnd5e-books-2014", printedPage, endPrintedPage, section: recurso.nome }],
  };
});

export { resolverUsosMax } from "../utils/recurso";
