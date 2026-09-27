import { useLocation, useNavigate } from "react-router-dom";
import { listSystems } from "../../platform/systems/registry";
import { readActiveSystem, writeActiveSystem } from "../../platform/preferences/activeSystem";
import { getSystemIdFromPath, systemPath } from "../../platform/routing/routes";

export default function SystemSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSystem = getSystemIdFromPath(location.pathname) ?? readActiveSystem() ?? "";

  function handleChange(event) {
    const systemId = event.target.value;
    if (!systemId) return;
    writeActiveSystem(systemId);
    navigate(systemPath(systemId));
  }

  return (
    <label className="system-switcher">
      <span className="visually-hidden">Sistema ativo</span>
      <select aria-label="Sistema ativo" value={activeSystem} onChange={handleChange}>
        <option value="" disabled>Escolher sistema</option>
        {listSystems().map((system) => <option key={system.id} value={system.id}>{system.displayName}</option>)}
      </select>
    </label>
  );
}

