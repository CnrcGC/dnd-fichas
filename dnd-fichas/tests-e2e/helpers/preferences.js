import { expect } from "@playwright/test";

export async function setTheme(page, theme) {
  await expect(page.getByRole("button", { name: /Ativar tema (claro|escuro)/ })).toBeVisible();
  const target = page.getByRole("button", { name: theme === "dark" ? "Ativar tema escuro" : "Ativar tema claro", exact: true });
  if (!await target.count()) {
    await page.getByRole("button", { name: theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro", exact: true }).click();
  }
  await target.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

export async function setTextSize(page, size) {
  await page.getByRole("button", { name: "Configurações de acessibilidade", exact: true }).click();
  await setRange(page, "Tamanho do texto", { normal: 16, large: 20, "extra-large": 24 }[size]);
  await page.getByRole("button", { name: "Fechar configurações", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-text-size", size);
}

export async function setRange(page, name, value) {
  const slider = page.getByRole("slider", { name, exact: true });
  const min = Number(await slider.getAttribute("min"));
  await slider.focus();
  await slider.press("End");
  await slider.press("Home");
  for (let step = min; step < value; step++) await slider.press("ArrowRight");
  await expect(slider).toHaveValue(String(value));
}
