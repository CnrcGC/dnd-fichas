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
const dialogs = [];

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

export function useModalA11y(aberto, onFechar, returnFocusRef) {
  const dialogRef = useRef(null);
  const onFecharRef = useRef(onFechar);

  useEffect(() => {
    onFecharRef.current = onFechar;
  }, [onFechar]);

  useEffect(() => {
    if (!aberto || !dialogRef.current) return undefined;

    const dialog = dialogRef.current;
    const focoAnterior = returnFocusRef?.current ?? document.activeElement;
    dialogs.push(dialog);
    const restaurarFundo = tornarFundoInerte(dialog);
    const elementos = () => elementosFocaveis(dialog);
    (elementos()[0] ?? dialog).focus();

    function handleKeyDown(evento) {
      if (dialogs.at(-1) !== dialog) return;
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
      if (!dialog.contains(document.activeElement)) {
        evento.preventDefault();
        (evento.shiftKey ? ultimo : primeiro).focus();
      } else if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    function handleFocusIn(evento) {
      if (dialogs.at(-1) !== dialog) return;
      if (dialog.contains(evento.target)) {
        const alvo = evento.target;
        if (!(alvo instanceof HTMLElement)) return;
        // O foco nativo pode deixar parte de um botão cortada em uma faixa rolável.
        // Revelar o controle inteiro sem mudar a ordem nem mover o foco.
        for (let regiao = alvo.parentElement; regiao && regiao !== dialog; regiao = regiao.parentElement) {
          if (!["auto", "scroll"].includes(getComputedStyle(regiao).overflowX)) continue;
          const caixa = regiao.getBoundingClientRect();
          const foco = alvo.getBoundingClientRect();
          const esquerda = caixa.left + regiao.clientLeft;
          const direita = esquerda + regiao.clientWidth;
          if (foco.left < esquerda || foco.right > direita) {
            alvo.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
            break;
          }
        }
        return;
      }
      (elementos()[0] ?? dialog).focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      dialogs.splice(dialogs.indexOf(dialog), 1);
      restaurarFundo();
      if (focoAnterior?.isConnected && elementoVisivel(focoAnterior)) focoAnterior.focus();
      else document.querySelector("main")?.focus();
      requestAnimationFrame(() => {
        if (focoAnterior?.isConnected && elementoVisivel(focoAnterior) && document.activeElement === document.body && !dialogs.length) focoAnterior.focus();
      });
    };
  }, [aberto, returnFocusRef]);

  return dialogRef;
}
