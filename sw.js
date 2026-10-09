const CACHE_NAME = 'isometrix2-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Isometrix.png',
  './trofeo.png',
  './mov_hombro.png',
  './mov_espalda.png',
  './cadera.png',
  './sentadilla_sin.png',
  './Buenos_dias.png',
  './bird_dog.png',
  './esfinge.jpg',
  './puente.png',
  './plancha.jpg',
  './plancha_lat.jpg',
  './zancada.png',
  './sentadilla.jpg',
  './flexion.jpg',
  './hollow.png',
  './farmer.png',
  './goblet.png',
  './Press.png',
  './peso_muerto.png',
  './hombro.png',
  './remo.png',
  './pajaro.png',
  './step-down.png',
  './sentadilla_barra.png',
  './sentadilla_frontal.png',
  './peso_muerto_convencional.png',
  './hip_thrust.png',
  './curl_femoral_polea.png',
  './abduccion_cadera_polea.png',
  './press_banca.png',
  './press_inclinado.png',
  './aperturas_polea.png',
  './flexiones.png',
  './dominadas.png',
  './jalon_pecho.png',
  './remo_barra.png',
  './remo_polea.png',
  './pullover_polea.png',
  './elevaciones_laterales.png',
  './face_pull.png',
  './curl_biceps_barra.png',
  './curl_martillo.png',
  './triceps_polea.png',
  './triceps_sobre_cabeza.png',
  './rueda_abdominal.png',
  './pallof_press.png'
];

// Se cachea cada archivo por separado: si alguno no existe, el resto se guarda igualmente
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).catch(() => {})))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const esDocumento =
    req.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('manifest.json');

  if (esDocumento) {
    // Red primero (así las actualizaciones llegan solas); sin conexión, usa la copia guardada
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
  } else {
    // Imágenes: caché primero, y se guardan al verlas por primera vez
    event.respondWith(
      caches.match(req).then((r) => r || fetch(req).then((res) => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copia));
        }
        return res;
      }))
    );
  }
});
