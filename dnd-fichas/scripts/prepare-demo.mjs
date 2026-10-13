import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom", optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const load = (name) => server.ssrLoadModule(`/src/${name}.js`);
  const { criarFichaVazia, normalizarFicha } = await load("utils/ficha");
  const { obterClasse } = await load("data/classes");
  const { obterRaca } = await load("data/racas");
  const { obterAntecedente } = await load("data/antecedentes");
  const { IDIOMAS } = await load("data/idiomas");
  const { opcoesPericias, opcoesFerramentas } = await load("utils/proficienciasCriacao");
  const { MAGIAS } = await load("data/magiasSistema");
  const { magiaPermitidaParaClasse } = await load("utils/acessoMagias");
  const { obterEspacosPorNivel, mesclarEspacosNoAtual } = await load("utils/conjuracao");
  const { obterHabilidadesPorClasse } = await load("data/habilidadesClasses");
  const { sincronizarFichaComSubclasses } = await load("utils/subclassesFicha");
  const { validarFicha, reconciliarEstadoProntidao } = await load("utils/validacaoFicha");
  await mkdir("docs/demo", { recursive: true });
  for (const scenario of [
    { slug: "01-guerreiro-nivel-1", nome: "Aurora - Primeira aventura", classeId: "guerreiro", nivel: 1, antecedenteId: "soldado" },
    { slug: "02-guerreiro-nivel-4", nome: "Breno - Guardião da biblioteca", classeId: "guerreiro", subclasseId: "campeao", nivel: 4, antecedenteId: "soldado" },
    { slug: "03-mago-nivel-4", nome: "Celeste - Guardiã do grimório", classeId: "mago", subclasseId: "escola-evocacao", nivel: 4, antecedenteId: "sabio" },
  ]) {
    let ficha = { ...criarFichaVazia(scenario.nome), ...scenario, id: `demo-${scenario.slug}`, criadoEm: Date.UTC(2026, 9, 10), racaId: "humano", jogador: "Apresentação", historico: "Guardiã(o) da biblioteca local.", objetivo: "Recuperar o grimório perdido.", notas: "Backup de demonstração. Reimporte para reiniciar o roteiro.", moedas: { cobre: 0, prata: 0, electro: 0, ouro: 25, platina: 0 } };
    const mage = ficha.classeId === "mago";
    ficha.atributos = mage ? { forca: 8, destreza: 14, constituicao: 13, inteligencia: 17, sabedoria: 12, carisma: 10 } : { forca: ficha.nivel === 4 ? 17 : 15, destreza: 14, constituicao: 13, inteligencia: 12, sabedoria: 10, carisma: 8 };
    ficha.niveisAsiAplicados = ficha.nivel >= 4 ? [`${ficha.classeId}-4`] : [];
    const classe = obterClasse(ficha.classeId), raca = obterRaca(ficha.racaId), antecedente = obterAntecedente(ficha.antecedenteId);
    const idiomasRaca = IDIOMAS.filter((item) => !raca.idiomasFixos.includes(item.id)).slice(0, raca.idiomasEscolha).map((item) => item.id);
    ficha.escolhasCriacao = {
      periciasClasse: opcoesPericias(classe.proficienciasIniciais.pericias).filter((id) => !antecedente.periciasConcedidas.includes(id)).slice(0, classe.proficienciasIniciais.pericias.quantidade),
      idiomasRaca,
      idiomasAntecedente: IDIOMAS.filter((item) => ![...raca.idiomasFixos, ...idiomasRaca].includes(item.id)).slice(0, antecedente.idiomasEscolha ?? 0).map((item) => item.id),
      ferramentasAntecedente: opcoesFerramentas(antecedente.ferramentasEscolha).slice(0, antecedente.ferramentasEscolha?.quantidade ?? 0),
    };
    ficha.pvPorNivel = Object.fromEntries(Array.from({ length: ficha.nivel }, (_, index) => [index + 1, index === 0 ? classe.dadoVida + 2 : Math.floor(classe.dadoVida / 2) + 3]));
    const pvMax = Object.values(ficha.pvPorNivel).reduce((sum, value) => sum + value, 0);
    ficha.status = { ...ficha.status, pvMax, pvAtual: pvMax - (ficha.nivel > 1 ? 6 : 0), ca: 12, iniciativa: 0 };
    ficha.habilidades = obterHabilidadesPorClasse(ficha.classeId).filter((item) => item.nivel <= ficha.nivel).map((item) => ({ ...item, id: `demo-${item.id}`, origemId: item.id, tipo: "classe" }));
    ficha.inventario = [{ id: "demo-corda", nome: "Corda de viagem", quantidade: 1, peso: 1, tipoItem: "equipamento", equipado: false }];
    ficha.ataques = [{ id: "demo-ataque", nome: mage ? "Cajado" : "Espada longa", atributo: "forca", dano: mage ? "1d6" : "1d8", tipoDano: mage ? "concussão" : "cortante", proficiente: true, bonusManual: 0 }];
    if (!mage) ficha.recursos = [{ id: "demo-folego", nome: "Retomar o Fôlego", usosMax: 1, usosGastos: 0, restauraEm: "curto" }];
    if (mage) {
      const allowed = MAGIAS.filter((item) => item.nivel <= 2 && magiaPermitidaParaClasse(ficha, item, "mago"));
      ficha.magias = [...allowed.filter((item) => item.nivel === 0).slice(0, 4), ...allowed.filter((item) => item.nivel > 0).slice(0, 8)].map((item) => ({ ...item, id: `demo-${item.id}`, origemId: item.id, classeId: "mago", preparada: true }));
      ficha.espacosMagia = mesclarEspacosNoAtual(ficha.espacosMagia, obterEspacosPorNivel("mago", 4));
    }
    ficha = sincronizarFichaComSubclasses(normalizarFicha(ficha));
    const atributosTotais = Object.fromEntries(Object.entries(ficha.atributos).map(([key, value]) => [key, value + 1]));
    const validation = validarFicha(ficha, atributosTotais);
    if (validation.erros.length || validation.pendencias.length) throw Error(`${scenario.nome}: ${JSON.stringify(validation)}`);
    ficha = reconciliarEstadoProntidao({ ...ficha, estadoFicha: "pronta" }, atributosTotais);
    await writeFile(`docs/demo/${scenario.slug}.json`, JSON.stringify(ficha, null, 2) + "\n");
    console.log(`${scenario.slug}: ${ficha.estadoFicha}, ${pvMax} PV`);
  }
} finally { await server.close(); }
