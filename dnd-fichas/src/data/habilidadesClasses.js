// Habilidades de classe do 5e (PHB), por nível — resumos escritos com
// nossas próprias palavras. Aqui ficam só as habilidades centrais da
// classe (o que toda a classe ganha); as habilidades específicas de cada
// subclasse não estão detalhadas ainda, só o ponto em que você escolhe
// uma (fica como próxima etapa).

const HABILIDADES_CLASSES_BASE = [
  // ---- Bárbaro ----
  { id: "barbaro-furia", classeId: "barbaro", nivel: 1, nome: "Fúria", descricao: "Entra em fúria um número limitado de vezes por dia, ganhando bônus de dano corpo a corpo e resistência a dano cortante, perfurante e concussão." },
  { id: "barbaro-defesa-sem-armadura", classeId: "barbaro", nivel: 1, nome: "Defesa sem Armadura", descricao: "Sem armadura, sua CA é 10 + mod. Destreza + mod. Constituição." },
  { id: "barbaro-ataque-descuidado", classeId: "barbaro", nivel: 2, nome: "Ataque Descuidado", descricao: "Pode atacar corpo a corpo com vantagem, mas ataques contra você também ganham vantagem até seu próximo turno." },
  { id: "barbaro-sentido-perigo", classeId: "barbaro", nivel: 2, nome: "Sentido de Perigo", descricao: "Vantagem em salvaguardas de Destreza contra efeitos que você consegue ver." },
  { id: "barbaro-trilha", classeId: "barbaro", nivel: 3, nome: "Trilha Primitiva", descricao: "Escolhe uma trilha (subclasse) que molda seu estilo de fúria." },
  { id: "barbaro-ataque-extra", classeId: "barbaro", nivel: 5, nome: "Ataque Extra", descricao: "Pode atacar duas vezes sempre que usar a ação de Atacar." },
  { id: "barbaro-movimento-rapido", classeId: "barbaro", nivel: 5, nome: "Movimento Rápido", descricao: "Deslocamento aumenta em 3m enquanto não estiver com armadura pesada." },
  { id: "barbaro-instinto-selvagem", classeId: "barbaro", nivel: 7, nome: "Instinto Selvagem", descricao: "Vantagem em testes de iniciativa; não pode ser surpreendido enquanto estiver consciente." },
  { id: "barbaro-critico-selvagem", classeId: "barbaro", nivel: 9, nome: "Crítico Selvagem", descricao: "Rola um dado de dano extra em acertos críticos com armas corpo a corpo." },
  { id: "barbaro-furia-implacavel", classeId: "barbaro", nivel: 11, nome: "Fúria Implacável", descricao: "Uma vez por fúria, evita cair a 0 PV e fica com 1 PV em vez disso." },
  { id: "barbaro-furia-persistente", classeId: "barbaro", nivel: 15, nome: "Fúria Persistente", descricao: "A fúria só termina antes da hora se você ficar inconsciente ou decidir encerrá-la." },
  { id: "barbaro-forca-indomita", classeId: "barbaro", nivel: 18, nome: "Força Indômita", descricao: "Rolagens de teste de Força que dariam um resultado abaixo do seu valor de Força passam a valer o próprio valor de Força." },
  { id: "barbaro-campeao-primitivo", classeId: "barbaro", nivel: 20, nome: "Campeão Primitivo", descricao: "Força e Constituição aumentam, e seus valores máximos sobem." },

  // ---- Bardo ----
  { id: "bardo-inspiracao", classeId: "bardo", nivel: 1, nome: "Inspiração de Bardo", descricao: "Dá um dado de inspiração a um aliado, que pode somá-lo a um teste, ataque ou resistência." },
  { id: "bardo-conjuracao", classeId: "bardo", nivel: 1, nome: "Conjuração", descricao: "Aprende a conjurar magias usando Carisma." },
  { id: "bardo-versatilidade", classeId: "bardo", nivel: 2, nome: "Pau pra Toda Obra", descricao: "Soma metade do bônus de proficiência, arredondado para baixo, nos testes de habilidade que ainda não incluam esse bônus." },
  { id: "bardo-cancao-descanso", classeId: "bardo", nivel: 2, nome: "Canção de Descanso", descricao: "Aliados que ouvem sua música recuperam pontos de vida extras num descanso curto." },
  { id: "bardo-colegio", classeId: "bardo", nivel: 3, nome: "Colégio de Bardo", descricao: "Escolhe uma subclasse que define seu estilo artístico." },
  { id: "bardo-pericia-extra", classeId: "bardo", nivel: 3, nome: "Especialização", descricao: "Dobra o bônus de proficiência em duas perícias treinadas à sua escolha." },
  { id: "bardo-fonte-inspiracao", classeId: "bardo", nivel: 5, nome: "Fonte de Inspiração", descricao: "Recupera todos os usos de Inspiração de Bardo ao terminar um descanso curto." },
  { id: "bardo-contra-encantamento", classeId: "bardo", nivel: 6, nome: "Contra-encantamento", descricao: "Gasta uma ação pra ajudar aliados próximos a resistir a medo e encantamento." },
  { id: "bardo-especializacao-2", classeId: "bardo", nivel: 10, nome: "Especialização Adicional", descricao: "Escolhe mais duas perícias treinadas para dobrar o bônus de proficiência." },
  { id: "bardo-segredos-magicos", classeId: "bardo", nivel: 10, nome: "Segredos Mágicos", descricao: "Aprende magias de qualquer classe conjuradora." },
  { id: "bardo-inspiracao-suprema", classeId: "bardo", nivel: 20, nome: "Inspiração Suprema", descricao: "Recupera todos os usos de Inspiração de Bardo ao rolar iniciativa, se estiver sem nenhum." },

  // ---- Bruxo ----
  { id: "bruxo-patrono", classeId: "bruxo", nivel: 1, nome: "Patrono Sobrenatural", descricao: "Escolhe um protetor sobrenatural que concede poderes em troca de um pacto." },
  { id: "bruxo-magia-pacto", classeId: "bruxo", nivel: 1, nome: "Magia de Pacto", descricao: "Conjura magias usando espaços próprios que recarregam totalmente num descanso curto." },
  { id: "bruxo-invocacoes", classeId: "bruxo", nivel: 2, nome: "Invocações Místicas", descricao: "Aprende invocações permanentes que concedem efeitos mágicos variados." },
  { id: "bruxo-dadiva", classeId: "bruxo", nivel: 3, nome: "Dádiva de Pacto", descricao: "Escolhe um benefício especial do pacto: uma arma, um familiar ou um grimório místico." },
  { id: "bruxo-arcano-aprimorado", classeId: "bruxo", nivel: 11, nome: "Arcano Místico", descricao: "Ganha uma magia poderosa de nível 6 que pode conjurar uma vez por dia sem gastar espaço." },
  { id: "bruxo-mestre-eterno", classeId: "bruxo", nivel: 20, nome: "Mestre Sombrio Eterno", descricao: "Pode gastar 1 minuto comunicando-se com o patrono pra recuperar todos os espaços de Magia de Pacto." },

  // ---- Clérigo ----
  { id: "clerigo-conjuracao", classeId: "clerigo", nivel: 1, nome: "Conjuração", descricao: "Conjura magias divinas usando Sabedoria." },
  { id: "clerigo-dominio", classeId: "clerigo", nivel: 1, nome: "Domínio Divino", descricao: "Escolhe um domínio que concede magias e poderes extras ligados a ele." },
  { id: "clerigo-canalizar", classeId: "clerigo", nivel: 2, nome: "Canalizar Divindade", descricao: "Usa energia divina pra efeitos especiais, incluindo expulsar mortos-vivos." },
  { id: "clerigo-destruir-mortosvivos", classeId: "clerigo", nivel: 5, nome: "Destruir Mortos-Vivos", descricao: "Ao expulsar mortos-vivos, os mais fracos são destruídos automaticamente." },
  { id: "clerigo-intervencao", classeId: "clerigo", nivel: 10, nome: "Intervenção Divina", descricao: "Pode pedir ajuda direta da sua divindade, uma vez, com chance de sucesso baseada no seu nível." },
  { id: "clerigo-intervencao-aprimorada", classeId: "clerigo", nivel: 20, nome: "Intervenção Divina Aprimorada", descricao: "O pedido de intervenção divina passa a funcionar automaticamente." },

  // ---- Druida ----
  { id: "druida-druidico", classeId: "druida", nivel: 1, nome: "Druídico", descricao: "Conhece a linguagem secreta dos druidas." },
  { id: "druida-conjuracao", classeId: "druida", nivel: 1, nome: "Conjuração", descricao: "Conjura magias da natureza usando Sabedoria." },
  { id: "druida-forma-selvagem", classeId: "druida", nivel: 2, nome: "Forma Selvagem", descricao: "Transforma-se em animais que já observou de perto, um número limitado de vezes por descanso." },
  { id: "druida-circulo", classeId: "druida", nivel: 2, nome: "Círculo Druídico", descricao: "Escolhe uma tradição druídica que define seu foco na natureza." },
  { id: "druida-corpo-atemporal", classeId: "druida", nivel: 18, nome: "Corpo Atemporal", descricao: "Envelhece muito mais devagar e fica imune a doenças ligadas à idade." },
  { id: "druida-arquidruida", classeId: "druida", nivel: 20, nome: "Arquidruida", descricao: "Pode usar Forma Selvagem quantas vezes quiser." },

  // ---- Feiticeiro ----
  { id: "feiticeiro-origem", classeId: "feiticeiro", nivel: 1, nome: "Origem de Feitiçaria", descricao: "Escolhe a fonte da sua magia inata, que define poderes extras." },
  { id: "feiticeiro-conjuracao", classeId: "feiticeiro", nivel: 1, nome: "Conjuração", descricao: "Conjura magias usando Carisma." },
  { id: "feiticeiro-fonte", classeId: "feiticeiro", nivel: 2, nome: "Fonte de Magia", descricao: "Converte pontos de feitiçaria em espaços de magia extras, e vice-versa." },
  { id: "feiticeiro-metamagia", classeId: "feiticeiro", nivel: 3, nome: "Metamagia", descricao: "Modifica magias conjuradas com efeitos especiais, como torná-las silenciosas ou mais rápidas." },
  { id: "feiticeiro-restauracao", classeId: "feiticeiro", nivel: 20, nome: "Restauração Feiticeira", descricao: "Recupera 4 pontos de feitiçaria ao terminar um descanso curto." },

  // ---- Guerreiro ----
  { id: "guerreiro-estilo", classeId: "guerreiro", nivel: 1, nome: "Estilo de Combate", descricao: "Escolhe uma especialização de combate que concede um bônus permanente." },
  { id: "guerreiro-fogo", classeId: "guerreiro", nivel: 1, nome: "Retomar o Fôlego", descricao: "Uma vez por descanso, recupera pontos de vida como ação bônus." },
  { id: "guerreiro-surto", classeId: "guerreiro", nivel: 2, nome: "Surto de Ação", descricao: "Ganha uma ação adicional no seu turno, uma vez por descanso curto." },
  { id: "guerreiro-arquetipo", classeId: "guerreiro", nivel: 3, nome: "Arquétipo Marcial", descricao: "Escolhe uma subclasse que define sua especialidade de combate." },
  { id: "guerreiro-ataque-extra", classeId: "guerreiro", nivel: 5, nome: "Ataque Extra", descricao: "Ataca duas vezes sempre que usar a ação de Atacar." },
  { id: "guerreiro-indomavel", classeId: "guerreiro", nivel: 9, nome: "Indomável", descricao: "Uma vez por descanso longo, pode refazer uma salvaguarda que tenha falhado." },
  { id: "guerreiro-ataque-extra-2", classeId: "guerreiro", nivel: 11, nome: "Ataque Extra (2)", descricao: "Passa a atacar três vezes ao usar a ação de Atacar." },
  { id: "guerreiro-ataque-extra-3", classeId: "guerreiro", nivel: 20, nome: "Ataque Extra (3)", descricao: "Passa a atacar quatro vezes ao usar a ação de Atacar." },

  // ---- Ladino ----
  { id: "ladino-ataque-furtivo", classeId: "ladino", nivel: 1, nome: "Ataque Furtivo", descricao: "Causa dano extra quando ataca com vantagem, ou quando tem um aliado perto do alvo." },
  { id: "ladino-especializacao", classeId: "ladino", nivel: 1, nome: "Especialização", descricao: "Dobra o bônus de proficiência em duas perícias treinadas, ou em uma perícia treinada e ferramentas de ladrão." },
  { id: "ladino-giria", classeId: "ladino", nivel: 1, nome: "Gíria de Ladrão", descricao: "Conhece um código secreto de sinais e palavras usado por ladinos." },
  { id: "ladino-acao-ardilosa", classeId: "ladino", nivel: 2, nome: "Ação Ardilosa", descricao: "Pode usar Disparada, Desengajar ou Esconder-se como ação bônus." },
  { id: "ladino-arquetipo", classeId: "ladino", nivel: 3, nome: "Arquétipo de Ladino", descricao: "Escolhe uma subclasse que define sua especialidade." },
  { id: "ladino-esquiva-sobrenatural", classeId: "ladino", nivel: 5, nome: "Esquiva Sobrenatural", descricao: "Reduz pela metade o dano de um ataque que consiga ver acertando você." },
  { id: "ladino-especializacao-2", classeId: "ladino", nivel: 6, nome: "Especialização Adicional", descricao: "Escolhe mais duas perícias treinadas, ou uma perícia e ferramentas de ladrão, para dobrar o bônus de proficiência." },
  { id: "ladino-evasao", classeId: "ladino", nivel: 7, nome: "Evasão", descricao: "Em certos efeitos de área, não sofre dano nenhum com sucesso na resistência (metade em vez de nada numa falha)." },
  { id: "ladino-talento-confiavel", classeId: "ladino", nivel: 11, nome: "Talento Confiável", descricao: "Testes com uma perícia ou ferramenta treinada nunca contam menos que 10 no d20." },
  { id: "ladino-sentido-cego", classeId: "ladino", nivel: 14, nome: "Sentido Cego", descricao: "Percebe criaturas invisíveis ou escondidas próximas, mesmo sem enxergá-las." },
  { id: "ladino-mente-escorregadia", classeId: "ladino", nivel: 15, nome: "Mente Escorregadia", descricao: "Ganha proficiência em salvaguardas de Sabedoria." },
  { id: "ladino-elusivo", classeId: "ladino", nivel: 18, nome: "Elusivo", descricao: "Ataques contra você nunca têm vantagem, enquanto não estiver incapacitado." },
  { id: "ladino-golpe-sorte", classeId: "ladino", nivel: 20, nome: "Golpe de Sorte", descricao: "Uma vez por descanso curto, transforma um erro em acerto, ou um teste falho num 20." },

  // ---- Mago ----
  { id: "mago-recuperacao", classeId: "mago", nivel: 1, nome: "Recuperação Arcana", descricao: "Recupera alguns espaços de magia ao terminar um descanso curto, uma vez por dia." },
  { id: "mago-conjuracao", classeId: "mago", nivel: 1, nome: "Conjuração", descricao: "Conjura magias arcanas anotadas num grimório, usando Inteligência." },
  { id: "mago-tradicao", classeId: "mago", nivel: 2, nome: "Tradição Arcana", descricao: "Escolhe uma escola de magia como especialização." },
  { id: "mago-mestria", classeId: "mago", nivel: 18, nome: "Mestria de Magia", descricao: "Conjura certas magias de nível baixo já conhecidas sem gastar espaço de magia." },
  { id: "mago-assinatura", classeId: "mago", nivel: 20, nome: "Magias de Assinatura", descricao: "Sempre tem duas magias de nível 3 preparadas de graça, sem gastar espaço na primeira conjuração de cada uma por descanso." },

  // ---- Monge ----
  { id: "monge-defesa-sem-armadura", classeId: "monge", nivel: 1, nome: "Defesa sem Armadura", descricao: "Sem armadura ou escudo, sua CA é 10 + mod. Destreza + mod. Sabedoria." },
  { id: "monge-artes-marciais", classeId: "monge", nivel: 1, nome: "Artes Marciais", descricao: "Usa Destreza em ataques desarmados e com armas de monge, com um dado de dano que cresce com o nível." },
  { id: "monge-ki", classeId: "monge", nivel: 2, nome: "Ki", descricao: "Usa pontos de ki pra rajada de golpes, esquiva paciente ou passo do vento." },
  { id: "monge-movimento-sem-armadura", classeId: "monge", nivel: 2, nome: "Movimento sem Armadura", descricao: "Deslocamento aumenta enquanto não estiver usando armadura ou escudo." },
  { id: "monge-tradicao", classeId: "monge", nivel: 3, nome: "Tradição Monástica", descricao: "Escolhe uma subclasse que define seu estilo de treinamento." },
  { id: "monge-defletir-misseis", classeId: "monge", nivel: 3, nome: "Defletir Mísseis", descricao: "Pode reduzir ou anular o dano de um ataque à distância que acertaria você." },
  { id: "monge-queda-lenta", classeId: "monge", nivel: 4, nome: "Queda Lenta", descricao: "Reduz o dano de quedas gastando uma reação." },
  { id: "monge-ataque-extra", classeId: "monge", nivel: 5, nome: "Ataque Extra", descricao: "Ataca duas vezes sempre que usar a ação de Atacar." },
  { id: "monge-golpe-atordoante", classeId: "monge", nivel: 5, nome: "Golpe Atordoante", descricao: "Gasta um ponto de ki pra tentar atordoar um alvo que acabou de acertar." },
  { id: "monge-golpes-chi", classeId: "monge", nivel: 6, nome: "Golpes de Chi", descricao: "Ataques desarmados contam como mágicos para superar resistência e imunidade." },
  { id: "monge-evasao", classeId: "monge", nivel: 7, nome: "Evasão", descricao: "Em certos efeitos de área, não sofre dano nenhum com sucesso na resistência." },
  { id: "monge-mente-estavel", classeId: "monge", nivel: 7, nome: "Mente Estável", descricao: "Gasta um ponto de ki pra encerrar em si mesmo um efeito de medo ou encantamento." },
  { id: "monge-autopurificacao", classeId: "monge", nivel: 10, nome: "Autopurificação", descricao: "Fica imune a doenças e neutraliza venenos no próprio corpo." },
  { id: "monge-alma-diamantina", classeId: "monge", nivel: 14, nome: "Alma Diamantina", descricao: "Ganha proficiência em todas as salvaguardas; pode gastar ki pra refazer uma que tenha falhado." },
  { id: "monge-corpo-atemporal", classeId: "monge", nivel: 15, nome: "Corpo Atemporal", descricao: "Não precisa mais de comida ou água, e envelhece muito mais devagar." },
  { id: "monge-corpo-vazio", classeId: "monge", nivel: 18, nome: "Corpo Vazio", descricao: "Gasta ki pra ficar invisível por um tempo, ou pra viajar até o Plano Etéreo." },
  { id: "monge-perfeicao-propria", classeId: "monge", nivel: 20, nome: "Perfeição Própria", descricao: "Recupera 4 pontos de ki se rolar iniciativa sem nenhum ponto restante." },

  // ---- Paladino ----
  { id: "paladino-sentir", classeId: "paladino", nivel: 1, nome: "Sentir o Mal e o Bem", descricao: "Detecta presenças celestiais, infernais ou mortos-vivos próximas." },
  { id: "paladino-imposicao", classeId: "paladino", nivel: 1, nome: "Imposição de Mãos", descricao: "Reservatório de energia curativa que pode usar tocando uma criatura." },
  { id: "paladino-estilo-conjuracao", classeId: "paladino", nivel: 2, nome: "Estilo de Combate e Conjuração", descricao: "Escolhe uma especialização de combate e passa a preparar e conjurar magias divinas." },
  { id: "paladino-punicao-divina", classeId: "paladino", nivel: 2, nome: "Punição Divina", descricao: "Ao acertar com arma corpo a corpo, pode gastar um espaço de magia para acrescentar dano radiante; certos tipos de criatura recebem dano adicional." },
  { id: "paladino-saude-divina", classeId: "paladino", nivel: 3, nome: "Saúde Divina", descricao: "Fica imune a doenças." },
  { id: "paladino-juramento", classeId: "paladino", nivel: 3, nome: "Juramento Sagrado", descricao: "Escolhe uma subclasse que define seus dogmas, magias e opções de Canalizar Divindade." },
  { id: "paladino-ataque-extra", classeId: "paladino", nivel: 5, nome: "Ataque Extra", descricao: "Ataca duas vezes sempre que usar a ação de Atacar." },
  { id: "paladino-aura-protecao", classeId: "paladino", nivel: 6, nome: "Aura de Proteção", descricao: "Soma seu modificador de Carisma nas salvaguardas de aliados próximos." },
  { id: "paladino-aura-coragem", classeId: "paladino", nivel: 10, nome: "Aura de Coragem", descricao: "Aliados próximos ficam imunes a serem amedrontados." },
  { id: "paladino-toque-purificador", classeId: "paladino", nivel: 14, nome: "Toque Purificador", descricao: "Pode usar Imposição de Mãos pra remover uma doença ou condição em vez de curar." },
  { id: "paladino-campeao-sagrado", classeId: "paladino", nivel: 20, nome: "Ápice do Juramento", descricao: "Ganha um poder culminante ligado ao juramento escolhido no nível 3." },

  // ---- Patrulheiro ----
  { id: "patrulheiro-inimigo-favorito", classeId: "patrulheiro", nivel: 1, nome: "Inimigo Favorito", descricao: "Ganha bônus em testes contra um tipo de criatura escolhido." },
  { id: "patrulheiro-explorador", classeId: "patrulheiro", nivel: 1, nome: "Explorador Nato", descricao: "Ganha vantagens e bônus específicos num tipo de terreno favorito." },
  { id: "patrulheiro-estilo-conjuracao", classeId: "patrulheiro", nivel: 2, nome: "Estilo de Combate e Conjuração", descricao: "Escolhe uma especialização de combate e passa a conjurar magias da natureza." },
  { id: "patrulheiro-arquetipo", classeId: "patrulheiro", nivel: 3, nome: "Arquétipo de Patrulheiro", descricao: "Escolhe uma subclasse que define sua especialidade." },
  { id: "patrulheiro-consciencia-primitiva", classeId: "patrulheiro", nivel: 3, nome: "Consciência Primitiva", descricao: "Gasta um espaço de magia para perceber a presença, mas não a localização ou quantidade, de certos tipos de criatura na região." },
  { id: "patrulheiro-ataque-extra", classeId: "patrulheiro", nivel: 5, nome: "Ataque Extra", descricao: "Ataca duas vezes sempre que usar a ação de Atacar." },
  { id: "patrulheiro-inimigo-favorito-aprimorado", classeId: "patrulheiro", nivel: 6, nome: "Inimigo Favorito Adicional", descricao: "Escolhe outro inimigo favorito e um idioma associado quando aplicável." },
  { id: "patrulheiro-explorador-aprimorado", classeId: "patrulheiro", nivel: 6, nome: "Terreno Favorito Adicional", descricao: "Escolhe outro tipo de terreno favorito." },
  { id: "patrulheiro-terra-pes", classeId: "patrulheiro", nivel: 8, nome: "Terra sob os Pés", descricao: "Move-se por terreno difícil natural sem gastar deslocamento extra." },
  { id: "patrulheiro-esconder", classeId: "patrulheiro", nivel: 10, nome: "Esconder-se na Natureza", descricao: "Pode se camuflar rapidamente em ambientes naturais." },
  { id: "patrulheiro-vanish", classeId: "patrulheiro", nivel: 14, nome: "Desaparecer", descricao: "Pode se esconder mesmo estando apenas levemente obscurecido pelo ambiente." },
  { id: "patrulheiro-sentidos-selvagens", classeId: "patrulheiro", nivel: 18, nome: "Sentidos Selvagens", descricao: "Percebe a localização de criaturas invisíveis próximas." },
  { id: "patrulheiro-matador", classeId: "patrulheiro", nivel: 20, nome: "Matador de Inimigos", descricao: "Uma vez por turno, soma um modificador de atributo extra a um ataque ou dano." },
];

