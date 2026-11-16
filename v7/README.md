# Jornada V7 · O refúgio

Abra [Jornada_V7.html](Jornada_V7.html) em um navegador. O arquivo é autônomo e
inclui a arte e o jogo. Num celular, abra o HTML pelo navegador ou sirva a pasta
por HTTP. No computador, use o mouse, as setas ou WASD.

1. A ovelha começa no tapete.
2. Toque na janela ou em **Janela**. A ovelha caminha até o banco e olha para fora.
3. Toque na cama ou em **Cama**. A ovelha contorna os móveis e descansa ao lado da cama.
4. Toque no chão para explorar por conta própria.

## Editar e conferir

Use qualquer servidor estático na pasta da demo. Por exemplo, execute
`python -m http.server 8080` e abra
[http://localhost:8080/index.html](http://localhost:8080/index.html).

- `navigation.mjs` contém a área caminhável, colisões, destinos e câmera.
- `art/room.mjs` contém a arte editável dos móveis, piso, parede e luz.
- `art/lamb.mjs` contém a arte editável de 30 quadros do spritesheet. O quarto usa três linhas direcionais, com espelhamento para oeste.
- `game.mjs` liga entrada, câmera, cena e interações.
- `node build.mjs` atualiza o HTML autônomo.
- `node --test tests/navigation.test.mjs` verifica percurso, colisões, limites da câmera e oclusão.

A demo usa Canvas 2D nativo. A resolução interna se adapta à tela, e a
imagem sobe em múltiplos inteiros de pixels. Os móveis são desenhados em
camadas próprias, ordenadas pelo ponto em que tocam o chão. Os quadros da
ovelha são desenhados numa folha no início da sessão.

## Capturas e estado da direção artística

[Tapete](capturas/01-tapete.png) · [Janela](capturas/02-janela.png) · [Cama](capturas/03-cama.png)

Os PNGs mostram três quadros renderizados pelo código do jogo em uma simulação
do Canvas com viewport vertical de 390 × 844. Na mesma simulação, passaram o
toque na janela, o botão da cama, o toque livre, as setas e o
redimensionamento para desktop. Os quatro testes de navegação passaram
em execução JavaScript. A validação em Chrome, Safari e celular físico
continua pendente.

A cama bordô, o tapete e a janela com colinas definem a primeira paleta. A
perspectiva do piso e a iluminação em blocos ainda são simples. O efeito de
luz não calcula sombras projetadas pelos móveis, e a oclusão usa a base de
cada peça inteira. O olhar e o repouso têm poucos quadros. A fidelidade
à imagem aprovada do quarto e a integração artística com a ovelha ainda
precisam de revisão visual antes de expandir a cena. O press kit de
[Enigma do Medo](https://sites.google.com/dumativa.com.br/enigmaoffear/pt-br)
foi usado como referência de iluminação e profundidade.
