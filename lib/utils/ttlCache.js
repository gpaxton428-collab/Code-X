// Minimal TTL cache with the get/set/del/flushAll interface Baileys expects
// for msgRetryCounterCache. Replaces the node-cache package to keep installs light.
export class TtlCache {
  constructor(ttlSeconds = 300, maxKeys = 5000) { this.ttl = ttlSeconds * 1000; this.max = maxKeys; this.map = new Map(); }
  get(key) {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (e.exp < Date.now()) { this.map.delete(key); return undefined; }
    return e.value;
  }
  set(key, value) {
    if (this.map.size >= this.max) this.map.delete(this.map.keys().next().value);
    this.map.set(key, { value, exp: Date.now() + this.ttl });
    return true;
  }
  del(key) { return this.map.delete(key) ? 1 : 0; }
  flushAll() { this.map.clear(); }
}
