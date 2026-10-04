import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function elementoVisivel(elemento) {
  if (!(elemento instanceof HTMLElement)) return false;
  if (elemento.closest("[hidden], [aria-hidden='true'], [inert]")) return false;
  const estilo = window.getComputedStyle(elemento);
  return estilo.display !== "none" && estilo.visibility !== "hidden" && elemento.getClientRects().length > 0;
}

function elementosFocaveis(dialog) {
  return [...dialog.querySelectorAll(FOCUSABLE)].filter(elementoVisivel);
}

function tornarFundoInerte(dialog) {
  const alterados = [];
  let ramoDoDialog = dialog;

  while (ramoDoDialog.parentElement) {
    const pai = ramoDoDialog.parentElement;
    for (const irmao of pai.children) {
      if (irmao === ramoDoDialog || !(irmao instanceof HTMLElement)) continue;
      alterados.push({
        elemento: irmao,
        tinhaInert: irmao.hasAttribute("inert"),
        ariaHidden: irmao.getAttribute("aria-hidden"),
      });
      irmao.inert = true;
      irmao.setAttribute("aria-hidden", "true");
    }
    ramoDoDialog = pai;
    if (pai === document.body) break;
  }

  return () => {
    for (const { elemento, tinhaInert, ariaHidden } of alterados) {
      if (!tinhaInert) elemento.removeAttribute("inert");
      if (ariaHidden === null) elemento.removeAttribute("aria-hidden");
      else elemento.setAttribute("aria-hidden", ariaHidden);
    }
  };
}

export function useModalA11y(aberto, onFechar) {
  const dialogRef = useRef(null);
  const onFecharRef = useRef(onFechar);

  useEffect(() => {
    onFecharRef.current = onFechar;
  }, [onFechar]);

  useEffect(() => {
    if (!aberto || !dialogRef.current) return undefined;

    const dialog = dialogRef.current;
    const focoAnterior = document.activeElement;
    const restaurarFundo = tornarFundoInerte(dialog);
    const elementos = () => elementosFocaveis(dialog);
    (elementos()[0] ?? dialog).focus();

    function handleKeyDown(evento) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        onFecharRef.current();
        return;
      }

      if (evento.key !== "Tab") return;
      const focaveis = elementos();
      if (focaveis.length === 0) {
        evento.preventDefault();
        dialog.focus();
        return;
      }

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    function handleFocusIn(evento) {
      if (dialog.contains(evento.target)) return;
      (elementos()[0] ?? dialog).focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      restaurarFundo();
      if (focoAnterior?.isConnected && elementoVisivel(focoAnterior)) focoAnterior.focus();
      else document.querySelector("main")?.focus();
    };
  }, [aberto]);

  return dialogRef;
}
