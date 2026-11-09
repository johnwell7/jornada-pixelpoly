# V122 — sono de 20 segundos e movimentos sem ciclo compartilhado

## Comportamento

- Lobby: 20 segundos de inatividade até cochilar; mantém os cinco segundos de sono e o despertar com sustinho.
- Leitura: mantém 14 segundos e permanece dormindo até interação.
- Orelhas: espera aleatória entre reações; lado, amplitude, velocidade e pausa sorteados a cada reação. Não há alternância obrigatória esquerda/direita. A reação não depende de chegar ao mesmo ponto da respiração.
- Plantas: rajadas finitas com espera, duração, intensidade, sentido e velocidade sorteados. Cada planta tem sua agenda e as articulações recebem atrasos próprios. As entradas das rajadas são espaçadas e pelo menos uma planta permanece em repouso quando há várias plantas. No quarto com três plantas, no máximo duas recebem vento ao mesmo tempo.
- Movimento reduzido, pausa quando a tela fica oculta e descarte dos controladores continuam respeitados.

## Entrega

Pacote de atualização sobre a versão V121, commit-base `3ab44795a4a54bf7a04b9074d928eb4981b40fca` de `johnwell7/jornada-pixelpoly`.

Contém somente os arquivos alterados, com os caminhos do repositório preservados. Não exige trocar as imagens nem o manifesto. Nenhum commit, push ou deploy foi realizado para esta atualização.

Extraia e copie o conteúdo sobre a raiz do repositório existente, substituindo os arquivos correspondentes. Não substitua o projeto inteiro por este pacote. Execute `npm run build` e faça seu commit normalmente.

## Verificação

33 testes: sono e despertar dos dois contextos; roupas; reprodução dos quadros; interações; movimento reduzido; variação independente das orelhas; rajadas com intervalos diferentes; limite de duas plantas em movimento; continuidade suave das rajadas durante três minutos simulados.
