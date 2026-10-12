// O Pages redireciona rotas sem arquivo para a entrada da SPA. Restaura a URL
// antes de montar o router, sem depender de storage nem alterar fichas salvas.
export function restorePagesRoute({ location, history }, basePath) {
  if (basePath === "/" || location.pathname !== basePath) return;
  const route = new URLSearchParams(location.search).get("__dnd_route");
  if (!route) return;
  try {
    const target = new URL(route, location.origin);
    if (target.origin !== location.origin || !target.pathname.startsWith(basePath)) return;
    history.replaceState(null, "", target.pathname + target.search + target.hash);
  } catch { /* URL inválida: permanece na biblioteca. */ }
}
