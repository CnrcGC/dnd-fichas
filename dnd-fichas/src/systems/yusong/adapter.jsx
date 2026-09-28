import PlatformPlaceholder from "../../pages/PlatformPlaceholder";
import { assertSystemAdapter } from "../../platform/systems/adapterContract";
import { createSystemRoutes } from "../../platform/routing/routes";
import PilaresLibrary from "./PilaresLibrary";
import PilaresCharacter from "./PilaresCharacter";
import PilaresCreator from "./PilaresCreator";
import { yusongEngine } from "./engine";

const pending = (title, description) => <PlatformPlaceholder title={title} description={description} />;

export const yusongAdapter = assertSystemAdapter({
  id: yusongEngine.systemId,
  displayName: "Pilares de Atlas",
  currentSchemaVersion: yusongEngine.currentSchemaVersion,
  createDefault: yusongEngine.createCharacter,
  migrate: yusongEngine.migrateCharacter,
  validate: yusongEngine.validateCharacter,
  getSummary: yusongEngine.summarize,
  routes: createSystemRoutes(yusongEngine.systemId),
  renderLibrary: () => <PilaresLibrary />,
  renderCharacter: () => <PilaresCharacter />,
  renderCreator: () => <PilaresCreator />,
  renderPrint: () => pending("Exportação de Pilares de Atlas", "A apresentação e a exportação visual serão migradas com a interface de Pilares de Atlas."),
  getTabletopActions: () => [],
  capabilities: Object.freeze({ creator: true, character: true, print: false, tabletop: false, creatures: false, encounters: false }),
});

