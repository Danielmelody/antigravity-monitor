function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatCountdown(ms) {
  if (!Number.isFinite(ms)) return "—";
  if (ms <= 0) return "Resetting…";
  const totalSec = Math.floor(ms / 1000);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const h = Math.floor(totalMin / 60);
  if (h > 99) return `${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export function formatClock(msUntil) {
  if (!Number.isFinite(msUntil) || msUntil < 0) return "--:--";
  const totalSec = Math.ceil(msUntil / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

export function formatLocalDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function tierBadgeEl(tier) {
  const span = document.createElement("span");
  span.className =
    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide";
  const dot = document.createElement("span");
  dot.className = "h-1.5 w-1.5 rounded-full";
  const label = document.createElement("span");
  label.textContent = (tier || "unknown").toUpperCase();

  if (tier === "ultra") {
    span.classList.add("border-ag-cyan/40", "bg-ag-cyan/10", "text-ag-cyan");
    dot.classList.add("bg-ag-cyan");
  } else if (tier === "pro") {
    span.classList.add("border-ag-neon/40", "bg-ag-neon/10", "text-[#B9A8FF]");
    dot.classList.add("bg-ag-neon");
  } else if (tier === "free") {
    span.classList.add("border-white/15", "bg-white/5", "text-ag-text");
    dot.classList.add("bg-ag-muted");
  } else {
    span.classList.add("border-ag-amber/35", "bg-ag-amber/10", "text-ag-amber");
    dot.classList.add("bg-ag-amber");
  }

  span.append(dot, label);
  return span;
}

function remainingColor(pct) {
  if (!Number.isFinite(pct)) return "from-white/20 to-white/5";
  if (pct <= 10) return "from-ag-red/90 to-ag-amber/60";
  if (pct <= 30) return "from-ag-amber/85 to-ag-neon/55";
  return "from-ag-neon/80 to-ag-cyan/75";
}

export function buildQuotaRow({ modelId, label, family, remainingPct, resetIso } = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "rounded-2xl border border-white/10 bg-white/5 p-4";

  const top = document.createElement("div");
  top.className = "flex flex-wrap items-center justify-between gap-3";

  const left = document.createElement("div");
  const name = document.createElement("p");
  name.className = "text-sm font-semibold text-ag-text";
  name.textContent = label || modelId || "Unknown model";

  const sub = document.createElement("p");
  sub.className = "mt-1 font-mono text-[11px] text-ag-muted";
  sub.textContent = modelId || "—";

  left.append(name, sub);

  const right = document.createElement("div");
  right.className = "flex items-center gap-2";

  const tag = document.createElement("span");
  tag.className =
    "inline-flex items-center rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-semibold tracking-wide text-ag-muted";
  tag.textContent = family || "MODEL";

  const pct = document.createElement("span");
  pct.className = "font-mono text-xs text-ag-text";
  pct.textContent = Number.isFinite(remainingPct) ? `${Math.round(remainingPct)}%` : "—";

  right.append(tag, pct);
  top.append(left, right);

  const barOuter = document.createElement("div");
  barOuter.className = "mt-3 h-2.5 overflow-hidden rounded-full bg-black/30 ring-1 ring-white/5";
  const barInner = document.createElement("div");
  const safePct = Number.isFinite(remainingPct) ? Math.max(0, Math.min(100, remainingPct)) : 0;
  barInner.className = `h-full rounded-full bg-gradient-to-r ${remainingColor(safePct)}`;
  barInner.style.width = `${safePct}%`;
  barOuter.append(barInner);

  const bottom = document.createElement("div");
  bottom.className = "mt-3 flex flex-wrap items-center justify-between gap-2";

  const reset = document.createElement("p");
  reset.className = "text-xs text-ag-muted";
  reset.innerHTML = `Reset at <span class="font-mono text-[11px] text-ag-text">${formatLocalDateTime(resetIso)}</span>`;

  const countdown = document.createElement("p");
  countdown.className = "text-xs text-ag-muted";
  countdown.innerHTML = `Resets in <span class="font-mono text-[11px] text-ag-text" data-reset-countdown="1">${formatCountdown(
    Date.parse(resetIso) - Date.now(),
  )}</span>`;

  bottom.append(reset, countdown);

  wrapper.append(top, barOuter, bottom);
  wrapper.dataset.modelId = modelId || "";
  wrapper.dataset.resetIso = resetIso || "";
  return wrapper;
}

export function updateCountdowns(rootEl) {
  const els = rootEl.querySelectorAll("[data-reset-countdown]");
  for (const span of els) {
    const card = span.closest("[data-model-id]") || span.closest("[data-modelid]");
    const resetIso = card?.dataset?.resetIso;
    if (!resetIso) continue;
    const ms = Date.parse(resetIso) - Date.now();
    span.textContent = formatCountdown(ms);
  }
}

