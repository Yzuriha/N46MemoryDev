const memoryGame = "memoryGame-v1"
const assets = [
  // "/",
  "manifest.json",
  "index.html",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/hover.css/2.1.0/css/hover-min.css"
]

// in the service worker
addEventListener('message', event => {
  // event is an ExtendableMessageEvent object
  var data = JSON.parse(event.data);
  var cardSet = [];

  data.forEach(item => {
    item.img.forEach(img => {
      cardSet.push(`data/images/${img}`)
    })
  })


  var extraAssets = ["css/app.css",
    "js/app.js",
    "data/data.js",
    "data/assets/NogiText.png",
    "data/assets/logo.png",
    "data/assets/logo.svg",
    "data/assets/logoAnimated.svg"]
  var newCardSet = cardSet.concat(extraAssets);

  caches.open(memoryGame).then(cache => {
    newCardSet.forEach((item, i) => {
      cache.add(item);
    });

  })
});

/* Start the service worker and cache all of the app's content */
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(memoryGame).then(cache => {
      // cache.addAll(assets)
      assets.forEach((item, i) => {
        cache.add(item);
      });
    })
  )
})

/* Serve cached content when offline */
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
