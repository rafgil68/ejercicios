const CACHE_NAME = 'isometrix2-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Isometrix.png',
  './trofeo.png',
  './calentamiento/mov_hombro.png',
  './calentamiento/mov_espalda.png',
  './calentamiento/cadera.png',
  './calentamiento/sentadilla_sin.png',
  './calentamiento/Buenos_dias.png',
  './calentamiento/bird_dog.png',
  './calentamiento/puente.png',
  './estiramiento/esfinge.jpg',
  './calentamiento/sentadilla_sin.jpg',
  './calentamiento/goblet.png',
  './isometricos/sentadilla_iso.png',
  './isometricos/plancha.png',
  './isometricos/zancada.png',
  './fuerza/flexion.jpg',
  './fuerza/peso_muerto_convencional.png',
  './fuerza/press_militar.png',
  './fuerza/remo.png',
  './fuerza/pajaro.png',
  './fuerza/sentadilla_barra.png',
  './fuerza/sentadilla_frontal.png',
  './fuerza/peso_muerto_convencional.png',
  './fuerza/hip_thrust.png',
  './fuerza/curl_femoral_polea.png',
  './abduccion_cadera_polea.png',
  './fuerza/press_banca.png',
  './fuerza/press_inclinado.png',
  './fuerza/aperturas_polea.png',
  './fuerza/flexiones.png',
  './fuerza/dominadas.png',
  './fuerza/jalon_pecho.png',
  './fuerza/remo_barra.png',
  './fuerza/remo_polea.png',
  './fuerza/pullover_polea.png',
  './fuerza/elevaciones_laterales.png',
  './fuerza/face_pull.png',
  './fuerza/curl_biceps_barra.png',
  './fuerza/curl_martillo.png',
  './fuerza/triceps_polea.png',
  './fuerza/triceps_sobre_cabeza.png',
  './fuerza/rueda_abdominal.png',
  './fuerza/pallof_press.png'
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
