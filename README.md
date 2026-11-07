# A Corrida dos Anéis

Primeira versão jogável para navegador. Thaís corre pelo reino em direção ao seu amado, o príncipe JP, procurando reunir o máximo de anéis. A jornada é infinita nesta versão; ainda não existe uma chegada ou quantidade de anéis que encerre a partida com vitória. Execute `npm start` nesta pasta e abra http://localhost:8080. Execute `npm test` para os testes de mecânica. Não há dependências de execução nem serviços externos. O navegador precisa suportar módulos JavaScript, Canvas 2D e Pointer Events.

Use espaço, seta para cima ou toque/clique na área do jogo para saltar. Esc ou o botão no canto superior direito pausam. O jogo pausa ao perder o foco. O recorde fica apenas neste navegador; se o armazenamento não estiver disponível, a partida continua normalmente.

## Decisões técnicas

Canvas 2D e módulos nativos atendem ao escopo sem motor ou dependências. A simulação usa passos fixos de 1/120 s e limita o tempo acumulado após uma interrupção. A física, geração com semente, colisões e armazenamento ficam separados da apresentação. Os obstáculos têm áreas de colisão menores que a imagem, e o espaçamento mínimo é de 620 unidades; mesmo na velocidade máxima de 370 unidades/s, há tempo de recuperação entre saltos. O salto tem aproximadamente 160 unidades de altura e 0,82 s de duração. As distâncias apresentadas são unidades de jogo divididas por dez, não uma medida física.

## Arte e limitações

As imagens vieram do pacote fornecido. Os oito quadros da corrida foram extraídos da imagem transparente fornecida em Downloads, preservada em `assets/thais-sequencia-original.png`; `tools/prepare_thais.py` reproduz os recortes e requer Pillow; o movimento vertical é aplicado pela física e independente do ciclo de corrida. O tratamento automático e a continuidade entre quadros ainda merecem revisão manual profissional, especialmente nas bordas finas. Pedra, tronco e anel usam os recortes originais com alfa; seus limites são aproximados e podem ser refinados. A paisagem é uma única imagem estática, sem parallax ou repetição: requer separação em camadas e preparação de emendas para uma versão final. O chão usa o asset fornecido, com repetição e extensão de textura em Canvas; as emendas ainda são provisórias. Não há animações específicas de repouso ou colisão nem áudio. A interface usa Newsreader, com licença incluída em assets.

A animação de corrida usa sete poses distintas da imagem fornecida; a oitava é muito próxima da primeira. A cadência acompanha a distância percorrida e transições breves suavizam as mudanças de pose. Como a arte não contém quadros intermediários desenhados, ainda pode haver discretas sobreposições durante a transição.

Em celulares, o modo horizontal amplia a pista. Na orientação vertical, o jogo mantém toda a pista visível e permite tocar em qualquer ponto da área de jogo para pular.
