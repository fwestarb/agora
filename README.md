# Ágora — Laboratório de decisões sociais

Ágora ajuda a explorar decisões sobre IA na educação. A investigação identifica grupos afetados, conflitos de valores, relações de poder, argumentos, objeções, alternativas e perguntas que permanecem em aberto.

## Abrir no navegador

**[Abrir o Ágora](https://fwestarb.github.io/agora/)**

Clique em **Abrir exemplo** para explorar o mapa e comparar alternativas para o caso de evasão escolar. A demonstração funciona de qualquer computador ou celular, sem instalação nem login.

## Desenvolvimento

Para rodar o projeto no seu computador e gerar análises de novos dilemas com IA, veja o [guia de desenvolvimento local](DESENVOLVIMENTO.md).

## Arquitetura

- Node.js serve os arquivos e a API local. HTML, CSS e módulos JavaScript compõem a interface. O mapa usa linhas SVG com botões HTML e oferece uma lista que usa as mesmas relações.
- A API valida a entrada e recupera referências de um acervo fixo por regras de palavras-chave. Depois, uma chamada de IA percorre interpretação, perspectivas, argumentos, objeções e revisão guiada pelo prompt. A chamada única reduz latência e configuração.
- O servidor verifica tipos, campos obrigatórios, IDs únicos, vínculos e referências contra o subconjunto recuperado. Cada alternativa precisa estar associada a um grupo e a uma razão ou condição, e a análise precisa ter uma objeção conectada. **Informação fornecida no caso** mostra o texto original da solicitação correspondente. A saída gerada tem rótulos próprios de síntese, fonte, inferência e questão em aberto.
- Os nós têm IDs estáveis dentro de cada análise. As relações são triplas com origem, vínculo e destino. Alternativas incluem campos para grupos, benefícios, riscos, valores e evidências necessárias.

## Acervo e limites

O acervo reúne três documentos institucionais primários de UNICEF, UNESCO e U.S. Department of Education. Cada registro inclui autoria, ano, seção, link e a razão de inclusão. As notas são paráfrases curatoriais. UNICEF fundamenta direitos da criança, o relatório do Departamento de Educação fundamenta supervisão humana, e a UNESCO oferece orientação específica para IA generativa.

A busca por palavras-chave tem cobertura limitada e usa um conjunto padrão em casos ambíguos. As fontes são orientações gerais. A validade de um ID não comprova a fidelidade de uma paráfrase. A análise de justiça distributiva e de poder usa perguntas conceituais gerais. Uma versão posterior pode incluir referências filosóficas primárias, revisão de atribuições e referências por passagem. Outras evoluções possíveis são acervo brasileiro e avaliação com educadores.

## Testes e avaliação

```sh
npm test
```

A suíte cobre o caso de evasão, recuperação para tutoria generativa e correção de redação, estrutura, referências inválidas, endpoints, configuração sem chave, resposta simulada e erros do provedor. A integração automatizada usa um substituto local determinístico. Para avaliar um modelo real, configure-o e repita os casos abaixo.

1. A prefeitura deve usar IA para alertar sobre possível evasão escolar?
2. Uma escola pública deve adotar um tutor generativo para tarefas feitas em casa?
3. Uma rede de ensino deve usar IA para propor notas para redações dos estudantes?

Em revisão humana, registre **atende**, **parcial** ou **falha** para cada critério, com um trecho de evidência: cobertura dos grupos e do poder de contestação, conflitos reais de valores, alternativas e objeções plausíveis, distinção de informação e hipótese, fidelidade das fontes, lacunas específicas e ausência de atribuições indevidas a autores. Examine também se a saída preserva a decisão em aberto. Repita com o mesmo modelo e configurações para identificar variação. Testes verdes indicam integridade estrutural, e a qualidade conceitual exige revisão das análises.
## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `public/` | Interface, estilos, caso demonstrativo e acervo de fontes. |
| `server.mjs` | Servidor local, seleção de fontes e validação das análises. |
| `tests/` | Testes automatizados do contrato de dados e da API. |
| `DEPLOY.md` | Como atualizar a demonstração publicada. |

## English

Ágora is an interactive lab for exploring decisions about AI in education. It maps stakeholders, conflicting values, arguments and alternatives, and identifies questions that still need evidence.

Open the [public demo](https://fwestarb.github.io/agora/) and select **Abrir exemplo** to explore a school dropout case. See the [local development guide](DESENVOLVIMENTO.md) for local setup and live AI generation.

## GitHub Pages

O GitHub Pages serve a demonstração estática. Veja [DEPLOY.md](DEPLOY.md) para atualizar o site.
