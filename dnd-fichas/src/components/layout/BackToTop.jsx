import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Icon from "../icons/Icon";

export default function BackToTop() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState({ clearance: null, blocked: false });
  useEffect(() => {
    const panel = document.querySelector(".painel-rolagens");
    let frame = 0;
    const update = () => {
      setVisible(window.scrollY > 400);
      if (!panel) return;
      const box = panel.getBoundingClientRect();
      const gap = Number.parseFloat(getComputedStyle(panel).paddingTop) || 8;
      const onScreen = box.bottom > 0 && box.top < window.innerHeight;
      const clearance = onScreen ? Math.ceil(window.innerHeight - box.top + gap) : null;
      const blocked = window.innerWidth <= 640 && onScreen && box.top < 44 + gap;
      setPlacement((current) => current.clearance === clearance && current.blocked === blocked
        ? current : { clearance, blocked });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); });
    };
    const observer = new ResizeObserver(schedule);
    if (panel) observer.observe(panel);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pathname]);
  if (!visible || placement.blocked) return null;
  return <button type="button" className="grimoire-icon-button back-to-top" aria-label="Voltar ao topo" title="Voltar ao topo"
    style={placement.clearance === null ? undefined : { "--dice-panel-clearance": `${placement.clearance}px` }}
    onClick={() => {
      const heading = document.querySelector("#conteudo-principal h1");
      const target = heading ?? document.getElementById("conteudo-principal");
      if (heading) heading.tabIndex = -1;
      target?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }}><Icon name="levelUp" size={24} /></button>;
}
