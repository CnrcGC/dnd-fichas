import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
const dialogs = [];

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
    const bloqueados = [];
    for (let ancestor = dialog; ancestor.parentElement; ancestor = ancestor.parentElement) {
      for (const sibling of ancestor.parentElement.children) {
        if (sibling !== ancestor && !sibling.inert) {
          sibling.inert = true;
          bloqueados.push(sibling);
        }
      }
      if (ancestor.parentElement === document.body) break;
    }
    const elementos = () => [...dialog.querySelectorAll(FOCUSABLE)].filter((elemento) =>
      elemento.getClientRects().length > 0 && !elemento.closest("[hidden], [inert]") &&
      !elemento.matches(":disabled, input[type='hidden']") && elemento.tabIndex >= 0);
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      dialogs.splice(dialogs.indexOf(dialog), 1);
      bloqueados.forEach((elemento) => { elemento.inert = false; });
      focoAnterior?.focus?.();
      // O commit que remove o modal pode desfazer o foco restaurado no cleanup.
      requestAnimationFrame(() => {
        if (focoAnterior?.isConnected && document.activeElement === document.body && !dialogs.length) focoAnterior.focus();
      });
    };
  }, [aberto, returnFocusRef]);

  return dialogRef;
}
