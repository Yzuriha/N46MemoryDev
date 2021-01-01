let cacheName = "memoryGame-v1";

let filesToCache = [
  "/N46Memory/",
  "service-worker.js",
  "js/app.js",
  "js/install-handler.js",
  "js/settings.js",
  "js/data.js",
  "css/app.css",
  "assets/icons/icon.png",
  "assets/icons/NogiText.png",
  "assets/icons/logo.png",
  "assets/icons/logo.svg",
  "assets/icons/logoAnimated.svg",
  "manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/hover.css/2.1.0/css/hover-min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"
  // add your assets here
  // ❗️❕donot add config.json here ❗️❕
];


// in the service worker
addEventListener('message', event => {
  // event is an ExtendableMessageEvent object
  var data = JSON.parse(event.data);
  var cardSet = [];

  data.forEach(item => {
    item.img.forEach(img => {
      cardSet.push(`assets/images/${img}`)
    })
  })

  caches.open(cacheName).then(cache => {
    cardSet.forEach((item, i) => {
      cache.add(item);
    });

  })
});

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(cacheName).then((cache) => {
    console.log('installed successfully')
    return cache.addAll(filesToCache);
  }));
});

self.addEventListener('fetch', function (event) {

  if (event.request.url.includes('clean-cache')) {
    caches.delete(cacheName);
    console.log('Cache cleared')
  }

  event.respondWith(caches.match(event.request).then(function (response) {
    if (response) {
      console.log('served form cache')
    } else {
      console.log('Not serving from cache ', event.request.url)
    }
    return response || fetch(event.request);
  })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName) {
          console.log('service worker: Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});
