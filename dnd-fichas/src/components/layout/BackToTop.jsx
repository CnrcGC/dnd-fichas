import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Icon from "../icons/Icon";

export default function BackToTop() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 400);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);
  if (!visible) return null;
  return <button type="button" className="grimoire-icon-button back-to-top" aria-label="Voltar ao topo" title="Voltar ao topo"
    onClick={() => {
      const heading = document.querySelector("#conteudo-principal h1");
      const target = heading ?? document.getElementById("conteudo-principal");
      if (heading) heading.tabIndex = -1;
      target?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }}><Icon name="levelUp" size={24} /></button>;
}
