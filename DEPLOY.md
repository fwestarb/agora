# Publicar a demonstração do Ágora

O [site público](https://fwestarb.github.io/agora/) usa o GitHub Pages. Em **Settings → Pages**, a fonte é a raiz da branch `gh-pages`. A branch `main` reúne o código, o servidor local e os testes.

## Atualizar o site

1. Na branch `main`, execute `npm test` e publique as mudanças.
2. Em um checkout separado da branch `gh-pages`, copie para a raiz os quatro arquivos de `public/` da `main` (`index.html`, `style.css`, `app.js` e `data.js`).
3. Em `index.html`, inclua `<meta name="agora-demo" content="true">` dentro de `<head>`. Esse marcador ativa o modo estático. Mantenha `.nojekyll` na raiz.
4. Revise o diff, faça o commit e envie a branch `gh-pages`. Acompanhe o workflow **pages build and deployment** na aba **Actions**.
5. Abra a URL pública. Clique em **Abrir exemplo** e confira o mapa e a comparação de alternativas.

A geração de novos dilemas depende do servidor Node.js. O [guia de desenvolvimento](DESENVOLVIMENTO.md) explica a configuração local. Mantenha credenciais no arquivo `.env` do servidor.
