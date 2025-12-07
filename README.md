# 🔥 **Cloudflare Workers Load Balancing & Failover**

### Fitur
✔ Load Balancer optimal
✔ Hemat request
✔ Deterministic routing (hash IP)
✔ Cache-first
✔ Failover otomatis (multi-attempt + fallback worker)
✔ Tetap ringan dan cepat
---

# 🔥 **Kenapa script ini optimal?**

### ✔ 1. Cache-first → hemat hingga 95% hit ke Worker target

Jika response sudah pernah diminta → LB menjawab sendiri → **0 hit** ke target workers.

---

### ✔ 2. Routing stabil (IP Hash)

Orang yang sama selalu masuk Worker yang sama → cache lebih efektif.

---

### ✔ 3. Failover otomatis

Jika Worker A down → otomatis pindah ke B → lalu C → dst.

Dengan retry 2× per Worker, totalnya sangat tahan banting.

---

### ✔ 4. Tidak ada overhead random load balancing

Round-robin membuat cache tidak optimal.
IP hash → deterministic, cepat, dan konsisten.

---

### ✔ 5. Tidak ada double-chaining

Hanya LB → target.
Bukan LB → LB → target.

---
Lisensi MIT
[Donasi via Saweria](https://saweria.co/hendynoize)

