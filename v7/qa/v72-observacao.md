# Jornada V7.2 · Observação e verificação

Sessão sem interação em Chrome headless, com emulação de viewport vertical de 390 × 844 CSS px. O HTML autônomo foi aberto em arquivo local, com o modo de observação habilitado.

| Medida | Resultado |
|---|---:|
| Tempo real sem input | 900,01 s |
| Tempo rastreado pelo jogo | 899,72 s |
| Quadros monitorados | 53967 |
| Quadros com personagem cortada | 0 |
| Tempo caminhando | 104,9 s (11,7%) |
| Atividades registradas | 54 (53 concluídas) |
| Deslocamentos concluídos | 37 |
| Tipos de atividade observados | 6 |
| Sono | 10 episódios, 17,7 a 35,9 s previstos por episódio |
| Erros de JavaScript | 0 |

Ocorrências de uma sequência repetida três vezes seguidas, considerando blocos de uma a cinco atividades: zero na sequência completa e zero na sequência de destinos alcançados.

A inspeção rápida em Chrome cobriu 320 × 568, 390 × 844 e 430 × 932. Um toque durante a caminhada iniciou o carinho e a ovelha retomou o trajeto. Doze testes locais passaram, incluindo cinco simulações de 15 minutos com sementes diferentes e a inclusão temporária de um livro como ponto de interesse.

Os testes mobile usaram emulação de Chrome. A medição em celular físico e a instalação como PWA ficam fora dessa verificação.

## Cronologia

Os pares são coordenadas internas x,y. A rota registra o ponto de partida e os pontos navegados. Um asterisco marca uma atividade em andamento no fim da captura.

| Início | Atividade | Duração (s) | Partida | Chegada | Rota |
|---:|---|---:|---:|---:|---|
| 00:04 | Pausa | 19,5 | — | — | — |
| 00:23 | Pausa | 13,5 | — | — | — |
| 00:37 | Escuta | 7,1 | — | — | — |
| 00:44 | Janela | 12,5 | 00:44 | 00:46 | 196,237 → 211,155 |
| 00:57 | Tapete | 12,2 | 00:57 | 00:59 | 211,155 → 196,242 |
| 01:09 | Repouso junto à cama | 31,8 | 01:10 | 01:14 | 196,242 → 346,248 |
| 01:41 | Pausa | 19,9 | — | — | — |
| 02:01 | Janela | 18,3 | 02:01 | 02:05 | 346,248 → 208,204 → 211,155 |
| 02:19 | Escuta | 7,5 | — | — | — |
| 02:26 | Repouso junto à cama | 52,1 | 02:28 | 02:32 | 211,155 → 280,164 → 296,236 → 346,248 |
| 03:18 | Planta | 12,2 | 03:18 | 03:23 | 346,248 → 280,272 → 176,181 |
| 03:31 | Pausa | 19,2 | — | — | — |
| 03:50 | Janela | 5,8 | 03:50 | 03:51 | 176,181 → 211,155 |
| 03:56 | Tapete | 17,3 | 03:56 | 03:58 | 211,155 → 172,213 → 196,242 |
| 04:13 | Janela | 9,2 | 04:13 | 04:15 | 196,242 → 211,155 |
| 04:22 | Repouso junto à cama | 56,1 | 04:25 | 04:29 | 211,155 → 280,272 → 346,248 |
| 05:18 | Janela | 12,5 | 05:18 | 05:22 | 346,248 → 208,204 → 211,155 |
| 05:31 | Escuta | 8,2 | — | — | — |
| 05:39 | Planta | 9,5 | 05:39 | 05:40 | 211,155 → 176,181 |
| 05:49 | Pausa | 8,5 | — | — | — |
| 05:57 | Planta | 3,4 | 05:57 | 05:57 | 176,181 → 176,181 |
| 06:01 | Repouso junto à cama | 37,8 | 06:02 | 06:08 | 176,181 → 280,272 → 346,248 |
| 06:38 | Tapete | 16,4 | 06:38 | 06:42 | 346,248 → 196,242 |
| 06:55 | Pausa | 13,9 | — | — | — |
| 07:09 | Janela | 12,4 | 07:09 | 07:11 | 196,242 → 211,155 |
| 07:21 | Repouso junto à cama | 49,6 | 07:23 | 07:27 | 211,155 → 280,164 → 296,236 → 346,248 |
| 08:11 | Planta | 7,3 | 08:11 | 08:15 | 346,248 → 280,272 → 176,181 |
| 08:18 | Tapete | 7,4 | 08:18 | 08:20 | 176,181 → 196,242 |
| 08:25 | Escuta | 5,6 | — | — | — |
| 08:31 | Janela | 9,6 | 08:31 | 08:33 | 196,242 → 211,155 |
| 08:41 | Planta | 6,4 | 08:41 | 08:42 | 211,155 → 176,181 |
| 08:47 | Pausa | 6,3 | — | — | — |
| 08:53 | Repouso junto à cama | 35,0 | 08:54 | 08:59 | 176,181 → 280,272 → 346,248 |
| 09:28 | Planta | 11,5 | 09:28 | 09:35 | 346,248 → 280,272 → 176,181 |
| 09:40 | Janela | 10,6 | 09:40 | 09:41 | 176,181 → 211,155 |
| 09:50 | Planta | 6,4 | 09:50 | 09:52 | 211,155 → 176,181 |
| 09:57 | Escuta | 4,9 | — | — | — |
| 10:02 | Tapete | 6,9 | 10:02 | 10:03 | 176,181 → 172,213 → 196,242 |
| 10:09 | Repouso junto à cama | 33,4 | 10:10 | 10:13 | 196,242 → 346,248 |
| 10:42 | Planta | 9,7 | 10:42 | 10:46 | 346,248 → 280,272 → 176,181 |
| 10:52 | Pausa | 9,2 | — | — | — |
| 11:01 | Escuta | 7,3 | — | — | — |
| 11:08 | Janela | 12,5 | 11:08 | 11:09 | 176,181 → 211,155 |
| 11:21 | Repouso junto à cama | 48,5 | 11:23 | 11:28 | 211,155 → 280,272 → 346,248 |
| 12:09 | Janela | 12,8 | 12:09 | 12:13 | 346,248 → 208,204 → 211,155 |
| 12:22 | Tapete | 11,3 | 12:22 | 12:25 | 211,155 → 172,213 → 196,242 |
| 12:33 | Pausa | 19,7 | — | — | — |
| 12:53 | Repouso junto à cama | 40,6 | 12:55 | 12:58 | 196,242 → 346,248 |
| 13:34 | Pausa | 18,9 | — | — | — |
| 13:53 | Janela | 17,2 | 13:53 | 13:57 | 346,248 → 208,204 → 211,155 |
| 14:10 | Pausa | 12,7 | — | — | — |
| 14:23 | Planta | 10,2 | 14:23 | 14:24 | 211,155 → 176,181 |
| 14:33 | Janela | 6,5 | 14:33 | 14:34 | 176,181 → 211,155 |
| 14:39 | Repouso junto à cama | 19,8* | 14:42 | 14:47 | 211,155 → 280,164 → 296,236 → 346,248 |
