# Publicação no Cloudflare Workers

Conecte este repositório a uma nova aplicação Workers.

- Branch: `main`
- Diretório raiz: raiz do repositório
- Comando de build: `npm run build`
- Comando de deploy: `npx wrangler deploy`
- Nome da aplicação: `jornada-pixelpoly`

`wrangler.jsonc` define `dist/` como os arquivos estáticos servidos. Não envie `production/`, `reference/`, `tests/` ou `qa/` como assets.

É necessário autorizar o GitHub na conta Cloudflare. Esta configuração não cria a aplicação nem conecta contas por si só. Antes de migrar para um novo endereço, exporte o progresso do aplicativo anterior.
