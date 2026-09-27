import { useEffect } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./components/layout/Topbar";
import Footer from "./components/layout/Footer";
import PainelRolagens from "./components/rolagem/PainelRolagens";
import AvisoPersistencia from "./components/layout/AvisoPersistencia";
import RouteAccessibility from "./components/layout/RouteAccessibility";
import SystemSelector from "./pages/SystemSelector";
import PlatformPlaceholder from "./pages/PlatformPlaceholder";
import CharacterRoute from "./pages/CharacterRoute";
import RootRoute from "./pages/RootRoute";
import SystemRouteView from "./pages/SystemRouteView";
import { ActiveSystemRedirect, LegacyDndCharacterRedirect } from "./pages/LegacySystemRedirect";
import { listSystems } from "./platform/systems/registry";
import { getSystemIdFromPath, systemPath } from "./platform/routing/routes";
import { writeActiveSystem } from "./platform/preferences/activeSystem";

function SystemCapabilityRoute({ system, capability, title, description }) {
  return <PlatformPlaceholder title={`${title} — ${system.displayName}`} description={system[capability] ? description : `${description} Esta capacidade ainda não está habilitada para ${system.displayName}.`} />;
}

export default function App() {
  const location = useLocation();
  const activeSystem = getSystemIdFromPath(location.pathname);

  useEffect(() => {
    if (activeSystem) writeActiveSystem(activeSystem);
  }, [activeSystem]);

  return (
    <div className="app-shell" data-system={activeSystem ?? undefined}>
      <a className="skip-link" href="#conteudo-principal">Pular para o conteúdo principal</a>
      <RouteAccessibility />
      <Topbar />
      <AvisoPersistencia />
      <main className="app-main" id="conteudo-principal" tabIndex="-1">
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/characters/new" element={<SystemSelector />} />
          <Route path="/characters/:id" element={<CharacterRoute />} />
          <Route path="/characters/:id/tabletop" element={<CharacterRoute destination="tabletop" />} />
          <Route path="/creatures" element={<ActiveSystemRedirect suffix="creatures" />} />
          <Route path="/encounters" element={<ActiveSystemRedirect suffix="encounters" />} />
          <Route path="/settings" element={<PlatformPlaceholder title="Configurações" description="O seletor de tema já está disponível no cabeçalho. Preferências adicionais serão adicionadas sem dados sensíveis." />} />
          {listSystems().flatMap((system) => [
            <Route key={`${system.id}:home`} path={systemPath(system.id)} element={<SystemRouteView systemId={system.id} view="library" />} />,
            <Route key={`${system.id}:new`} path={systemPath(system.id, "characters/new")} element={<SystemRouteView systemId={system.id} view="creator" />} />,
            <Route key={`${system.id}:character`} path={systemPath(system.id, "characters/:id")} element={<SystemRouteView systemId={system.id} view="character" />} />,
            <Route key={`${system.id}:print`} path={systemPath(system.id, "characters/:id/print")} element={<SystemRouteView systemId={system.id} view="print" />} />,
            <Route key={`${system.id}:tabletop`} path={systemPath(system.id, "characters/:id/tabletop")} element={<SystemCapabilityRoute system={system} capability="tabletop" title="Modo de mesa" description="As ações compactas serão fornecidas pelo adapter do sistema, sem duplicar regras na interface." />} />,
            <Route key={`${system.id}:creatures`} path={systemPath(system.id, "creatures")} element={<SystemCapabilityRoute system={system} capability="creatures" title="Criaturas" description="A biblioteca será habilitada quando o sistema possuir um contrato de criaturas validado." />} />,
            <Route key={`${system.id}:encounters`} path={systemPath(system.id, "encounters")} element={<SystemCapabilityRoute system={system} capability="encounters" title="Encontros" description="O rastreador permanecerá leve e utilizará participantes pertencentes a um único sistema." />} />,
          ])}
          <Route path="/ficha/:id" element={<LegacyDndCharacterRedirect />} />
          <Route path="/nova" element={<Navigate to="/dnd5e/characters/new" replace />} />
          <Route path="*" element={<PlatformPlaceholder title="Página não encontrada" description="O endereço informado não corresponde a uma área disponível da plataforma." />} />
        </Routes>
      </main>
      <Footer />
      <PainelRolagens />
    </div>
  );
}
