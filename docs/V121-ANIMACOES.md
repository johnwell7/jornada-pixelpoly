# V121 — animações e sono por contexto

- Lar: começa a cochilar após 30 segundos sem interação, mantém os olhos fechados por cinco segundos e desperta com uma levantada rápida da cabeça e uma piscada. Reinicia o período acordado.
- Leitura: começa a cochilar após 14 segundos; continua dormindo até interação por toque, ponteiro, teclado ou rolagem.
- Respiração: ciclo de aproximadamente 3,9 segundos, expansão contínua do tronco e deslocamento superior de até 3,4 pixels na imagem de 256 × 286.
- Reações: escuta com orelha esquerda ou direita, escuta alternada, curiosidade com inclinação e atenção, despertar e carinho demorado.
- Roupas que usam o controlador antigo também respeitam os tempos separados.

Foram gerados 68 PNGs RGBA completos por deformação contínua da imagem neutra, fora do aplicativo. Não existem recortes de cabeça, tronco ou orelha no player. O retângulo de exibição continua fixo; a região de apoio a partir da linha 220 é idêntica em todos os quadros novos (zero canais alterados). Os 32 quadros de respiração substituem os antigos no manifesto; há 36 novos índices para orelhas e atenção.

Os recursos novos somam aproximadamente 7,2 MB; o manifesto usa 117 quadros, cerca de 34,3 MB de pixels RGBA decodificados, compartilhados entre Lar e leitura. O pré-carregamento continua necessário antes de animar.

Geração: `node production/render-motion.cjs` a partir da raiz, em Windows com Chrome e Node 24. Usa a imagem neutra já existente no repositório. Produz também `qa/motion-ground.json` e uma folha de inspeção. Não usa serviços externos nem geração de imagens durante o jogo.

Validação: testes de ciclo completo dos dois contextos, interações, geometria fixa, sequências de retorno ao neutro, pausa, movimento reduzido e comparação da região de apoio. A percepção da amplitude no celular ainda depende de avaliação no aparelho.
