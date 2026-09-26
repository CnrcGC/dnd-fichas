import { Routes, Route } from "react-router-dom";
import Topbar from "./components/layout/Topbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Ficha from "./pages/Ficha";
import NovaFicha from "./pages/NovaFicha";
import PainelRolagens from "./components/rolagem/PainelRolagens";
import AvisoPersistencia from "./components/layout/AvisoPersistencia";
import RouteAccessibility from "./components/layout/RouteAccessibility";
import SystemSelector from "./pages/SystemSelector";
import PlatformPlaceholder from "./pages/PlatformPlaceholder";
import CharacterRoute from "./pages/CharacterRoute";

export default function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo-principal">Pular para o conteúdo principal</a>
      <RouteAccessibility />
      <Topbar />
      <AvisoPersistencia />
      <main className="app-main" id="conteudo-principal" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/characters/new" element={<SystemSelector />} />
          <Route path="/characters/:id" element={<CharacterRoute />} />
          <Route path="/characters/:id/tabletop" element={<PlatformPlaceholder title="Modo de mesa" description="Esta rota está reservada para as ações compactas fornecidas pelo engine do sistema. Nenhuma regra é duplicada nesta tela." />} />
          <Route path="/creatures" element={<PlatformPlaceholder title="Criaturas" description="A biblioteca será habilitada apenas para sistemas com capacidade de criatura validada." />} />
          <Route path="/encounters" element={<PlatformPlaceholder title="Encontros" description="O rastreador leve de encontros permanece desabilitado até os contratos de participantes por sistema estarem concluídos." />} />
          <Route path="/settings" element={<PlatformPlaceholder title="Configurações" description="O seletor de tema já está disponível no cabeçalho. Preferências adicionais serão adicionadas sem dados sensíveis." />} />
          <Route path="/ficha/:id" element={<Ficha />} />
          <Route path="/nova" element={<NovaFicha />} />
          <Route path="*" element={<PlatformPlaceholder title="Página não encontrada" description="O endereço informado não corresponde a uma área disponível da plataforma." />} />
        </Routes>
      </main>
      <Footer />
      <PainelRolagens />
    </div>
  );
}
