const skillDefinitions = [
  {
    id: "acrobacia",
    name: "Acrobacia",
    description:
      "Mede habilidades físicas voltadas para agilidade e equilíbrio. Usada para se manter firme em superfícies instáveis, realizar manobras acrobáticas e escapar de tentativas de agarrão.",
  },
  {
    id: "atletismo",
    name: "Atletismo",
    description:
      "Mede força física, resistência e capacidade corporal em atividades como corrida, escalada, salto e natação. Usada para superar obstáculos, percorrer longas distâncias e realizar feitos de grande esforço físico.",
  },
  {
    id: "enganacao",
    name: "Enganação",
    description:
      "Representa a capacidade de esconder mentiras de forma convincente, manipulando a verdade, omitindo informações e alterando fatos de maneira crível.",
  },
  {
    id: "fama",
    name: "Fama",
    description:
      "Mede o reconhecimento e influência de um personagem na sociedade, seja por feitos heróicos, infâmia ou popularidade. Pode facilitar interações sociais e abrir portas em diferentes círculos.",
  },
  {
    id: "fortitude",
    name: "Fortitude",
    description:
      "Combina resistência física e vitalidade. Usada para suportar efeitos prejudiciais, como doenças e venenos, manter o fôlego, concentrar-se sob pressão e forçar o corpo além dos limites.",
  },
  {
    id: "furtividade",
    name: "Furtividade",
    description:
      "Permite se esgueirar, passar despercebido e se esconder de inimigos sem ser visto ou ouvido. Mesmo com alta habilidade, ainda é necessário um ambiente propício para se ocultar.",
  },
  {
    id: "intimidacao",
    name: "Intimidação",
    description:
      "Mede a capacidade de impor presença por meio de ameaças, hostilidade ou força bruta, utilizando o medo para influenciar ou alcançar objetivos.",
  },
  {
    id: "intuicao",
    name: "Intuição",
    description:
      "Permite interpretar o ambiente de forma instintiva. Usada para perceber mentiras, prever movimentos e determinar intenções.",
  },
  {
    id: "medicina",
    name: "Medicina",
    description:
      "Reflete conhecimento médico e habilidades de tratamento. Usada para estabilizar feridos, diagnosticar doenças e cuidar da saúde dentro das capacidades humanas. Exige ao menos 1 ponto, exceto para estabilizar alguém à beira da morte.",
  },
  {
    id: "oficio",
    name: "Ofício",
    description:
      "Engloba diferentes especializações, cada uma associada ao uso de um conjunto específico de ferramentas. Quanto maior a habilidade, maior a eficiência ao extrair o máximo de cada kit.",
  },
  {
    id: "percepcao",
    name: "Percepção",
    description:
      "Mede a atenção aos arredores e a capacidade de detectar sons, movimentos e presenças, indicando o quão aguçados são os sentidos.",
  },
  {
    id: "persuasao",
    name: "Persuasão",
    description:
      "Representa a arte de influenciar e cativar pessoas por meio do carisma e da conversa, convencendo indivíduos ou grupos a agir de determinada maneira.",
  },
  {
    id: "pontaria",
    name: "Pontaria",
    description:
      "Reflete precisão, mira e controle ao manejar armas de longo alcance, como arcos, bestas e armas de fogo. Também abrange armas de arremesso e disparos estratégicos.",
  },
  {
    id: "tatica",
    name: "Tática",
    description:
      "Reflete a capacidade de analisar cenários de combate e formular estratégias eficientes. Inclui planejamento, tomada de decisões e coordenação de ações para alcançar vantagem tática.",
  },
  {
    id: "tecnologia",
    name: "Tecnologia",
    description:
      "Abrange conhecimento avançado sobre dispositivos, sistemas e equipamentos tecnológicos.",
  },
  {
    id: "vontade",
    name: "Vontade",
    description:
      "Mede determinação e força mental, sendo usada para resistir a efeitos como intimidação, charme e controle mental.",
  },
];


export const YUSONG_SKILLS = Object.freeze(skillDefinitions.map((skill) => Object.freeze({ ...skill })));
export const YUSONG_SKILL_IDS = Object.freeze(YUSONG_SKILLS.map((skill) => skill.id));

export function getYusongSkill(skillId) {
  return YUSONG_SKILLS.find((skill) => skill.id === skillId) ?? null;
}

