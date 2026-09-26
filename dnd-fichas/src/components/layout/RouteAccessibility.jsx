import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const routeTitles = [
  [/^\/$/, "Personagens"],
  [/^\/characters\/new$/, "Novo personagem"],
  [/^\/(nova)$/, "Nova ficha D&D"],
  [/\/tabletop$/, "Modo de mesa"],
  [/^\/(ficha|characters)\//, "Ficha de personagem"],
  [/^\/creatures/, "Criaturas"],
  [/^\/encounters/, "Encontros"],
  [/^\/settings/, "Configurações"],
];

export default function RouteAccessibility() {
  const location = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    const title = routeTitles.find(([pattern]) => pattern.test(location.pathname))?.[1] ?? "Página não encontrada";
    document.title = `${title} · Plataforma de RPG`;
    if (navigationType === "POP") return;
    requestAnimationFrame(() => {
      const heading = document.querySelector("main h1");
      if (heading && !heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: false });
    });
  }, [location.pathname, navigationType]);
  return null;
}

