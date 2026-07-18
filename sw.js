/* =====================================================================
 * Service Worker - Inspeção de Drenagem
 * Pré-cacheia o app shell + CSV + template XLSX + bibliotecas de CDN
 * no primeiro acesso, garantindo funcionamento 100% offline depois.
 * ===================================================================== */
'use strict';

const VERSAO_CACHE = 'drenagem-v31';

// Arquivos essenciais do app (mesma pasta no SharePoint)
const ARQUIVOS_APP = [
  './',
  './index.html',
  './manual.html',
  './app.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  encodeURI('./Caminhos da Celulose.svg')
];

// Dados que podem mudar (rede primeiro, cache como reserva)
const ARQUIVOS_DADOS = [
  encodeURI('./00 - Consolidado - Projetos Cadastro.csv'),
  encodeURI('./MODELO_Drenagem 1 (1).xlsx')
];

// Bibliotecas externas (CDN com CORS habilitado)
const ARQUIVOS_CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

const TODOS = [...ARQUIVOS_APP, ...ARQUIVOS_DADOS, ...ARQUIVOS_CDN];

// ---------- Instalação: pré-cache resiliente ----------
// Cada arquivo é adicionado individualmente: se um falhar (ex.: CSV ainda
// não publicado na pasta), o restante do app continua funcionando offline.
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(VERSAO_CACHE).then((cache) =>
      Promise.allSettled(
        TODOS.map((url) =>
          cache.add(url).catch((erro) => {
            console.warn('[SW] Falha ao pré-cachear:', url, erro.message);
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ---------- Ativação: remove caches de versões antigas ----------
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((chaves) =>
        Promise.all(
          chaves
            .filter((chave) => chave !== VERSAO_CACHE)
            .map((chave) => caches.delete(chave))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---------- Estratégias de fetch ----------
function ehArquivoDeDados(url) {
  return url.endsWith('.csv') || url.endsWith('.xlsx');
}

// Rede primeiro (dados sempre atualizados quando há sinal), cache como reserva
async function redePrimeiro(requisicao) {
  const cache = await caches.open(VERSAO_CACHE);
  try {
    const resposta = await fetch(requisicao);
    if (resposta && resposta.ok) {
      cache.put(requisicao, resposta.clone());
    }
    return resposta;
  } catch (erro) {
    const emCache = await cache.match(requisicao, { ignoreSearch: true });
    if (emCache) return emCache;
    throw erro;
  }
}

// Cache primeiro (app shell abre instantâneo), atualização em segundo plano
async function cachePrimeiro(requisicao) {
  const cache = await caches.open(VERSAO_CACHE);
  const emCache = await cache.match(requisicao, { ignoreSearch: true });

  const atualizar = fetch(requisicao)
    .then((resposta) => {
      if (resposta && resposta.ok) cache.put(requisicao, resposta.clone());
      return resposta;
    })
    .catch(() => null);

  return emCache || atualizar.then((r) => {
    if (r) return r;
    throw new Error('Offline e sem cache para: ' + requisicao.url);
  });
}

// Permite ao app perguntar qual versão está no ar
self.addEventListener('message', (evento) => {
  if (evento.data === 'versao' && evento.ports && evento.ports[0]) {
    evento.ports[0].postMessage(VERSAO_CACHE);
  }
  if (evento.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navegação: entrega o index.html do cache se a rede falhar
  if (req.mode === 'navigate') {
    evento.respondWith(
      redePrimeiro(req).catch(async () => {
        const cache = await caches.open(VERSAO_CACHE);
        return (await cache.match('./index.html')) || (await cache.match('./'));
      })
    );
    return;
  }

  if (ehArquivoDeDados(decodeURIComponent(url.pathname))) {
    evento.respondWith(redePrimeiro(req));
  } else {
    evento.respondWith(cachePrimeiro(req));
  }
});
