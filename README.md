# 🕵️ Jogo do Impostor

Multiplayer em tempo real. Cada pessoa joga no próprio celular, entrando por um código de sala de 4 letras.

Roda em Cloudflare Workers + Durable Objects: **link fixo, sempre disponível, sem espera para acordar
e sem custo** no plano gratuito.

👉 **[jogo-impostor.thiagoamil13.workers.dev](https://jogo-impostor.thiagoamil13.workers.dev)**

---

## Como se joga

Todo mundo recebe uma palavra secreta — menos o impostor. Cada um dá **uma dica** ligada ao tema, sutil o
bastante pra não entregar o jogo. Depois vocês discutem, votam, e o impostor descoberto ainda pode se
salvar acertando qual era a palavra.

De 3 a 16 jogadores. Fica bom mesmo com 5 ou mais.

### Pontuação

| Situação | Pontos |
|---|---|
| Cidadãos descobrem o impostor | +1 para cada cidadão |
| Impostor é descoberto mas acerta a palavra | +1 para todos |
| Impostor não é descoberto | +2 para o impostor |

---

## O que tem

- **Sala com código** — o host cria e compartilha o link; quem clica só digita o nome.
- **130 pares em 12 categorias**, que o host escolhe antes de começar.
- **Dois modos** — *Pares* (o impostor recebe uma palavra parecida e nem sabe que é o impostor) e
  *Clássico* (o impostor não recebe palavra nenhuma).
- **Dicas na voz ou digitadas** — no modo digitado todos escrevem ao mesmo tempo, e as dicas só
  aparecem quando o último enviar. Ninguém copia o tema de ninguém.
- **A votação abre sozinha** quando todos apertam "estou pronto". Não depende do host.
- **Votação secreta** com apuração automática no último voto.
- **Placar acumulado** entre rodadas.
- **Reconexão** — celular travou, Wi-Fi caiu, fechou a aba? Reabre e volta no mesmo lugar, com os pontos.
- **Host cai, outro assume** automaticamente.
- **Ninguém trava a partida** — quem some é ignorado no consenso, e o host pode forçar a votação ou a
  apuração se precisar.

### As palavras ficam no servidor

Os 130 pares vivem no `words.js`, que nunca é enviado ao navegador — a página recebe só a *sua* palavra.
Não adianta abrir o inspecionar elemento. Tem teste cobrindo isso.

---

## Estrutura

Cinco arquivos, todos na raiz. Sem pastas, sem build, sem `npm install` para publicar.

```
index.js        Worker (rotas) + Durable Object (uma sala cada)
game.js         regras do jogo — funções puras, sem rede
words.js        os 130 pares, só no servidor
html.js         a página do jogo inteira, embutida como texto
wrangler.jsonc  configuração do Worker
```

Cada sala é um Durable Object que **hiberna** entre uma jogada e outra: os jogadores continuam
conectados, o estado fica salvo em disco e o objeto volta em milissegundos quando alguém age. O
keepalive do cliente é respondido pela própria plataforma (`setWebSocketAutoResponse`), então o ping
que mantém a conexão viva não acorda a sala.

---

## Mexer no código

Editar direto pelo site do GitHub já funciona: a Cloudflare detecta o commit e republica em 1 ou 2
minutos.

**Adicionando palavras:** abra o `words.js` e acrescente pares em qualquer categoria, ou crie uma
categoria nova — ela aparece sozinha na tela de configuração do host. O primeiro item do par é a palavra
dos cidadãos e o segundo a do impostor, mas a ordem é sorteada a cada rodada, então tanto faz.

Um par bom é **próximo o bastante pra confundir, distante o bastante pra dica fazer sentido**.
*Cachorro × Lobo* funciona. *Cachorro × Poodle* é fácil demais pro impostor;
*Cachorro × Geladeira* entrega na primeira dica.

**Mexer na página:** o `html.js` é a página inteira dentro de uma template string. Cuidado com crases e
com `${` no meio do HTML — precisam vir escapados com `\`.

### Rodar na sua máquina (opcional)

Precisa de Node 18+. Só para desenvolver — publicar não exige nada disso.

```bash
npx wrangler dev      # simulador local em http://localhost:8787
npx wrangler deploy   # publica direto, sem passar pelo GitHub
```

Os testes ficam no repositório de desenvolvimento: `test/regras.mjs` valida as regras em Node com
hibernação simulada, e `test/e2e.mjs` joga uma partida real por WebSocket contra o simulador.
