# Performance do frontend — D&D 5e

Seguir PD-010. Esta revisão não executou build nem mediu tempos. `npm run build` já inclui `scripts/check-bundle-budget.mjs` e exige manifest Vite.

| Entrada | Medição histórica anexada: 2026-09-27, FE-04C, Vite 8.0.16 | Limite existente no código |
|---|---:|---:|
| Principal | 394,74 KiB | 425 KiB |
| Adapter inicial D&D | 83,66 KiB | 100 KiB |

São bytes JS não comprimidos do arquivo próprio da entrada, sem somar imports transitivos. Antes da divisão lazy: 402,69/166,05 KiB. As medições não são baseline confirmado do commit atual. Renovar pelo proprietário antes de comparar regressões.

**ARCHITECTURAL RECOMMENDATION:** preservar lazy de abas/modais e dividir catálogos por demanda. Criaturas, detalhes/editor, Builder, Runner e futuro Tabletop devem carregar em entradas separadas; nenhum bestiário, catálogo completo de magias/itens ou ferramenta de Mestre entra obrigatoriamente no caminho inicial da ficha.

| Fase | Controle proposto |
|---|---|
| Ficha | Manter limites existentes; medir também o total transitivo carregado na primeira tela. |
| Criaturas/itens | Carregar índice leve primeiro; detalhes por lote. Medir busca com 1.000 entradas sintéticas. |
| Encontros | Medir atualização de um participante em fixture de 50 combatentes e save/reopen sem travar os controles. |
| Tabletop | Reusar dados do Runner; evitar outra engine, polling permanente e preload de todo conteúdo. |

Limites de novas entradas serão fixados após a primeira implementação medida; não inventar baselines. Sinal de investigação proposto: aumento superior a 20% no JS transitivo ou latência de interação frente à mesma fixture/dispositivo. É alerta para análise, não veto automático à expansão necessária.

Comando do proprietário, em `dnd-fichas/`: `npm run build`. Registrar commit, manifest, tamanhos próprios/transitivos, dispositivo e fixture; não elevar limites apenas para silenciar regressão. Responsabilidade das rotas: FE-01 a FE-10.
