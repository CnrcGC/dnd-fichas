// Somente recursos com usos que o modelo atual de contador consegue
// representar. Características passivas e escolhas táticas ficam descritas
// nas habilidades da subclasse.
import { PAGINAS_SUBCLASSES } from "./subclasses";

const RECURSOS_SUBCLASSES_BASE = [
  { id: "presenca-feerica", classeId: "bruxo", subclasseId: "patrono-arquifada", nivelMinimo: 1, nome: "Presença Feérica", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "curto" },
  { id: "sorte-do-corruptor", classeId: "bruxo", subclasseId: "patrono-corruptor", nivelMinimo: 6, nome: "Sorte do Corruptor", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "curto" },
  { id: "protecao-entropica", classeId: "bruxo", subclasseId: "patrono-grande-antigo", nivelMinimo: 6, nome: "Proteção Entrópica", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "curto" },
  { id: "brilho-protetor", classeId: "clerigo", subclasseId: "dominio-luz", nivelMinimo: 1, nome: "Brilho Protetor", tipoUsosMax: "modSabedoria", restauraEm: "longo" },
  { id: "sacerdote-guerra", classeId: "clerigo", subclasseId: "dominio-guerra", nivelMinimo: 1, nome: "Sacerdote da Guerra", tipoUsosMax: "modSabedoria", restauraEm: "longo" },
  { id: "ira-tormenta", classeId: "clerigo", subclasseId: "dominio-tempestade", nivelMinimo: 1, nome: "Ira da Tormenta", tipoUsosMax: "modSabedoria", restauraEm: "longo" },
  { id: "recuperacao-natural", classeId: "druida", subclasseId: "circulo-terra", nivelMinimo: 2, nome: "Recuperação Natural", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "longo" },
  { id: "mare-do-caos", classeId: "feiticeiro", subclasseId: "magia-selvagem", nivelMinimo: 1, nome: "Maré do Caos", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "longo" },
  { id: "dados-superioridade", classeId: "guerreiro", subclasseId: "mestre-de-batalha", nivelMinimo: 3, nome: "Dados de Superioridade", tipoUsosMax: "faixasNivel", faixas: [[3, 4], [7, 5], [15, 6]], restauraEm: "curto" },
  { id: "prodigio", classeId: "mago", subclasseId: "escola-adivinhacao", nivelMinimo: 2, nome: "Prodígio", tipoUsosMax: "faixasNivel", faixas: [[2, 2], [14, 3]], restauraEm: "longo" },
  { id: "eu-ilusorio", classeId: "mago", subclasseId: "escola-ilusao", nivelMinimo: 10, nome: "Eu Ilusório", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "curto" },
  { id: "metamorfo", classeId: "mago", subclasseId: "escola-transmutacao", nivelMinimo: 10, nome: "Metamorfo", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "curto" },
  { id: "integridade-corporal", classeId: "monge", subclasseId: "mao-aberta", nivelMinimo: 6, nome: "Integridade Corporal", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "longo" },
  { id: "ladrao-de-magias", classeId: "ladino", subclasseId: "trapaceiro-arcano", nivelMinimo: 17, nome: "Ladrão de Magias", tipoUsosMax: "fixo", valorFixo: 1, restauraEm: "longo" },
];

export const RECURSOS_SUBCLASSES = RECURSOS_SUBCLASSES_BASE.map((recurso) => {
  const [printedPage, endPrintedPage] = PAGINAS_SUBCLASSES[recurso.subclasseId];
  return {
    ...recurso,
    catalogVersion: 1,
    rulesProfile: "dnd5e-books-2014",
    verificationStatus: "verified",
    automationLevel: "assisted",
    sourceRefs: [{ ruleId: `R-SUBCLASS-RESOURCE-${recurso.id.toUpperCase()}`, bookId: "LJ", edition: "dnd5e-books-2014", printedPage, endPrintedPage, section: recurso.nome }],
  };
});
