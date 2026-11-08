# V120 — estabilidade dos sprites

O player anterior deslocava uma textura de atlas de 1024 × 1144 a cada quadro e alterava suas dimensões ao atravessar páginas. Essa estratégia foi substituída por 81 imagens completas de 256 × 286, todas com o mesmo retângulo de exibição. Apenas a imagem muda, sem deslocar ou redimensionar a textura. As imagens são pré-carregadas e decodificadas antes da reprodução.

Os renders anteriores usavam uma amostra por pixel. O gerador agora usa 32 amostras, com semente fixa, para reduzir instabilidade de amostragem nas bordas. Não foi reduzida a frequência de reprodução: movimentos a 30 fps e piscada a 60 fps.

Verificações: 26 testes, retângulo fixo ao longo da reprodução e região de apoio das patas idêntica nos 81 renders. Recursos comprimidos: 4.976.946 bytes; pixels decodificados: 23.721.984 bytes. O número de requisições aumenta de 6 para 81. Os atlas antigos foram removidos do aplicativo.

O problema relatado precisa de confirmação no aparelho do usuário: a análise de recursos e os testes de controle não substituem uma medição em celular.
