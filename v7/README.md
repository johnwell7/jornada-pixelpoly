# Jornada V7.2 · O refúgio

Baixe [Jornada_V7.html](Jornada_V7.html) e abra no navegador. Ele já inclui
o código e a arte. Em um celular, esse mesmo arquivo pode ser servido por HTTP.

O Lar preenche a tela na vertical. A câmera acompanha a ovelha de perto e
ajusta o enquadramento ao observar um objeto ou deitar. A interface respeita
as áreas seguras do aparelho. A área útil é a disponibilizada pelo navegador,
com suporte ao viewport dinâmico. Instalação como PWA fica para uma etapa
futura.

Deixe a tela aberta e acompanhe a ovelha. Ela pode observar a janela, explorar
a planta, ajeitar-se no tapete, prestar atenção ao quarto ou dormir ao lado
da cama. Toque ou arraste sobre a ovelha para fazer carinho. Um convite pode
aparecer quando ela estiver disponível. Ele influencia sua próxima decisão.

## Código e verificação

Para servir os módulos, execute `python -m http.server 8080` nesta pasta
e abra [localhost:8080](http://localhost:8080/). Acrescente `?debug=1`
para testar destinos com cliques no chão em modo de desenvolvimento.

- `activities.mjs` registra as atividades. Uma entrada declara `id`,
  `interaction`, `weight(context)` e os passos de animação `after`. Atividades
  ligadas a objetos também declaram `location` (ponto de interesse visual)
  e `approach` (ponto caminhável com orientação e pose de chegada).
  `available(context)` define condições. `before` permite etapas antes de
  andar. Cada etapa define modo, pose e intervalo de duração em segundos.
  Com `invitation`, a atividade também declara `available` e `approach`.
- `behavior.mjs` usa cansaço, temperamento, proximidade e o histórico de
  decisões para pesar as opções. Pode parar por um instante durante um
  trajeto. O carinho suspende a ação e preserva o ponto de retomada.
- `navigation.mjs` cuida das colisões e da câmera. Em rotas com alternativas
  livres, pode passar por um ponto intermediário sem um desvio longo.
- `node build.mjs` atualiza o HTML autônomo.
- `node --test tests/*.test.mjs` executa os testes da câmera, das rotas e do
  comportamento. Um ponto de interesse temporário testa o registro de novas
  atividades.
- Com `?observe=1`, `jornadaObservation()` no console retorna estados,
  durações e rotas para inspeção de uma sessão local.

[Captura da câmera mobile](qa/v72-mobile.png) ·
[Registro da observação e verificação](qa/v72-observacao.md)

## Arquitetura do Lar

`Jornada_V7.html` é um artefato de distribuição montado pelo `build.mjs`.
A entrada modular é `index.html` e a fonte permanece nos módulos abaixo.

| Módulo | Responsabilidade |
|---|---|
| `game.mjs` | Compõe os módulos, roda o loop de quadro e aplica a câmera. |
| `room-session.mjs` | Expõe os comandos da sessão, a projeção do estado da ovelha e a saída de eventos da atividade. |
| `behavior.mjs` · `activities.mjs` | Decisões da ovelha, registro das atividades e respostas ao carinho. |
| `room-objects.mjs` · `navigation.mjs` | Objetos do quarto, pontos de interação, colisões, rotas e câmera. |
| `room-renderer.mjs` · `art/` | Desenho do cenário, profundidade, luz e animação. |
| `room-controls.mjs` · `room-interface.mjs` · `room.css` | Gestos no canvas, controles da interface e estilos. |

O módulo de composição liga a interface aos comandos `pet` e `invite` da
sessão. A interface recebe a posição projetada da ovelha e dados de
apresentação. A sessão funciona sem DOM e sem conhecer o renderizador.

`createRoomSession({onActivity})` fornece os eventos de domínio que já
alimentam o modo `observe`. Um sistema de progresso futuro pode consumir
esses eventos na composição da aplicação e gerenciar a própria
persistência sem depender do canvas ou dos elementos HTML.

### Validação da refatoração

Os 13 testes automatizados passaram. No Chrome, o HTML anterior, o HTML
reconstruído e a entrada modular servida por HTTP produziram os mesmos
estados e quadros em nove pontos de uma sequência determinística. A
verificação cobriu tela vertical emulada, desktop, caminhada, carinho por
toque e arrasto, sono, convite e deslocamento em modo de desenvolvimento.
