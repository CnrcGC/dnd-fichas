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
    const initialFocus = document.activeElement;
    if (navigationType === "REPLACE" && initialFocus === document.body && /^\/(dnd5e|yusong|feiticeiros-maldicoes)$/.test(location.pathname)) return;
    const main = document.querySelector("main");
    function focusReadyHeading() {
      const heading = main?.querySelector("h1");
      if (!heading || heading.closest('[aria-busy="true"]')) return;
      observer.disconnect();
      // Se a pessoa já navegou para outro controle durante o carregamento,
      // preservar essa escolha de foco.
      if (document.activeElement !== initialFocus && document.activeElement !== document.body) return;
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }
    const observer = new MutationObserver(focusReadyHeading);
    if (main) observer.observe(main, { childList: true, subtree: true });
    const frame = requestAnimationFrame(focusReadyHeading);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [location.pathname, navigationType]);
  return null;
}

