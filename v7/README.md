# Jornada V7.1 · O refúgio

Baixe [Jornada_V7.html](Jornada_V7.html) e abra no navegador. O arquivo é
autônomo. Em celular, o mesmo HTML pode ser servido por HTTP.

- Deixe o Lar aberto. A ovelha começa no tapete e decide quando explorar.
- Toque ou arraste de leve sobre a ovelha para fazer carinho. Ela reage e
  retoma a atividade. Toques no chão não movem a personagem.
- Um convite pode aparecer quando a ovelha estiver disponível. A sugestão
  influencia a próxima decisão da ovelha.
- A ovelha observa a paisagem e pode descansar no tapete verde ao lado da
  cama. Observe por cerca de um minuto para ver a rotina variar.

## Código e verificação

Para servir os módulos, execute `python -m http.server 8080` nesta pasta
e abra [localhost:8080](http://localhost:8080/). Acrescente `?debug=1`
para testar destinos com cliques no chão em modo de desenvolvimento.

- `behavior.mjs` decide atividades por estado, preferência, visitas recentes,
  cansaço e convites. O carinho guarda o estado para retomar a caminhada,
  a observação ou o sono.
- `navigation.mjs` controla rotas, colisões e câmera. A rotina calcula
  uma rota quando escolhe um destino.
- `art/` contém o desenho em pixels do quarto, dos móveis, das luzes
  e dos 69 quadros direcionais da ovelha. A direção oeste espelha a leste.
- `game.mjs` liga a cena, os gestos e a interface.
- `node build.mjs` atualiza o HTML autônomo.
- `node --test tests/*.test.mjs` executa os testes.

Os oito testes passaram em um ambiente JavaScript. O teste de autonomia
correu 32 rotinas de 170 segundos com sementes distintas, verificando
colisões, janela, sono e despertar. Os demais cobrem rota, ordenação
por profundidade, câmera, convite e retomada após carinho. Uma simulação
da interface rodou o HTML autônomo em viewport de 390 × 844, verificou toque
e arrasto, alternou para 1920 × 992 e rendeu as imagens abaixo.

## Demonstração e limites

[Tapete](capturas-v71/01-tapete.png) · [Janela](capturas-v71/02-janela.png) ·
[Sono](capturas-v71/03-sono.png) · [Desktop](capturas-v71/04-desktop.png)

As imagens são quadros do Canvas em simulação. A conferência da V7.1 em
Chrome e Safari reais e a leitura em aparelho físico estão pendentes. A
cama, o tapete, a janela e as tábuas ganharam detalhes e enquadramento mais
aberto. A projeção ainda é estilizada em 2D, com sombras desenhadas e oclusão
pela base de cada peça. A revisão visual lado a lado com a imagem-conceito
original está pendente. As capturas e o código da V7.0 continuam no histórico.
