# Desenvolvimento local do Ágora

## Executar no seu computador

Requer Node.js 22 ou superior. Clone ou extraia o projeto, abra o terminal nesta pasta e execute:

```sh
npm start
```

No mesmo computador em que iniciou o servidor, abra `http://127.0.0.1:3000`. Escolha **Abrir exemplo** para investigar a decisão de uma prefeitura sobre alertas de evasão escolar. Selecione um nó no mapa ou em **Explorar em lista**, siga suas relações, consulte as fontes e compare os caminhos. O exemplo é uma análise preparada e pode ser aberto enquanto você prepara seu próprio dilema.

Perguntas cobertas pelo exemplo incluem quem classifica estudantes, quem consegue contestar um rótulo e como medir se alertas produzem apoio efetivo.

### Configurar geração ao vivo

Copie `.env.example` para `.env`. Defina `AI_API_KEY` e `AI_MODEL` para um modelo que aceite o formato JSON da API de Chat Completions. Ajuste `AI_BASE_URL` para o provedor compatível se necessário e reinicie o servidor. `PORT` altera a porta local.

Escreva um dilema com pelo menos 35 caracteres, acrescente contexto se quiser e escolha **Gerar análise**. O servidor envia ao provedor o dilema, os campos opcionais e as notas de referência. Evite nomes, registros escolares e outros dados pessoais. O app não mantém histórico persistente. A retenção externa e os custos por uso dependem do provedor e do modelo. A chave permanece no servidor. A aplicação serve como ferramenta de reflexão e tem escopo educacional demonstrativo.
