const KEY = "ag_monitor_settings_v1";
const TOKEN_KEY = "ag_monitor_token_v1";

export function loadSettings() {
  const defaults = {
    clientId: "",
    scopes: "openid email profile https://www.googleapis.com/auth/cloud-platform",
    duetProject: "rising-fact-p41fc",
    quotaProject: "",
    hostMode: "auto", // auto | primary | daily
    refreshIntervalSec: 30,
  };

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function loadToken() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw);
    if (!t || typeof t !== "object") return null;
    return t;
  } catch {
    return null;
  }
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

