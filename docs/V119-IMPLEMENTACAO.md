# Jornada V119 — prova funcional por quadros completos

A cópia local do aplicativo contém a nova ovelha padrão no Lar e no leitor. O site publicado NÃO foi atualizado: o repositório informado retornou 404. Não houve acesso para validar ou publicar no Cloudflare.

## Executar este repositório

Use `npm start` e abra o endereço informado. Os arquivos autocontidos de prévia e o vídeo estão na entrega ZIP V119 e não são duplicados neste repositório. O site anterior não foi alterado.

## O que mudou

- Ovelha padrão: 81 quadros RGBA completos, 256 × 286, em seis atlas WebP sem perdas. Respiração, piscadas, inclinação para ambos os lados e carinho; retorno ao repouso percorre quadros intermediários.
- Reprodução a 30 quadros por segundo, piscada a 60; atualização por requestAnimationFrame. Sem recortar, expandir ou girar partes da ovelha no aplicativo.
- Carinho repetido mantém no máximo uma reação pendente. Páginas invisíveis e movimento reduzido suspendem a reprodução; falha no carregamento mantém o repouso.
- Sombra independente: gradiente de contato sob os pés e extensão discreta para a direita, coerente com a janela à esquerda. Não usa a silhueta achatada da ovelha.
- Estado, inventário, descoberta, progresso, plantas e chama não foram reescritos. Os acessórios e o livro continuam disponíveis. Nenhuma migração de save.

## Técnica e arquivos

O teste de geração por IA foi rejeitado como animação final por variações de lã e patas entre desenhos; o candidato descartado não faz parte deste repositório.

A solução escolhida usa Blender 4.3.2 como ferramenta OFFLINE: uma superfície 2D contínua com a arte original como textura, câmera ortográfica e região de apoio fixada. Cabeça, lã e pescoço pertencem à mesma superfície. O movimento é suave e distribuído, sem peças isoladas ou lacunas. As pálpebras são procedurais e seguem as mesmas coordenadas da superfície. Cada pose é renderizada inteira antes de chegar ao jogo.

Isto é uma técnica 2.5D para produzir sprites 2D, NÃO um modelo volumétrico 3D da ovelha. Há deformação suave da superfície durante a produção, e nenhuma deformação em tempo real no aplicativo. Uma personagem 3D volumétrica não foi criada: exigiria reconstruir a arte e não trouxe vantagem para esta pose frontal.

- `dist/lamb-frames.js`: reprodução, carregamento, pausa, interação e transições.
- `dist/lamb-frames-data.js`: páginas e sequências de quadros.
- `dist/bitpoly-art.js`: quadro completo no lugar dos recortes e nova sombra.
- `dist/bitpoly-motion.js`: encaminha a ovelha padrão ao novo reprodutor; mantém o controlador dos trajes existentes.
- `dist/app.js`: mantém o gesto funcionando sem depender de um elemento de cabeça separado.
- `production/render_sprites.py` e `production/lamb-authoring.blend`: produção reproduzível; imagem original empacotada no Blender.
- `production/pack_frames.py`: empacotamento sem alterar a arte dos renders.

Novas skins podem fornecer outro manifesto com os mesmos nomes de sequências (`breath`, `blink`, `left`, `right`, `pet`) ao reprodutor. Cada arte precisa de calibração de textura, olhos, contorno e zona de apoio na produção; não há promessa de conversão automática de qualquer PNG sem conferência.

## Verificação executada

- `npm run build`: sintaxe e 26 testes passaram, incluindo compatibilidade de save antigo, exportação/importação, descoberta, equipamentos, plantas, chama, reprodução de quadros, cliques repetidos, pausa, limpeza de listeners e movimento reduzido em ambiente simulado.
- 81 renders verificados: região das patas nas linhas 225–285 idêntica byte a byte em todos os quadros. A checagem adicional desde a linha 220 também retornou zero diferenças.
- Uma única componente significativa da silhueta em todos os quadros; nenhum ponto invertido na superfície amostrada. Variação local de área da superfície entre 0,9068 e 1,0933, concentrada nas transições de inclinação; não é aumento ou redução de tamanho da ovelha inteira.
- Inspeção das poses e da composição no cenário, além da construção de ciclos completos de respiração, piscada, inclinação e carinho. Relatórios em `qa/pixel-check.json` e `qa/geometry-check.json`.
- Sprites: 3.912.680 bytes comprimidos; 23.721.984 bytes de pixels RGBA (~22,6 MiB) antes de overhead do navegador. Isso é cálculo de recursos, NÃO medição de RAM ou FPS em telefone.

## Limitações reais

Não houve validação interativa em navegador ou aparelho celular nesta sessão. A superfície de navegador disponível estava bloqueada para a prévia local; os testes do controlador usam DOM simulado. A composição renderizada não substitui essa validação. A publicação existente permanece como estava.

Os trajes antigos NÃO foram convertidos para estes quadros; continuam equipáveis pelo caminho anterior e podem manter seus problemas visuais. Esta prova cobre a ovelha padrão, como primeira etapa. Não foram reconstruídas variações independentes de orelhas, acompanhamento contínuo do olhar ou todas as antigas reações. A sonolência usa a pose de olhos fechados, sem respiração adicional nessa pose.

A inclinação é pequena (até 2,5°) e frontal. Não há giro para perfil. As pálpebras são estilizadas. Não é uma certificação de que todas as futuras skins estarão livres de defeitos.

## Restauração

`python3 RESTAURAR_V118.py` restaura `app.js`, `bitpoly-art.js`, `bitpoly-motion.js` e a PNG original a partir de `reference/`. Não altera saves. Os novos atlas ficam sem uso depois da restauração; podem ser apagados junto com `lamb-frames.js` e `lamb-frames-data.js` se a V118 for mantida. Guarde a cópia atual antes de restaurar.

## Reproduzir a produção

`blender -b --factory-startup --python production/render_sprites.py`

`python3 production/pack_frames.py` (Pillow e NumPy)

O Blender renderiza os PNGs temporários em `qa/frames/`; somente os atlas são usados pelo aplicativo. Para recalcular a análise de geometria: `python3 qa/validate_geometry.py` (SciPy). Não é necessário Blender para jogar.
