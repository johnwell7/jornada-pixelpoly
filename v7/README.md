# Jornada V7.3 · Lar

Baixe [Jornada_V7.html](Jornada_V7.html) e abra no navegador. Esse arquivo
inclui o código e a arte e pode ser aberto sem conexão. Para servir a
versão modular, rode um servidor HTTP estático nesta pasta e abra
`index.html`.

A composição usa a arte aprovada do quarto. Em paisagem, o quadro inteiro
cabe na janela. Em retrato, a câmera acompanha a ovelha de perto. Ela começa
na almofada verde e alterna as atividades espontaneamente. Toque ou arraste
sobre ela para fazer carinho.

## Arte e navegação

- `art/refuge.webp` contém o quarto, com a área da almofada recomposta
  onde a ovelha aparecia na ilustração.
- `art/lamb-sprite.png` contém a personagem isolada. O renderizador usa o
  sprite lateral e seu espelho para animar caminhada, repouso e reação
  ao toque.
- `art/room.mjs` define as máscaras dos móveis. A ordenação em profundidade
  reaplica as partes do cenário que ficam à frente da personagem.
- `navigation.mjs` contém os limites e as colisões alinhados aos móveis
  da nova arte. `activities.mjs` liga os pontos de interesse à rotina.
- `node build.mjs` gera o HTML autônomo.
- `node --test tests/*.test.mjs` verifica rotas, câmera e rotina.

Os doze testes passaram. Conferi a composição inteira no Chrome desktop
e o enquadramento e o toque durante a caminhada em três viewports
verticais emulados. O [registro da observação da V7.2](qa/v72-observacao.md)
documenta a etapa anterior.
