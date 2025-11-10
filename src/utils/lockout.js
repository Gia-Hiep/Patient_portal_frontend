// 3 lần sai -> khoá 60s. Lưu theo "identifier" (email/phone/username)
const KEY = 'login_lockout_v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
function save(m) { localStorage.setItem(KEY, JSON.stringify(m)); }

export function getLockState(identifier) {
  const map = load();
  const e = map[identifier];
  if (!e) return { locked: false, remaining: 0, count: 0 };
  const now = Date.now();
  if (e.lockUntil && now < e.lockUntil) {
    return { locked: true, remaining: Math.ceil((e.lockUntil - now) / 1000), count: e.count || 0 };
  }
  return { locked: false, remaining: 0, count: e.count || 0 };
}

export function registerFailure(identifier) {
  const map = load();
  const e = map[identifier] || { count: 0 };
  e.count += 1;
  if (e.count >= 3) {
    e.lockUntil = Date.now() + 60_000; // 60s
    e.count = 0;
  }
  map[identifier] = e;
  save(map);
}

export function resetFailures(identifier) {
  const map = load();
  delete map[identifier];
  save(map);
}
