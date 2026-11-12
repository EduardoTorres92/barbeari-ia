# Receitas das imagens da Pente Fino

As fotos do site foram geradas por IA a partir dos prompts desta pasta (`prompts/`, em inglês, que é como os geradores
de imagem respondem melhor). Servem para refazer uma foto, gerar mais uma no mesmo estilo ou trocar pelo negócio da
pessoa. Qualquer gerador de imagem que aceite texto serve (o do ChatGPT, o Gemini, o Midjourney, o Ideogram); nenhum
passo depende de uma conta específica.

## Ordem
1. **Estilo**: todo prompt de foto termina com o mesmo parágrafo (preto e branco, uma luz dura, grão de filme, quadro
   levemente torto, "nada de texto, logo ou marca"). Mantenha esse parágrafo em qualquer foto nova: é ele que deixa a
   série coerente.
2. **Barbeiros no espelho** (`espelho-1` a `4`): paisagem 3:2. Troque a descrição do barbeiro e o que ele está fazendo.
3. **Cortes** (`corte-1` a `8`): cada prompt pede um **díptico**, as duas vistas da mesma pessoa numa imagem só (frente
   à esquerda, costas à direita, um vão preto no meio). Gerar as duas separadas quase sempre dá duas pessoas diferentes.
   Depois, `arquivos/fonte/imagens.mjs` acha o vão, corta as duas fotos e enquadra em 6:7.
4. **Produtos** (`produto-1` a `4`): retrato 4:5, pedestal preto sob spot, sem rótulo.
5. **Ferramentas** (`ferramenta-*`): o objeto sozinho sobre cinza claro liso; depois, recorte o fundo
   (no Mac: `swift arquivos/fonte/recorta.swift foto.png recorte.png`; em outro sistema, qualquer removedor de fundo)
   e salve em WebP com transparência.
6. **Cabelo da abertura** (`cabelo`): 16:9, o maior tamanho que o gerador der.

## Tamanhos no site
- `public/img/espelho-N.webp`: 1400 px de largura.
- `public/img/cortes/corte-N-frente.webp` e `-costas.webp`: 760 px de largura, 6:7.
- `public/img/produtos/*.webp`: 820 px de largura, 4:5.
- `public/img/ferramentas/*.webp`: até 760 px no lado maior, com fundo transparente.
- `public/img/cabelo.webp`: 2000 px de largura.

Converta para WebP (qualidade ~78; ~82 nas ferramentas) e em escala de cinza, como as da demo. O
`arquivos/fonte/imagens.mjs` faz tudo isso de uma vez a partir de `fonte/bruto/<nome>.png` (precisa do `sharp`:
`npm install -E -D sharp@0.35.5`).

## Custo e alternativas
Cada imagem leva de 1 a 3 minutos; a série inteira (25 imagens) cabe numa tarde e, nos planos de assinatura dos
geradores, não custa nada além da mensalidade. Fotos reais da barbearia (a equipe trabalhando, cortes de clientes com
autorização, os produtos da bancada) funcionam ainda melhor: só respeite as proporções e o preto e branco.

## Adaptando para outro negócio
- Salão de beleza: troque "barber" por "hairdresser" / "beauty salon", os cortes por penteados e cores, as
  ferramentas por secador, escova, tesoura e pente, e os produtos pelos da bancada do salão.
- Mantenha o parágrafo de estilo e as proporções: o layout do site depende delas.
