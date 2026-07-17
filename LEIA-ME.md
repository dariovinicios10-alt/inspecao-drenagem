# Inspeção de Drenagem — Consórcio Caminhos da Celulose

Aplicativo web 100% offline para inspeção de drenagens rodoviárias (superficial e profunda),
com coleta de fotos e geração de relatório Excel a partir do template oficial.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura do app (telas de seleção, formulário e exportação) |
| `app.css` | Estilos (layout mobile-first) |
| `app.js` | Lógica: CSV → IndexedDB, fotos, rascunhos, exportação Excel |
| `sw.js` | Service Worker: cache offline do app, do CSV, do template e das bibliotecas |
| `manifest.json` / `icon.svg` | PWA: permite "Adicionar à tela inicial" no celular |
| `00 - Consolidado - Projetos Cadastro.csv` | Base de dados das drenagens (colocar na mesma pasta) |
| `MODELO_Drenagem 1 (1).xlsx` | Template do relatório (já presente) |

## Como funciona offline

1. **Primeiro acesso (com internet):** o Service Worker baixa e guarda em cache o app,
   o CSV, o template XLSX e as bibliotecas (PapaParse e ExcelJS). O CSV também é gravado
   no IndexedDB do navegador.
2. **Acessos seguintes (sem internet):** tudo abre do cache. As inspeções e fotos são
   salvas localmente no IndexedDB do celular.
3. **Exportação:** o botão "Gerar Relatório e Baixar" lê o template do cache, preenche os
   dados e as fotos e baixa o(s) arquivo(s) `.xlsx` no dispositivo — sem precisar de rede.

O template comporta **2 inspeções por arquivo** (dois blocos por página). Com mais de duas
inspeções salvas, o app gera vários arquivos numerados automaticamente.

## Mapeamento no Excel (por bloco)

- `A5` → Tipo &nbsp;•&nbsp; `B7` → Comprimento (m)
- `B9`/`B10` → Latitude/Longitude Inicial &nbsp;•&nbsp; `G9`/`G10` → Latitude/Longitude Final
- `A19` → Foto 1 (Panorâmica) &nbsp;•&nbsp; `E19` → Foto 2 (Detalhe) — proporção fixa **8,86 × 5**
- Complementares: KM inicial/final, identificação (Rodovia – Sentido), data da inspeção e
  "X" no checkbox do diagnóstico (OK / Reparar / Limpeza / Implantar).

> **Nota técnica:** a exportação usa **ExcelJS** em vez de SheetJS. A versão gratuita do
> SheetJS não insere imagens nem preserva a formatação do template ao regravar o arquivo —
> o ExcelJS faz as duas coisas e também roda 100% no navegador, via CDN cacheada.

## Publicação no GitHub Pages (decidido)

1. Crie um repositório no GitHub (pode ser privado? **não** — Pages gratuito exige
   repositório público; se precisar privado, use plano pago ou Azure Static Web Apps).
2. Envie **todos os arquivos desta pasta** para o repositório (raiz).
3. Em *Settings → Pages*, escolha *Deploy from a branch* → branch `main`, pasta `/ (root)`.
4. O app ficará em `https://SEU-USUARIO.github.io/NOME-DO-REPO/` — envie esse link aos
   inspetores, que devem abri-lo **uma vez com internet** e usar "Adicionar à tela inicial".
5. Para atualizar o app: basta subir os arquivos alterados; o Service Worker pega a
   versão nova no próximo acesso com internet (o `VERSAO_CACHE` do `sw.js` deve ser
   incrementado a cada publicação).

## Envio automático ao SharePoint (fotos e dados quando houver sinal)

O app envia cada inspeção (JSON + fotos JPEG) para uma pasta da biblioteca **Documentos**
do site do SharePoint, usando o login corporativo do inspetor (Microsoft Graph).
Funciona assim: com sinal, o app envia sozinho o que estiver pendente (após o primeiro
login); cada inspeção mostra "☁✔ enviada" ou "⏳ no celular".

**Ativação (uma vez, pelo TI):**

1. No portal Azure (`portal.azure.com` → *Microsoft Entra ID* → *App registrations* →
   *New registration*):
   - Nome: `Inspecao Drenagem PWA`
   - Tipos de conta: *Somente este diretório organizacional*
   - Redirect URI: tipo **SPA (Single-page application)** com a URL do GitHub Pages
     (ex.: `https://SEU-USUARIO.github.io/NOME-DO-REPO/`)
2. Em *API permissions*: adicionar **Microsoft Graph → Delegated → `Sites.ReadWrite.All`**
   e clicar em *Grant admin consent*.
3. Copiar o **Application (client) ID** e o **Directory (tenant) ID**.
4. No `app.js`, preencher o bloco `CONFIG_ENVIO` (início da seção "Envio online"):
   `clientId`, `tenantId`, `sitePath` (caminho do site, ex.: `/sites/Conservacao`) e
   `pastaDestino` (pasta na biblioteca Documentos).
5. Republicar. O botão "Enviar pendentes ao SharePoint" aparece automaticamente.

Sem essa configuração o app funciona normalmente — apenas sem o envio em nuvem
(os relatórios Excel/PDF continuam saindo direto no celular).

## Publicação no SharePoint — atenção

O SharePoint moderno **força o download de arquivos `.html`** em vez de abri-los no
navegador, e pode não servir o `sw.js` com o tipo correto. Antes de distribuir aos
inspetores, teste o link direto do `index.html` no celular. Se ele baixar em vez de abrir:

1. **Opção recomendada:** publicar a pasta em um host estático simples
   (Azure Static Web Apps, GitHub Pages ou o recurso "Site Pages" do SharePoint com
   permissão de scripts habilitada pelo administrador do tenant).
2. **Alternativa clássica:** renomear `index.html` para `index.aspx` (funciona em tenants
   com *custom scripts* habilitado). Os caminhos relativos continuam funcionando.
3. O Service Worker exige **HTTPS** (o SharePoint já usa) e que `sw.js` esteja na mesma
   pasta do `index.html`.

Mesmo que o Service Worker seja bloqueado pelo servidor, o app ainda funciona offline
para os **dados** (IndexedDB), mas a página em si precisará de rede para abrir —
por isso vale confirmar o item acima.

## Base de dados (CSV)

Colunas esperadas (cabeçalho da primeira linha, exatamente):
`Rodovia`, `Sentido`, `Tipo`, `Km Inicial`, `Km Final`, `Comprimento (m)`,
`Latitude Inicial`, `Longitude Inicial`, `Latitude Final`, `Longitude Final`.

> ⚠️ O arquivo `00 - Consolidado - Projetos Cadastro.csv` presente nesta pasta contém
> **dados de exemplo** usados durante o desenvolvimento. **Substitua-o pelo CSV real**
> antes de publicar.

- Separador `;` ou `,` (detectado automaticamente) e codificação UTF-8 ou ANSI/Windows-1252.
- Para atualizar a base: substitua o CSV na pasta e toque em **"Atualizar base de dados"**
  no app (com internet).
