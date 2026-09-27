import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { getSystemIdFromPath } from "../../platform/routing/routes";
import { getSystem } from "../../platform/systems/registry";

const routeTitles = [
  [/^\/$/, "Escolher sistema"],
  [/^\/characters\/new$/, "Novo personagem"],
  [/^\/(nova)$/, "Nova ficha D&D"],
  [/\/tabletop$/, "Modo de mesa"],
  [/\/characters\/new$/, "Novo personagem"],
  [/\/characters\/[^/]+\/print$/, "Imprimir personagem"],
  [/\/characters\/[^/]+$/, "Ficha de personagem"],
  [/\/creatures$/, "Criaturas"],
  [/\/encounters$/, "Encontros"],
  [/^\/settings/, "Configurações"],
];

export default function RouteAccessibility() {
  const location = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    const systemId = getSystemIdFromPath(location.pathname);
    const systemName = systemId ? getSystem(systemId).displayName : null;
    const routeTitle = routeTitles.find(([pattern]) => pattern.test(location.pathname))?.[1]
      ?? (systemName && location.pathname.split("/").filter(Boolean).length === 1 ? "Personagens" : "Página não encontrada");
    document.title = `${routeTitle}${systemName ? ` — ${systemName}` : ""} · Plataforma de RPG`;
    if (navigationType === "POP") return;
    requestAnimationFrame(() => {
      const heading = document.querySelector("main h1");
      if (heading && !heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: false });
    });
  }, [location.pathname, navigationType]);
  return null;
}

