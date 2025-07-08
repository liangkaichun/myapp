const CACHE_NAME = 'radio-fm-cache-v1';
const ASSETS_TO_CACHE = [
    '/mtapp/RadioFM.html',
    '/myapp/manifest.json',
    '/myapp/logo.svg'
];

// 安装阶段：缓存核心资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

//  fetch事件：从缓存提供资源
self.addEventListener('fetch', (event) => {
    // 跳过非GET请求和跨域请求
    if (event.request.method !== 'GET' || event.request.url.startsWith('http://') || event.request.url.startsWith('https://')) {
        return fetch(event.request);
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 缓存命中则返回缓存资源
                if (response) {
                    return response;
                }
                // 缓存未命中则从网络获取
                return fetch(event.request);
            })
    );
});
