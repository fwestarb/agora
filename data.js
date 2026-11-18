export const sources = [
  { id: 'unicef', title: 'Guidance on AI and children', author: 'UNICEF Innocenti', year: 2025, type: 'Diretriz institucional primária', location: 'Requisitos de privacidade, não discriminação e participação', url: 'https://www.unicef.org/innocenti/reports/policy-guidance-ai-children', note: 'Orienta a proteção de dados, a equidade e a participação quando sistemas de IA afetam crianças.' },
  { id: 'edgov', title: 'Artificial Intelligence and the Future of Teaching and Learning', author: 'U.S. Department of Education', year: 2023, type: 'Relatório institucional primário', location: 'Recommendations, Recommendation #1: Emphasize Humans in the Loop', url: 'https://www.govinfo.gov/app/details/GOVPUB-ED-PURL-gpo229415', note: 'Recomenda preservar a participação humana nas decisões educacionais mediadas por IA.' },
  { id: 'unesco', title: 'Guidance for generative AI in education and research', author: 'UNESCO', year: 2023, type: 'Diretriz institucional primária', location: 'Capítulo 4, seção 4.3', url: 'https://doi.org/10.54675/EWZM9535', note: 'Propõe monitorar e validar ferramentas generativas em contextos educacionais.' }
];

export const types = { group:'Grupos', value:'Valores', perspective:'Perspectivas', argument:'Argumentos', objection:'Objeções', alternative:'Alternativas', assumption:'Pressupostos', evidence:'Evidências', uncertainty:'Incertezas' };
export const origins = { source:'Fundamentado em fonte', inference:'Inferência', open:'Questão em aberto' };
export const relations = ['afeta','apoia','contesta','depende de','prioriza','precisa de','relaciona-se com'];
export const demoInput = 'Uma cidade quer utilizar inteligência artificial para identificar alunos com risco de abandonar a escola. A prefeitura deve adotar esse sistema?';

const node = (id, kind, title, detail, origin = 'inference', sourceIds = [], comparison) => ({ id, kind, title, detail, origin, sourceIds, ...(comparison ? {comparison} : {}) });
const path = (groups, benefits, risks, values, needs) => ({ groups, benefits, risks, values, needs });
export const demo = {
  summary: demoInput,
  limitations: ['O cenário é fictício e não informa quais dados seriam usados.', 'As fontes oferecem diretrizes gerais. A eficácia local de um alerta de evasão precisaria ser medida.'],
  nodes: [
    node('students','group','Estudantes','Podem receber apoio mais cedo ou ser tratados de forma diferente após uma classificação. Têm menos poder sobre as regras do sistema.'),
    node('families','group','Famílias','Precisam entender como os alertas afetam seus filhos e como solicitar correções.'),
    node('school','group','Equipes escolares','Interpretariam alertas e ofereceriam apoio, conforme a capacidade e a autonomia disponíveis.'),
    node('city','group','Prefeitura','Definiria o objetivo, a contratação e os mecanismos de supervisão.'),
    node('vendor','group','Fornecedor','Pode controlar a documentação e influenciar quais indicadores são usados.'),
    node('privacy','value','Privacidade','A coleta de dados para intervenção precoce cria tensão com a minimização de dados.'),
    node('support','value','Apoio precoce','Uma intervenção em tempo hábil pode ampliar o acesso a apoio, se ele estiver disponível.'),
    node('fairness','value','Equidade','Erros e benefícios podem se distribuir de maneira desigual entre escolas e grupos.'),
    node('rights','perspective','Direitos da criança','O UNICEF inclui privacidade, não discriminação e participação entre os requisitos para IA que afeta crianças.','source',['unicef']),
    node('power','perspective','Poder e classificação','Quem define “em risco” pode influenciar quais estudantes são observados e quais necessidades recebem atenção. Investigue quem revisa o rótulo e quem consegue contestá-lo.'),
    node('oversight','evidence','Supervisão humana','O Departamento de Educação dos EUA recomenda manter pessoas no processo decisório em aplicações educacionais de IA.','source',['edgov']),
    node('early','argument','Antecipar apoio','Um alerta pode ajudar a encontrar estudantes que ainda não chegaram à equipe de apoio, se houver recursos para agir.'),
    node('label','objection','Rótulos podem estigmatizar','Um falso positivo pode alterar expectativas dos professores. A equipe precisaria examinar quem sofre mais com esse tipo de erro.'),
    node('capacity','assumption','Rede de apoio disponível','A utilidade de um alerta depende de a escola conseguir oferecer intervenções adequadas e aceitar contestações.'),
    node('direct','argument','Aplicar recursos diretamente no apoio','A busca ativa e a tutoria concentram recursos na intervenção, mas sua cobertura precisaria ser medida.'),
    node('outcomes','uncertainty','Quem se beneficia na prática?','Quais são as taxas de erro por grupo e como a frequência evolui quando o alerta leva a uma intervenção?','open'),
    node('adopt','alternative','Adotar com supervisão','Permitir revisão humana e contestação antes de agir sobre um alerta.','inference',[],path('Estudantes, famílias e escolas','Possibilidade de identificar necessidades mais cedo','Exposição de dados e estigma em escala','Apoio precoce e possibilidade de contestação','Desempenho local, proteção de dados e capacidade de revisão')),
    node('pilot','alternative','Testar em escala limitada','Conduzir um piloto com avaliação independente e critérios públicos de interrupção.','inference',[],path('Escolas participantes, estudantes e famílias','Medir erros e a carga de trabalho antes de expandir','Exposição dos participantes e resultados difíceis de generalizar','Aprendizagem institucional e controle de risco','Comparador, métricas por grupo e plano de saída')),
    node('human','alternative','Reforçar o apoio escolar','Investir em busca ativa, tutoria e apoio social sem classificação algorítmica.','inference',[],path('Estudantes, equipes escolares e gestores','Usar recursos diretamente para oferecer ajuda','A triagem humana também pode deixar necessidades invisíveis','Privacidade e acesso ao apoio','Cobertura, custos e efeitos das intervenções existentes'))
  ],
  edges:[
    ['early','apoia','pilot'],['early','apoia','adopt'],['label','contesta','early'],['early','depende de','capacity'],
    ['pilot','precisa de','outcomes'],['adopt','depende de','oversight'],['rights','prioriza','privacy'],['rights','prioriza','fairness'],
    ['pilot','afeta','students'],['adopt','afeta','families'],['human','afeta','school'],['city','relaciona-se com','vendor'],
    ['power','relaciona-se com','students'],['power','relaciona-se com','city'],['human','prioriza','privacy'],['adopt','prioriza','support'],
    ['direct','apoia','human']
  ]
};

