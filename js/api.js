import { loadSettings } from "./storage.js";

const PRIMARY_HOST = "https://cloudcode-pa.googleapis.com";
const DAILY_HOST = "https://daily-cloudcode-pa.googleapis.com";

// From BRIEF.md.
const AG_USER_AGENT = "antigravity/1.16.5";
const X_GOOG_API_CLIENT = "google-cloud-sdk vscode_cloudshelleditor/0.1";
const CLIENT_METADATA_OBJ = {
  ideType: "IDE_UNSPECIFIED",
  platform: "PLATFORM_UNSPECIFIED",
  pluginType: "GEMINI",
};

function buildHeaders(accessToken) {
  const h = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Goog-Api-Client": X_GOOG_API_CLIENT,
    "Client-Metadata": JSON.stringify(CLIENT_METADATA_OBJ),
  };

  // IMPORTANT: Browsers generally forbid overriding the real User-Agent header.
  // Including it here is best-effort; user agents may silently drop it.
  try {
    h["User-Agent"] = AG_USER_AGENT;
  } catch {
    // ignore
  }

  return h;
}

async function postJson(url, { headers, body, timeoutMs = 12000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
      signal: ctrl.signal,
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    if (!res.ok) {
      const msg =
        (json && (json.error?.message || json.error?.status)) ||
        text?.slice(0, 200) ||
        `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.body = json || text;
      throw err;
    }
    return json;
  } finally {
    clearTimeout(t);
  }
}

function chooseHosts() {
  const { hostMode } = loadSettings();
  if (hostMode === "primary") return [PRIMARY_HOST];
  if (hostMode === "daily") return [DAILY_HOST];
  return [PRIMARY_HOST, DAILY_HOST];
}

async function postCloudCode(path, { accessToken, body } = {}) {
  const hosts = chooseHosts();
  const headers = buildHeaders(accessToken);
  let lastErr = null;

  for (const host of hosts) {
    try {
      const json = await postJson(`${host}${path}`, { headers, body });
      return { json, host };
    } catch (e) {
      lastErr = e;
      // Try the next host for network errors or 5xx.
      const status = e?.status;
      if (status && status < 500) break;
    }
  }

  throw lastErr || new Error("Request failed");
}

export async function fetchSubscriptionTier({ accessToken } = {}) {
  const settings = loadSettings();
  const body = {
    metadata: {
      ...CLIENT_METADATA_OBJ,
      duetProject: settings.duetProject || "rising-fact-p41fc",
    },
  };

  const { json, host } = await postCloudCode("/v1internal:loadCodeAssist", {
    accessToken,
    body,
  });

  // Heuristic parsing: the reverse-engineered response shape may change.
  const paidTierId =
    json?.paidTier?.id ||
    json?.codeAssistTier?.paidTier?.id ||
    json?.tier?.id ||
    "";
  const paidTierIdLower = String(paidTierId).toLowerCase();
  let tier = "unknown";
  if (paidTierIdLower.includes("ultra")) tier = "ultra";
  else if (paidTierIdLower.includes("pro") || paidTierIdLower.includes("premium")) tier = "pro";
  else if (paidTierIdLower.includes("free")) tier = "free";

  const projectId =
    json?.projectId ||
    json?.duetProjectId ||
    json?.project ||
    json?.metadata?.duetProject ||
    null;

  return { tier, paidTierId: paidTierId || null, projectId, raw: json, host };
}

export async function fetchAvailableModels({ accessToken, project } = {}) {
  const body = {};
  if (project) body.project = project;

  const { json, host } = await postCloudCode("/v1internal:fetchAvailableModels", {
    accessToken,
    body,
  });

  const models = json?.models || {};
  return { models, raw: json, host };
}

export async function fetchUserInfo({ accessToken } = {}) {
  // Standard OpenID Connect userinfo. Works when scopes include openid/email/profile.
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error_description || json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

