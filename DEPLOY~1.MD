# Publicando o Jogo do Impostor na Cloudflare

Tempo: uns 15 minutos. **Não precisa instalar nada no PC** — nem Node, nem terminal, nem Git.
Depois de pronto, seu computador pode ficar desligado.

Duas contas grátis: **GitHub** (guarda o código) e **Cloudflare** (roda o código).
Nenhuma pede cartão para o que vamos usar.

---

## Parte 1 — Colocar o código no GitHub

### 1.1 Descompacte
Extraia o zip. Vai aparecer a pasta `impostor-cloudflare` com:

```
wrangler.jsonc
package.json
.gitignore
README.md
DEPLOY-CLOUDFLARE.md
src/        (pasta)
public/     (pasta)
test/       (pasta)
```

### 1.2 Crie a conta
**github.com** → **Sign up**. Email, senha, usuário, confirmar email.

### 1.3 Crie o repositório
1. Botão **+** no canto superior direito → **New repository**
2. **Repository name:** `jogo-impostor`
3. Deixe **Public**
4. **Não marque** "Add a README file"
5. **Create repository**

### 1.4 Suba os arquivos
Na página do repositório vazio, clique em **"uploading an existing file"**.

> ⚠️ **O erro mais comum:** abra a pasta `impostor-cloudflare`, selecione **os arquivos de dentro**
> (Ctrl+A) e arraste. **Não arraste a pasta inteira.** Se arrastar, o `wrangler.jsonc` fica um nível
> abaixo da raiz e a Cloudflare não acha a configuração.
>
> Certo: `wrangler.jsonc` na raiz. Errado: `impostor-cloudflare/wrangler.jsonc`.

As subpastas `src`, `public` e `test` vão junto normalmente — o GitHub preserva a estrutura.

Role até o fim e clique em **Commit changes**.

Confira: a página inicial do repositório deve mostrar `wrangler.jsonc`, `package.json`, `README.md` e as
pastas `src`, `public`, `test` listados direto, sem pasta extra em volta.

---

## Parte 2 — Publicar na Cloudflare

### 2.1 Crie a conta
**dash.cloudflare.com** → **Sign up**. Email e senha, confirmar email. Não pede cartão.

### 2.2 Importe o repositório
1. No menu lateral, **Compute (Workers)** — em algumas contas aparece como **Workers & Pages**
2. **Create application**
3. Procure a opção **Import a repository** e clique em **Get started**
4. Conecte sua conta do **GitHub** e autorize. Pode liberar só o repositório `jogo-impostor`
5. Selecione o repositório **jogo-impostor**

### 2.3 Configure

| Campo | O que colocar |
|---|---|
| **Project name** | `jogo-impostor` — vira o endereço `jogo-impostor.SEUUSUARIO.workers.dev` |
| **Build command** | deixe **vazio** |
| **Deploy command** | `npx wrangler deploy` (normalmente já vem preenchido) |
| **Branch** | `main` |

Não precisa criar variável de ambiente nenhuma.

Se a Cloudflare abrir um **pull request no seu repositório** sugerindo configuração, você pode fechar:
o `wrangler.jsonc` já está pronto no projeto.

### 2.4 Deploy
Clique em **Save and Deploy**. Leva de 1 a 3 minutos.

Quando terminar, o link aparece na tela: `https://jogo-impostor.seuusuario.workers.dev`

---

## Parte 3 — Testar

1. Abra o link. Deve carregar a tela do jogo **na hora** — sem espera.
2. Digite um nome, **Criar sala nova**, anote o código.
3. Abra uma **aba anônima** (Ctrl+Shift+N) no mesmo link, entre com outro nome e o código.
4. Os dois aparecendo no lobby = funcionando. Falta o terceiro jogador para começar.

Depois use o botão **Copiar link do convite**: ele já leva o código junto (`.../#AB12`), quem clicar só
digita o nome.

---

## Se der problema

**"Missing entry-point" ou erro de configuração no build**
Você arrastou a pasta em vez dos arquivos. O `wrangler.jsonc` e o `src/` precisam estar na raiz do
repositório. Apague os arquivos no GitHub e suba de novo, ou aponte o **Root directory** do projeto para
`impostor-cloudflare` nas configurações de build.

**Erro citando `new_sqlite_classes` ou Durable Objects**
Não mexa nesse trecho do `wrangler.jsonc`. É justamente o `new_sqlite_classes` que permite Durable Objects
no plano gratuito — trocar por `new_classes` faz pedir plano pago.

**A página abre mas ninguém entra na sala**
Veja os **Logs** do Worker no painel (a observabilidade já vem ligada na configuração). O erro aparece lá.

**"Sala não encontrada"**
Salas sem uso são apagadas depois de 3 horas. Crie outra.

---

## Depois que estiver no ar

**Trocar palavras:** edite `src/words.js` direto pelo site do GitHub (abra o arquivo, clique no lápis,
salve). A Cloudflare detecta o commit e republica sozinha em 1 ou 2 minutos.

**Atalho no celular:** abra o link → menu do navegador → *Adicionar à tela de início*. Vira um ícone.

**Custo:** o plano gratuito dá 100.000 requisições por dia e Durable Objects com armazenamento SQLite.
Uma noite de jogo com dez amigos não chega perto disso. Como as salas hibernam entre as jogadas, o tempo
de execução cobrado é praticamente zero.
