# Orçamentos de performance do frontend

Baseline medido em 2026-09-27 durante o checkpoint FE-04C, usando `npm run build` e Vite 8.0.16.

| Entrada | Antes da divisão lazy | Baseline FE-04C | Limite automatizado |
|---|---:|---:|---:|
| Principal | 402,69 KiB | 394,74 KiB | 425 KiB |
| Adapter inicial D&D | 166,05 KiB | 83,66 KiB | 100 KiB |

As abas de habilidades, perícias, magias e inventário, junto do modal de subida de nível, são carregadas somente quando abertas. Combate e impressão continuam no caminho inicial para não prejudicar a primeira tela nem o fluxo de impressão.

O orçamento considera bytes JavaScript não comprimidos do chunk próprio registrado no manifest. Ele não substitui medições de rede, parse, execução ou Web Vitals em dispositivos reais.
