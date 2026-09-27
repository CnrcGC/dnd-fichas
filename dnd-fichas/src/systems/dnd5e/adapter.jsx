import Home from "../../pages/Home";
import Ficha from "../../pages/Ficha";
import NovaFicha from "../../pages/NovaFicha";
import { assertSystemAdapter } from "../../platform/systems/adapterContract";
import { createSystemRoutes } from "../../platform/routing/routes";
import { dnd5eEngine } from "./engine";

export const dnd5eAdapter = assertSystemAdapter({
  id: dnd5eEngine.systemId,
  displayName: "D&D 5e",
  currentSchemaVersion: dnd5eEngine.currentSchemaVersion,
  createDefault: dnd5eEngine.createCharacter,
  migrate: dnd5eEngine.migrateCharacter,
  validate: dnd5eEngine.validateCharacter,
  getSummary: dnd5eEngine.summarize,
  routes: createSystemRoutes(dnd5eEngine.systemId),
  renderLibrary: () => <Home />,
  renderCharacter: () => <Ficha />,
  renderCreator: () => <NovaFicha />,
  renderPrint: () => <Ficha />,
  getTabletopActions: () => [],
  capabilities: Object.freeze({ creator: true, character: true, print: true, tabletop: false, creatures: false, encounters: false }),
});

