const CACHE_NAME = "botinas-v11";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/home.html",
  "/css/index.css",
  "/css/style.css",
  "/img/logo.png",
  "/img/icon.jpg",
  "/vendedores.html",
  "/clientes.html",
  "/novo-cliente.html",
  "/cliente-ficha.html",
  "/novo-pedido.html",
  "/carrinho-vendedores.html",
  "/finalizacao-pedido.html",
  "/historico-pedidos.html",
  "/rota.html",
  "/js/vendedor-db.js"
];

// 🔥 INSTALAÇÃO
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 🔥 ATIVAÇÃO
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// 🔥 FETCH
self.addEventListener("fetch", event => {
  const req = event.request;

  // HTML -> sempre tenta online primeiro
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // imagens -> cache first
  if (req.destination === "image") {
    event.respondWith(
      caches.match(req).then(cacheRes => {
        return (
          cacheRes ||
          fetch(req).then(fetchRes => {
            const copy = fetchRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
            return fetchRes;
          })
        );
      })
    );
    return;
  }

  // css/js -> stale while revalidate
  event.respondWith(
    caches.match(req).then(cacheRes => {
      const fetchPromise = fetch(req).then(fetchRes => {
        const copy = fetchRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return fetchRes;
      });

      return cacheRes || fetchPromise;
    })
  );
});