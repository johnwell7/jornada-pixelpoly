# Jornada Pixel-Poly

Companion espiritual com quarto interativo, leitura das escrituras, mochila e ovelha Pixel-Poly. Base inicial: Jornada V119.

## Executar

Requer Node.js 20 ou superior. Não há dependências npm para instalar.

```sh
npm start
```

Abra o endereço informado pelo servidor. O aplicativo está em `dist/`.

```sh
npm run build
```

O build verifica a sintaxe e executa 26 testes. Não transforma ou copia o aplicativo: `dist/` já é a saída estática pronta para hospedagem.

## Organização

- `dist/`: aplicativo e recursos usados no navegador.
- `tests/`: regressões de estado, animações e ambiente.
- `production/`: produção offline dos sprites, incluindo o projeto Blender.
- `reference/`: arte original e módulos da V118 para restauração.
- `qa/`: métricas de geometria e estabilidade das patas.
- `docs/`: decisões e limitações da implementação.

## Animação atual

A ovelha padrão usa 81 quadros completos em atlas WebP para respiração, piscada, inclinação e carinho. O Blender é usado somente para produzir os sprites. O navegador reproduz os quadros sem separar cabeça, lã e patas.

Os trajes anteriores ainda usam o controlador antigo e precisam ser convertidos. A validação visual em celular continua pendente. Os testes automatizados não representam uma medição de FPS em aparelho real.

## Dados e publicação

O progresso continua no armazenamento local do navegador. Antes de migrar de endereço, exporte o progresso pelas configurações do aplicativo. Um novo domínio não recebe automaticamente os dados do endereço antigo.

Este repositório não configura publicação automática nem modifica o site anterior. Para hospedagem estática, use `npm run build` e diretório de saída `dist`.

## Restaurar a referência V118

```sh
python3 RESTAURAR_V118.py
```

Restaura os módulos e a arte anterior sem alterar saves. No Git, também é possível reverter um commit. A referência antiga não é carregada pelo aplicativo V119.

Veja [detalhes técnicos e limitações](docs/V119-IMPLEMENTACAO.md).
