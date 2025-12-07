const TARGETS = [
  "https://worker-a.example.workers.dev",
  "https://worker-b.example.workers.dev",
  "https://worker-c.example.workers.dev",
];

const RETRY_ATTEMPTS = 2;


// =========================
// HELPERS
// =========================

// Hash untuk distribusi IP → Worker secara stabil
function hashIP(ip) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash * 31 + ip.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Forward request  dengan retry/failover
async function fetchWithFailover(urls, req) {
  for (const url of urls) {
    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        const res = await fetch(url, req);

        // Terima status OK, atau selain 500/502/503 (indikasi server mati)
        if (![500, 502, 503].includes(res.status)) {
          return res;
        }
      } catch (err) {
        // lanjut coba target berikutnya
      }
    }
  }

  return null;
}



// =========================
// MAIN WORKER
// =========================

export default {
  async fetch(request, env, ctx) {

    const cache = caches.default;

    // ======================================
    // 1. CEK CACHE DULU (hemat request)
    // ======================================
    const cached = await cache.match(request);
    if (cached) return cached;


    // ======================================
    // 2. TENTUKAN TARGET BERDASARKAN HASH IP
    // ======================================
    const clientIP = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
    const index = hashIP(clientIP) % TARGETS.length;

    // Urutan prioritas failover:
    // 1. target utama berdasarkan hash
    // 2. worker lain sebagai backup
    const orderedTargets = [
      TARGETS[index],
      ...TARGETS.filter((_, i) => i !== index)
    ];

    // Buat URL forward
    const url = new URL(request.url);
    const req = {
      method: request.method,
      headers: request.headers,
      body: request.body,
    };

    // Bentuk daftar final URL tujuan
    const forwardURLs = orderedTargets.map(base => base + url.pathname + url.search);


    // ======================================
    // 3. FORWARD DENGAN FAILOVER OTOMATIS
    // ======================================
    const response = await fetchWithFailover(forwardURLs, req);

    if (!response) {
      return new Response("All backend workers unavailable.", { status: 503 });
    }


    // ======================================
    // 4. CACHE RESPONSE JIKA LAYAK
    // ======================================
    if (request.method === "GET" && response.status === 200) {
      ctx.waitUntil(cache.put(request, response.clone()));
    }

    return response;
  }
};
