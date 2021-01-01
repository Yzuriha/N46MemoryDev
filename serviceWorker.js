const memoryGame = "memoryGame-v1"
const assets = [
  "/",
  "manifest.json",
  "index.html",
  "css/app.css",
  "js/app.js",
  "data/data.js",
  "data/assets/NogiText.png",
  "data/assets/logo.png",
  "data/assets/logo.svg",
  "data/assets/logoAnimated.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/hover.css/2.1.0/css/hover-min.css"
]

const test = [
  "data/images/asuka1.jpg"
]

// in the service worker
addEventListener('message', event => {
  // event is an ExtendableMessageEvent object
  // console.log(`The client sent me a message: ${event.data}`);
  var data = JSON.parse(event.data);
  var cardSet = [];

  // if(navigator.online){
  data.forEach(item => {
    item.img.forEach(img => {
      cardSet.push(`data/images/${img}`)
    })
  })
// }

  caches.open(memoryGame).then(cache => {
    cardSet.forEach((item, i) => {
      cache.add(item);
    });

  })
});

/* Start the service worker and cache all of the app's content */
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(memoryGame).then(cache => {
      cache.addAll(assets)
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