const PAGINAS_CLASSES = {
  barbaro: [46, 50], bardo: [51, 55], bruxo: [56, 61], clerigo: [62, 70],
  druida: [71, 76], feiticeiro: [77, 82], guerreiro: [83, 88], ladino: [89, 93],
  mago: [94, 101], monge: [102, 107], paladino: [108, 114], patrulheiro: [115, 121],
};

const PROGRESSAO_NIVEIS_1_A_5 = {
  "barbaro-furia": { usos: [[1, 2], [3, 3]], bonusDano: [[1, 2]] },
  "bardo-inspiracao": { dado: [[1, "d6"], [5, "d8"]], recuperacao: [[1, "longo"], [5, "curto"]] },
  "bardo-cancao-descanso": { dado: [[2, "d6"], [9, "d8"]] },
  "bruxo-invocacoes": { quantidade: [[2, 2], [5, 3], [7, 4], [9, 5]] },
  "clerigo-canalizar": { usos: [[2, 1], [6, 2]] },
  "clerigo-destruir-mortosvivos": { ndMaximo: [[5, "1/2"], [8, "1"]] },
  "druida-forma-selvagem": { ndMaximo: [[2, "1/4"], [4, "1/2"]], limitacoes: [[2, "sem voo ou natação"], [4, "sem voo"]] },
  "feiticeiro-fonte": { pontos: [[2, 2], [3, 3], [4, 4], [5, 5]] },
  "ladino-ataque-furtivo": { dano: [[1, "1d6"], [3, "2d6"], [5, "3d6"], [7, "4d6"], [9, "5d6"]] },
  "monge-artes-marciais": { dado: [[1, "d4"], [5, "d6"]] },
  "monge-ki": { pontos: [[2, 2], [3, 3], [4, 4], [5, 5]] },
  "monge-movimento-sem-armadura": { bonusMetros: [[2, 3], [6, 4.5], [10, 6]] },
  "paladino-imposicao": { pontos: [[1, 5], [2, 10], [3, 15], [4, 20], [5, 25]] },
};

