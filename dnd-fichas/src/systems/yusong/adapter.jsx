import PlatformPlaceholder from "../../pages/PlatformPlaceholder";
import { assertSystemAdapter } from "../../platform/systems/adapterContract";
import { createSystemRoutes } from "../../platform/routing/routes";
import { yusongEngine } from "./engine";

const pending = (title, description) => <PlatformPlaceholder title={title} description={description} />;

export const yusongAdapter = assertSystemAdapter({
  id: yusongEngine.systemId,
  displayName: "Yusong",
  currentSchemaVersion: yusongEngine.currentSchemaVersion,
  createDefault: yusongEngine.createCharacter,
  migrate: yusongEngine.migrateCharacter,
  validate: yusongEngine.validateCharacter,
  getSummary: yusongEngine.summarize,
  routes: createSystemRoutes(yusongEngine.systemId),
  renderLibrary: () => pending("Personagens Yusong", "A seção Yusong está isolada e pronta para receber a biblioteca e a interface preservadas no pacote FE-05."),
  renderCharacter: () => pending("Ficha Yusong", "A ficha será conectada ao engine Yusong sem alterar as fórmulas caracterizadas."),
  renderCreator: () => pending("Novo personagem Yusong", "A criação Yusong será habilitada no pacote FE-05."),
  renderPrint: () => pending("Exportação Yusong", "A apresentação e a exportação visual serão migradas com a interface Yusong."),
  getTabletopActions: () => [],
  capabilities: Object.freeze({ creator: false, character: false, print: false, tabletop: false, creatures: false, encounters: false }),
});

