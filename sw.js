// sw.js — Service Worker
// 更新版本號可強制讓所有裝置重新下載最新資源
const CACHE_NAME = 'character-gen-v1';

// 初次安裝時快取的靜態資源清單
// 若日後新增圖示或字型，記得加到這裡
const PRECACHE_URLS = [
  './index.html',
  './character-app.js',
  './character-data.js',
  './manifest.json',
  // 字型
  './assets/fonts/Iansui-Regular.woff2',
  // UI 圖示
  './assets/icons/hair_color.png',
  './assets/icons/hair_length.png',
  './assets/icons/hair_shape.png',
  './assets/icons/bangs.png',
  './assets/icons/eye_color.png',
  './assets/icons/eye_type.png',
  './assets/icons/skin.png',
  './assets/icons/hairdye.png',
  './assets/icons/tattoo.png',
  './assets/icons/mole.png',
  './assets/icons/heterochromia.png',
  './assets/icons/scar.png',
  './assets/icons/freckles.png',
  './assets/icons/fang.png',
  './assets/icons/marking.png',
  './assets/icons/pupil.png',
  './assets/icons/horn.png',
  './assets/icons/beast_ears.png',
  './assets/icons/tail.png',
  './assets/icons/wings.png',
  './assets/icons/glow.png',
  './assets/icons/accessory.png',
  './assets/icons/beard.png',
  './assets/icons/lock.png',
  './assets/icons/unlock.png',
  './assets/icons/pin.png',
  './assets/icons/copy.png',
  './assets/icons/dice.png',
  './assets/icons/special.png',
  './assets/icons/success.png',
  './assets/icons/warning.png',
  './assets/icons/garbage.png',
  // App 圖示
  './assets/icons/cover-192.png',
  './assets/icons/cover-512.png',
];

// ===== Install：預先快取所有靜態資源 =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      // 跳過等待，立即接管頁面
      return self.skipWaiting();
    })
  );
});

// ===== Activate：清除舊版快取 =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => {
      // 立即控制所有 client
      return self.clients.claim();
    })
  );
});

// ===== Fetch：Cache First 策略 =====
// 本地資源優先從快取取，沒有才去網路；
// Google Fonts 等外部資源則 Network First，斷網時降級到快取。
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 外部請求（Google Fonts 等）：Network First
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 成功取得就順手存入快取
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 本地資源：Cache First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      // 快取沒有（新資源）→ 去網路取並存入快取
      return fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
