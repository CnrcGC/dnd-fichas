# DEMO-01 — Roteiro de apresentação

Dados preparados em `docs/demo/`: Guerreiro 1 (Aurora), Guerreiro 4 (Breno) e Mago 4 (Celeste). São dados fictícios e independem de backend. A validação interna das três fichas não apresenta erros nem escolhas pendentes. O conjurador usa regras de 2014 e o catálogo selecionado da aplicação.

## Preparação

1. Dentro de `dnd-fichas`, execute `npm ci`, `npm run build` e `npm run preview -- --host 127.0.0.1 --port 4173`.
2. Abra **http://127.0.0.1:4173/** no **Google Chrome**, navegador confirmado para a apresentação, em um perfil dedicado. Endereço escolhido para hospedagem: **https://cnrcgc.github.io/dnd-fichas/**, ainda sem publicação. O build e ensaio que reproduzem o Pages estão em [DEPLOY.md](./DEPLOY.md). Os dados pertencem a esse navegador, dispositivo e origem; exporte/importe JSON ao mudar do endereço local para o hospedado.
3. Importe os três JSONs. Importar cria cópias com novos IDs; não sobrescreve fichas. Para reiniciar o ensaio, use outro perfil limpo ou mova as cópias anteriores para a lixeira pela biblioteca.
4. Aguarde “Alterações salvas neste dispositivo” antes de fechar ou atualizar a página.
5. Mantenha os JSONs de `docs/demo/`, PDFs de `output/pdf/` e capturas de `output/screenshots/` disponíveis fora do navegador como fallback. PDF é representação de leitura; JSON permite recuperar a ficha editável.

## Roteiro completo (aproximadamente 8–10 minutos)

1. Biblioteca: buscar “Breno”; limpar busca; mostrar importação, exportação e lixeira recuperável.
2. Novo personagem: escolher Humano → Guerreiro → Soldado → Próximo. Preencher as escolhas obrigatórias e o nome; Finalizar. Mostrar também que criar uma ficha em branco ou um rascunho é uma opção explícita. Para o caso de sub-raça: Anão → Clérigo → Acólito; na última etapa escolher Anão da Colina e completar ferramentas/idiomas/perícias.
3. Abrir Breno: mostrar atributos e clicar em “Rolar teste de Força”. O painel e o anúncio textual apresentam o resultado. Visitar Perícias e rolar Percepção.
4. Combate: editar PV temporário e PV atual, mostrar ataque de espada e CA. Edição de CA passa ao modo manual; “Usar CA calculada” restaura o cálculo do equipamento.
5. Habilidades: gastar “Retomar o Fôlego — uso 1”. Em Combate, concluir descanso curto para restaurar o recurso. Mostrar descanso longo sem depender de backend.
6. Celeste → Magias: mostrar truques, magias preparadas e espaços. Gastar um espaço de nível 1; usar “Concentrar” na linha Detectar Magia. Em Combate, reduzir PV para mostrar o pedido de teste de concentração. “Parar” encerra voluntariamente; zero PV encerra automaticamente. O aplicativo auxilia a decisão da mesa.
7. Inventário: alterar moedas, abrir “Adicionar itens” e fechar por Escape; explicar também item personalizado. Em Notas, escrever uma pista.
8. Breno → Subir de Nível: Usar média → Próximo → Próximo → Concluir level up. O nível passa de 4 para 5, com PV e Ataque Extra; o dano anterior permanece. A alternativa por XP exige alcançar o limiar de experiência.
9. Aguardar salvamento, atualizar a página e reabrir pela biblioteca. Exportar o personagem pelo card. Em um perfil limpo, importar o arquivo e conferir nome, nível, atributos, notas, moedas e recursos.
10. Imprimir / Salvar em PDF: abrir a visualização de impressão A4. Conferir dados essenciais e ausência dos botões da interface.
11. Acessibilidade: demonstrar skip link com Tab, abas com setas/Home/End, modal com Tab/Shift+Tab/Escape, temas e tamanho de texto. A ampliação persiste ao recarregar. Não iniciar áudio automaticamente; áudio próprio está adiado.

## Versão curta (aproximadamente 3 minutos)

Biblioteca → Breno → rolagem/recursos → Celeste/Magias → Breno/level up → reload → exportar → imprimir. Os JSONs preparados evitam preencher o formulário ao vivo.

## Evidência e validação humana

`npm run test:production` executa no Chrome instalado dois ensaios automáticos das três fichas em sessões limpas, bloqueando solicitações externas na sessão principal. Confere rota direta/reload, temas, rolagem, PV, recursos, magias, inventário, notas, level up e round trip completo do JSON (exceto ID/data de criação, que mudam ao importar). Gera os três PDFs no primeiro ensaio.

Antes da apresentação, repetir o roteiro duas vezes no navegador real e no domínio final; validar NVDA, zoom nativo 200%, mobile e impressão. Esses ensaios humanos não são substituídos pela automação. Resultados e pendências em [MVP_VALIDATION.md](./MVP_VALIDATION.md).

Na retomada da RELEASE-02 em 2026-10-12, o build foi aberto em Chrome visível/perfil de teste separado. A ferramenta Computer Use encerrou o controle ao não conseguir confirmar a URL atual do navegador, antes de verificar zoom e impressão. Essa tentativa não conta como ensaio humano concluído. NVDA não foi encontrado nos locais/registro de instalação consultados. Os checks automatizados aprovados continuam válidos; nenhuma alteração de código foi feita nesta retomada.
