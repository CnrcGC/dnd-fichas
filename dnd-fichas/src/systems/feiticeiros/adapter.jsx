import PlatformPlaceholder from "../../pages/PlatformPlaceholder";
import { assertSystemAdapter } from "../../platform/systems/adapterContract";
import { createSystemRoutes } from "../../platform/routing/routes";
import { feiticeirosEngine } from "./engine";

const pending = (title, description) => <PlatformPlaceholder title={title} description={description} />;

export const feiticeirosAdapter = assertSystemAdapter({
  id: feiticeirosEngine.systemId,
  displayName: "Feiticeiros & Maldições",
  currentSchemaVersion: feiticeirosEngine.currentSchemaVersion,
  createDefault: feiticeirosEngine.createCharacter,
  migrate: feiticeirosEngine.migrateCharacter,
  validate: feiticeirosEngine.validateCharacter,
  getSummary: feiticeirosEngine.summarize,
  routes: createSystemRoutes(feiticeirosEngine.systemId),
  renderLibrary: () => pending("Personagens de Feiticeiros & Maldições", "A seção F&M está isolada e pronta para receber a biblioteca após o vertical slice do pacote FE-06."),
  renderCharacter: () => pending("Ficha de Feiticeiros & Maldições", "A ficha será habilitada quando o vertical slice de criação estiver concluído."),
  renderCreator: () => pending("Novo personagem de Feiticeiros & Maldições", "A criação será habilitada no pacote FE-06, usando exclusivamente regras rastreadas da edição 2.5.2."),
  renderPrint: () => pending("Impressão de Feiticeiros & Maldições", "A impressão será definida junto da ficha do sistema."),
  getTabletopActions: () => [],
  capabilities: Object.freeze({ creator: false, character: false, print: false, tabletop: false, creatures: false, encounters: false }),
});