export const HABILIDADES_CLASSES = HABILIDADES_CLASSES_BASE.map((habilidade) => {
  const [printedPage, endPrintedPage] = PAGINAS_CLASSES[habilidade.classeId];
  return {
    ...habilidade,
    ...(PROGRESSAO_NIVEIS_1_A_5[habilidade.id]
      ? { progressaoNiveis1a5: PROGRESSAO_NIVEIS_1_A_5[habilidade.id] }
      : {}),
    catalogVersion: 1,
    rulesProfile: "dnd5e-books-2014",
    verificationStatus: habilidade.nivel <= 5 ? "verified" : "pending-review",
    automationLevel: "descriptive",
    sourceRefs: [{
      ruleId: `R-CLASS-FEATURE-${habilidade.id.toUpperCase()}`,
      bookId: "LJ",
      edition: "dnd5e-books-2014",
      printedPage,
      endPrintedPage,
      section: habilidade.nome,
    }],
  };
});

export function obterHabilidadesPorClasse(classeId) {
  return HABILIDADES_CLASSES.filter((h) => h.classeId === classeId).sort(
    (a, b) => a.nivel - b.nivel
  );
}

export function obterHabilidadeClasse(id) {
  return HABILIDADES_CLASSES.find((h) => h.id === id) ?? null;
}
