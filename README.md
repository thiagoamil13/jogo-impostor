# 🕵️ Jogo do Impostor — Cloudflare Workers

Multiplayer em tempo real, cada um no seu celular, entrando por um código de sala de 4 letras.
Roda em Cloudflare Workers + Durable Objects: **link fixo, sempre disponível, sem hibernação perceptível
e sem custo** no plano gratuito.

## Por que Cloudflare e não um servidor comum

Nas hospedagens gratuitas tradicionais o servidor é um container ligado que **dorme** quando ninguém
acessa — e a primeira visita depois disso espera de 30 a 60 segundos ele acordar.

Aqui o modelo é outro. Cada sala é um *Durable Object* que hiberna entre uma jogada e outra: os jogadores
continuam conectados, o estado fica salvo em disco e o objeto volta em milissegundos quando alguém age.
Não existe tela de espera.

Detalhe: o keepalive do cliente é respondido pela própria plataforma (`setWebSocketAutoResponse`),
então o "ping" que mantém a conexão viva **não acorda** a sala.

## O que ele faz

- **Sala com código** — o host cria, compartilha o link (`seusite.workers.dev/#AB12`) e o pessoal entra.
- **Palavras no servidor** — os 130 pares nunca chegam ao navegador. Ninguém descobre a palavra abrindo
  o inspecionar elemento. Isso está coberto por teste.
- **Dois modos** — *Pares* (impostor recebe palavra parecida e nem sabe que é impostor) e *Clássico*
  (impostor não recebe palavra).
- **Dicas na voz ou digitadas** — o host escolhe. Digitadas permite jogar sem chamada de voz.
- **Votação secreta** com apuração automática no último voto.
- **Última chance** — impostor descoberto tenta adivinhar a palavra (aceita sem acento e em qualquer caixa).
- **Placar acumulado** entre rodadas.
- **Reconexão** — celular travou, Wi-Fi caiu, fechou a aba? Reabre e volta no mesmo lugar, com os pontos.
- **Host cai, outro assume** automaticamente.
- **Ninguém trava a partida** — se alguém some na hora de votar, o host apura com os votos que tem.

### Pontuação

| Situação | Pontos |
|---|---|
| Cidadãos descobrem o impostor | +1 para cada cidadão |
| Impostor é descoberto mas acerta a palavra | +1 para todos |
| Impostor não é descoberto | +2 para o impostor |

## Publicar

Veja **DEPLOY-CLOUDFLARE.md** — passo a passo pelo site, sem terminal.

## Arquivos

```
src/index.js       Worker (rotas) + Durable Object (uma sala cada)
src/game.js        regras do jogo, funções puras, sem rede
src/words.js       130 pares em 12 categorias — nunca vai para o navegador
public/index.html  o jogo inteiro: telas, WebSocket, reconexão
wrangler.jsonc     configuração do Worker
test/regras.mjs    testa as regras em Node, com hibernação simulada
test/e2e.mjs       partida real por WebSocket contra o simulador local
```

## Mexer no código

Precisa de Node 18+ **só para desenvolver** — para publicar não precisa.

```bash
npm install
node test/regras.mjs     # regras (não precisa subir nada)
npm run dev              # simulador local em http://localhost:8787
node test/e2e.mjs        # com o dev rodando em outro terminal
npm run deploy           # publica (alternativa ao deploy pelo site)
```

### Adicionando palavras

Abra `src/words.js` e acrescente pares em qualquer categoria, ou crie uma categoria nova — ela aparece
sozinha na tela de configuração do host. O primeiro item do par é a palavra dos cidadãos e o segundo a do
impostor, mas a ordem é sorteada a cada rodada, então tanto faz.

Um par bom é **próximo o bastante pra confundir, distante o bastante pra dica fazer sentido**.
*Cachorro × Lobo* funciona. *Cachorro × Poodle* é fácil demais pro impostor;
*Cachorro × Geladeira* entrega na primeira dica.

Se você publicou pelo GitHub, basta editar o arquivo lá e salvar: a Cloudflare republica sozinha.
