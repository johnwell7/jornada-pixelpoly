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
