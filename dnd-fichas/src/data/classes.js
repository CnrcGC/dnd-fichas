// Classes do manual básico (PHB): dado de vida, atributo principal e as
// duas salvaguardas em que a classe é proficiente (fixas pela regra, o
// jogador não escolhe).
const CLASSES_BASE = [
  {
    id: "barbaro",
    nome: "Bárbaro",
    descricao: "Guerreiro primitivo que canaliza fúria bruta em combate.",
    dadoVida: 12,
    atributoPrincipal: "forca",
    salvaguardasProficientes: ["forca", "constituicao"],
    proficienciasIniciais: { armaduras: ["leves", "medias"], escudos: true, armas: ["simples", "marciais"], pericias: { quantidade: 2, opcoes: ["adestrarAnimais", "atletismo", "intimidacao", "natureza", "percepcao", "sobrevivencia"] } },
  },
  {
    id: "bardo",
    nome: "Bardo",
    descricao: "Conjurador versátil que usa música e carisma como armas.",
    dadoVida: 8,
    atributoPrincipal: "carisma",
    salvaguardasProficientes: ["destreza", "carisma"],
    proficienciasIniciais: { armaduras: ["leves"], armas: ["simples", "bestas-de-mao", "espadas-longas", "rapieiras", "espadas-curtas"], ferramentasEscolha: { quantidade: 3, opcoes: ["alaude", "flauta", "tambor", "harpa", "lira", "violino"] }, pericias: { quantidade: 3, opcoes: "todas" } },
  },
  {
    id: "bruxo",
    nome: "Bruxo",
    descricao: "Conjurador que trocou favores com um patrono sobrenatural por poder.",
    dadoVida: 8,
    atributoPrincipal: "carisma",
    salvaguardasProficientes: ["sabedoria", "carisma"],
    proficienciasIniciais: { armaduras: ["leves"], armas: ["simples"], pericias: { quantidade: 2, opcoes: ["arcanismo", "enganacao", "historia", "intimidacao", "investigacao", "natureza", "religiao"] } },
  },
  {
    id: "clerigo",
    nome: "Clérigo",
    descricao: "Canal de poder divino, cura aliados e pune inimigos em nome de uma divindade.",
    dadoVida: 8,
    atributoPrincipal: "sabedoria",
    salvaguardasProficientes: ["sabedoria", "carisma"],
    proficienciasIniciais: { armaduras: ["leves", "medias"], escudos: true, armas: ["simples"], pericias: { quantidade: 2, opcoes: ["historia", "intuicao", "medicina", "persuasao", "religiao"] } },
  },
  {
    id: "druida",
    nome: "Druida",
    descricao: "Guardião da natureza, capaz de assumir formas animais e conjurar magia natural.",
    dadoVida: 8,
    atributoPrincipal: "sabedoria",
    salvaguardasProficientes: ["inteligencia", "sabedoria"],
    proficienciasIniciais: { armaduras: ["leves", "medias"], escudos: true, armas: ["clavas", "adagas", "dardos", "azagaias", "macas", "bordoes", "cimitarras", "foices", "fundas", "lancas"], ferramentas: ["kit-ervanario"], idiomas: ["druidico"], pericias: { quantidade: 2, opcoes: ["arcanismo", "adestrarAnimais", "intuicao", "medicina", "natureza", "percepcao", "religiao", "sobrevivencia"] } },
  },
  {
    id: "feiticeiro",
    nome: "Feiticeiro",
    descricao: "Conjurador que nasceu com magia correndo nas veias.",
    dadoVida: 6,
    atributoPrincipal: "carisma",
    salvaguardasProficientes: ["constituicao", "carisma"],
    proficienciasIniciais: { armas: ["adagas", "dardos", "fundas", "bordoes", "bestas-leves"], pericias: { quantidade: 2, opcoes: ["arcanismo", "enganacao", "intuicao", "intimidacao", "persuasao", "religiao"] } },
  },
  {
    id: "guerreiro",
    nome: "Guerreiro",
    descricao: "Mestre em combate, versátil com quase qualquer arma ou armadura.",
    dadoVida: 10,
    atributoPrincipal: "forca",
    salvaguardasProficientes: ["forca", "constituicao"],
    proficienciasIniciais: { armaduras: ["leves", "medias", "pesadas"], escudos: true, armas: ["simples", "marciais"], pericias: { quantidade: 2, opcoes: ["acrobacia", "adestrarAnimais", "atletismo", "historia", "intuicao", "intimidacao", "percepcao", "sobrevivencia"] } },
  },
  {
    id: "ladino",
    nome: "Ladino",
    descricao: "Especialista em furtividade, precisão e resolver problemas por vias criativas.",
    dadoVida: 8,
    atributoPrincipal: "destreza",
    salvaguardasProficientes: ["destreza", "inteligencia"],
    proficienciasIniciais: { armaduras: ["leves"], armas: ["simples", "bestas-de-mao", "espadas-longas", "rapieiras", "espadas-curtas"], ferramentas: ["ferramentas-ladino"], idiomas: ["giria-ladrao"], pericias: { quantidade: 4, opcoes: ["acrobacia", "atletismo", "enganacao", "intuicao", "intimidacao", "investigacao", "percepcao", "atuacao", "persuasao", "prestidigitacao", "furtividade"] } },
  },
  {
    id: "mago",
    nome: "Mago",
    descricao: "Estudioso da magia arcana, aprendida através de anos de estudo.",
    dadoVida: 6,
    atributoPrincipal: "inteligencia",
    salvaguardasProficientes: ["inteligencia", "sabedoria"],
    proficienciasIniciais: { armas: ["adagas", "dardos", "fundas", "bordoes", "bestas-leves"], pericias: { quantidade: 2, opcoes: ["arcanismo", "historia", "intuicao", "investigacao", "medicina", "religiao"] } },
  },
  {
    id: "monge",
    nome: "Monge",
    descricao: "Combatente que canaliza energia interior (ki) em golpes precisos e ágeis.",
    dadoVida: 8,
    atributoPrincipal: "destreza",
    salvaguardasProficientes: ["forca", "destreza"],
    proficienciasIniciais: { armas: ["simples", "espadas-curtas"], ferramentasEscolha: { quantidade: 1, grupo: "artesao-ou-instrumento" }, pericias: { quantidade: 2, opcoes: ["acrobacia", "atletismo", "historia", "intuicao", "religiao", "furtividade"] } },
  },
  {
    id: "paladino",
    nome: "Paladino",
    descricao: "Guerreiro sagrado, ligado por um juramento que concede poderes divinos.",
    dadoVida: 10,
    atributoPrincipal: "forca",
    salvaguardasProficientes: ["sabedoria", "carisma"],
    proficienciasIniciais: { armaduras: ["leves", "medias", "pesadas"], escudos: true, armas: ["simples", "marciais"], pericias: { quantidade: 2, opcoes: ["atletismo", "intuicao", "intimidacao", "medicina", "persuasao", "religiao"] } },
  },
  {
    id: "patrulheiro",
    nome: "Patrulheiro",
    descricao: "Caçador e explorador, combina combate com magia da natureza e rastreamento.",
    dadoVida: 10,
    atributoPrincipal: "destreza",
    salvaguardasProficientes: ["forca", "destreza"],
    proficienciasIniciais: { armaduras: ["leves", "medias"], escudos: true, armas: ["simples", "marciais"], pericias: { quantidade: 3, opcoes: ["adestrarAnimais", "atletismo", "intuicao", "investigacao", "natureza", "percepcao", "furtividade", "sobrevivencia"] } },
  },
];

const PAGINAS_CLASSES = {
  barbaro: [46, 50], bardo: [51, 55], bruxo: [56, 61], clerigo: [62, 70],
  druida: [71, 76], feiticeiro: [77, 82], guerreiro: [83, 88], ladino: [89, 93],
  mago: [94, 101], monge: [102, 107], paladino: [108, 114], patrulheiro: [115, 121],
};

export const CLASSES = CLASSES_BASE.map((classe) => {
  const [printedPage, endPrintedPage] = PAGINAS_CLASSES[classe.id];
  return {
    ...classe,
    catalogVersion: 1,
    rulesProfile: "dnd5e-books-2014",
    verificationStatus: "verified",
    automationLevel: "assisted",
    sourceRefs: [{
      ruleId: `R-CLASS-${classe.id.toUpperCase()}`,
      bookId: "LJ",
      edition: "dnd5e-books-2014",
      printedPage,
      endPrintedPage,
      section: classe.nome,
    }],
  };
});

export function obterClasse(id) {
  return CLASSES.find((classe) => classe.id === id) ?? null;
}
