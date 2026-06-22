const CACHE_NAME = 'chokhona-v1';
const RUNTIME_CACHE = 'chokhona-runtime-v1';
const OFFLINE_PAGE = '/offline.html';

// Файлы для кэширования при установке
const CRITICAL_ASSETS = [
  '/',
  '/css/style.css',
  '/js/app.js',
  '/offline.html',
  '/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker установлен');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Кэширование критических ресурсов');
      return cache.addAll(CRITICAL_ASSETS);
    })
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker активирован');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Игнорировать не-GET запросы
  if (request.method !== 'GET') {
    return;
  }

  // Игнорировать запросы к JSONBin API (они требуют интернета)
  if (url.hostname.includes('jsonbin.io')) {
    return;
  }

  // Для API запросов - Network First
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/add-') || 
      url.pathname.startsWith('/remove-')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Для статических ассетов - Cache First
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      url.pathname.includes('.css') ||
      url.pathname.includes('.js') ||
      url.pathname.includes('.png') ||
      url.pathname.includes('.jpg') ||
      url.pathname.includes('.svg')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Для остальных запросов (HTML и динамический контент) - Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Стратегия: Cache First (для статических ассетов)
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cacheCopy = response.clone();
      cache.add(cacheCopy);
    }
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    return createErrorResponse('Ресурс недоступен');
  }
}

// Стратегия: Network First (для API запросов)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      const cacheCopy = response.clone();
      cache.put(request, cacheCopy);
    }
    return response;
  } catch (error) {
    console.error('Network error:', error);
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return createErrorResponse('Нет доступа к интернету. Изменения будут синхронизированы при восстановлении связи.');
  }
}

// Стратегия: Stale While Revalidate (для динамического контента)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cacheCopy = response.clone();
      cache.put(request, cacheCopy);
    }
    return response;
  });

  return cached || fetchPromise.catch(() => {
    return createErrorResponse('Страница недоступна. Пожалуйста, проверьте интернет соединение.');
  });
}

// Создание ошибки в HTML формате
function createErrorResponse(message) {
  return new Response(
    `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Ошибка</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
            color: #333;
        }
        .error-container {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 400px;
        }
        .error-icon { font-size: 48px; margin-bottom: 10px; }
        h1 { margin: 0 0 10px 0; font-size: 24px; }
        p { margin: 0; color: #666; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">📡</div>
        <h1>Нет соединения</h1>
        <p>${message}</p>
    </div>
</body>
</html>`,
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }
  );
}

// Синхронизация данных при восстановлении связи
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    console.log('Синхронизация данных...');
    // Здесь можно добавить логику для синхронизации данных
    // когда приложение вернуло интернет соединение
  } catch (error) {
    console.error('Sync error:', error);
  }
}
