// TəklifAl.az — Full-Stack Cloudflare D1 Reverse Marketplace Application
const D1_API_BASE = "https://avtolive-az.pages.dev";
window.AVTOLIVE_EMAIL_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzjah2m0XkTkiezeECwuPZwkMrajMhR-SBKbtMfWSTp8PnBY0TBBaYEYtnrARWomwzK/exec";

const state = {
  tab: "requests",
  requests: [],
  bids: [],
  masters: [],
  user: JSON.parse(localStorage.getItem("avtolive_user") || "null"),
  token: localStorage.getItem("avtolive_token") || "",
  uploadedPhotos: [],
  activeRequestId: null
};

let _galleryPhotos = [];
let _lbIndex = 0;

window.addEventListener("DOMContentLoaded", () => {
  initApp();
});

document.addEventListener("keydown", (e) => {
  const lb = document.getElementById("photoLightbox");
  if (lb && lb.classList.contains("open")) {
    if (e.key === "Escape") closePhotoLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
    return;
  }
  if (e.key === "Escape") {
    ["newRequestModal", "requestDetailModal", "authModal", "infoModal"].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.classList.contains("open")) closeModal(id);
    });
  }
});

async function initApp() {
  updateAuthUI();
  try {
    const headers = state.token ? { "Authorization": "Bearer " + state.token } : {};
    const res = await fetch(D1_API_BASE + "/api/init", { headers });
    if (res.ok) {
      const data = await res.json();
      state.requests = Array.isArray(data.requests) ? data.requests : [];
      state.bids = Array.isArray(data.bids) ? data.bids : [];
      state.masters = Array.isArray(data.masters) ? data.masters : [];
      if (data.user) {
        state.user = data.user;
        localStorage.setItem("avtolive_user", JSON.stringify(data.user));
      } else {
        state.user = null;
        state.token = "";
        localStorage.removeItem("avtolive_user");
        localStorage.removeItem("avtolive_token");
      }
    }
  } catch (e) {}
  updateAuthUI();
  renderAll();

  try {
    const params = new URLSearchParams(window.location.search);
    const sId = parseInt(params.get("sorgu"));
    if (sId && state.requests.some(r => r.id === sId)) {
      openRequestDetail(sId);
    }
  } catch (e) {}
}

function showToast(msg) {
  const box = document.getElementById("toastContainer");
  if (!box) return;
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), 3600);
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

function switchTab(tab) {
  state.tab = tab;
  window.scrollTo({ top: 0, behavior: "smooth" });
  ["Requests", "Masters", "Pricing", "Mine"].forEach(k => {
    const btn = document.getElementById("nav" + k);
    if (btn) btn.classList.toggle("active", k.toLowerCase() === tab);
  });

  const reqSec = document.getElementById("requestsSection");
  const masSec = document.getElementById("mastersSection");
  const priSec = document.getElementById("pricingSection");
  const filterSec = document.getElementById("filterPanel");

  if (tab === "masters") {
    reqSec.style.display = "none";
    filterSec.style.display = "none";
    masSec.style.display = "block";
    priSec.style.display = "none";
    renderMastersGrid();
  } else if (tab === "pricing") {
    reqSec.style.display = "none";
    filterSec.style.display = "none";
    masSec.style.display = "none";
    priSec.style.display = "block";
  } else {
    reqSec.style.display = "block";
    filterSec.style.display = "block";
    masSec.style.display = "none";
    priSec.style.display = "none";
    applyFilters();
  }
}

function quickSelectCategory(cat) {
  const sel = document.getElementById("fCategory");
  if (sel) sel.value = cat;
  document.querySelectorAll("#quickCatChips .cat-chip").forEach(btn => {
    btn.classList.toggle("active", (cat === "" && btn.textContent.includes("Hamısı")) || (cat !== "" && btn.getAttribute("onclick")?.includes(cat)));
  });
  switchTab("requests");
}

function resetFilters() {
  ["fCategory", "fCity", "fStatus", "fSearch"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  applyFilters();
}

function renderAll() {
  const openCount = state.requests.filter(r => r.status === "open").length;
  const badge = document.getElementById("activeRequestsBadge");
  if (badge) badge.textContent = `Aktiv sorğular: ${openCount}`;

  const reqNav = document.getElementById("reqCountNav");
  if (reqNav) reqNav.textContent = state.requests.length;

  const masNav = document.getElementById("mastersCountNav");
  if (masNav) masNav.textContent = state.masters.length;

  const mineCount = state.user ? state.requests.filter(r => r.user_id === state.user.id || r.accepted_master_id === state.user.id).length : 0;
  const mineNav = document.getElementById("mineCountNav");
  if (mineNav) mineNav.textContent = mineCount;

  applyFilters();
  renderMastersGrid();
}

function applyFilters() {
  const cat = (document.getElementById("fCategory")?.value || "").trim();
  const city = (document.getElementById("fCity")?.value || "").trim();
  const st = (document.getElementById("fStatus")?.value || "").trim();
  const q = (document.getElementById("fSearch")?.value || "").trim().toLowerCase();

  const list = state.requests.filter(r => {
    if (state.tab === "mine") {
      if (!state.user || (r.user_id !== state.user.id && r.accepted_master_id !== state.user.id)) return false;
    }
    if (cat && r.category !== cat) return false;
    if (city && r.city !== city) return false;
    if (st && r.status !== st) return false;
    if (q) {
      const hay = `${r.title} ${r.description} ${r.category} ${r.city} ${r.customer_name}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const cntEl = document.getElementById("resultsCount");
  if (cntEl) cntEl.textContent = list.length;
  renderRequestsGrid(list);
}

function renderRequestsGrid(list) {
  const grid = document.getElementById("requestsGrid");
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;text-align:center;">
        <h3 style="font-size:1.1rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Hazırda bu meyarlara uyğun sorğu yoxdur</h3>
        <p style="font-size:0.88rem;color:#64748b;margin-bottom:16px;">İlk təmir və ya servis sorğusunu pulsuz yaradaraq ustalardan qiymət təklifi alın.</p>
        <button type="button" class="btn-emerald" onclick="openNewRequestModal()">+ İlk Sorğunu Yarat (Pulsuz)</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(r => {
    const statusBadge = r.status === "open"
      ? `<span class="badge-status-open">● Təklif gözləyir</span>`
      : `<span class="badge-status-assigned">🔒 Usta seçildi (Yalnız sizə və ustaya görünür)</span>`;
    const isOwner = state.user && r.user_id === state.user.id;
    const reqBids = state.bids.filter(b => b.request_id === r.id);
    const minPrice = reqBids.length ? Math.min(...reqBids.map(b => b.price)) : 0;

    return `
      <div class="req-card" onclick="openRequestDetail(${r.id})">
        <div>
          <div class="req-top-badges" style="margin-bottom:10px;">
            <span class="badge-cat">${r.category}</span>
            ${statusBadge}
          </div>
          <div class="req-title" style="margin-bottom:6px;">${r.title}</div>
          <p class="req-desc">${r.description}</p>
        </div>

        <div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;font-size:0.78rem;color:#475569;">
            <span>📍 <strong>${r.city}</strong></span>
            <span>•</span>
            <span class="badge-urgent">${r.urgency}</span>
            ${r.budget > 0 ? `<span class="badge-cat">Büdcə: ~${r.budget} ₼</span>` : ""}
          </div>

          <div class="req-footer">
            <div>
              <strong style="color:#0f172a;">${r.customer_name}</strong>
              ${isOwner ? `<span style="color:#2563eb;font-weight:700;margin-left:4px;">(Sizin sorğunuz)</span>` : ""}
              <div style="font-size:0.74rem;">${(r.created_at || "").slice(0, 10)}</div>
            </div>
            <div class="offers-pill">
              ${reqBids.length} təklif ${minPrice > 0 ? `(ən aşağı ${minPrice} ₼)` : ""}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderMastersGrid() {
  const grid = document.getElementById("mastersGrid");
  if (!grid) return;

  if (!state.masters.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;text-align:center;">
        <h3 style="font-size:1.1rem;font-weight:800;color:#0f172a;margin-bottom:6px;">İlk Peşəkar Usta Kimi Qoşulun!</h3>
        <p style="font-size:0.88rem;color:#64748b;margin-bottom:16px;">Qeydiyyatdan keçən ustalara 10 ₼ başlanğıc bonus balans (5 pulsuz təklif haqqı) hədiyyə olunur.</p>
        <button type="button" class="btn-primary" onclick="openAuthModal('register')">+ Usta Hesabı Aç (+10 ₼ Bonus)</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.masters.map(m => {
    const initials = (m.full_name || "TA").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "TA";
    return `
      <div class="master-card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="master-avatar">${initials}</div>
            <div>
              <div style="font-weight:800;font-size:1rem;color:#0f172a;display:flex;align-items:center;gap:6px;">
                ${m.full_name}
                ${m.is_pro ? `<span class="pro-badge">PRO</span>` : ""}
              </div>
              <div style="font-size:0.8rem;color:#2563eb;font-weight:700;">${m.specialty || m.salon_name || "Peşəkar Usta"}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:900;color:#d97706;font-size:0.92rem;">★ ${(m.rating || 5.0).toFixed(1)}</div>
            <div style="font-size:0.74rem;color:#64748b;">${m.jobs_done || 0} tamamlanmış iş</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #f1f5f9;font-size:0.82rem;gap:8px;flex-wrap:wrap;">
          <span style="color:#475569;">🔒 +994 •• ••• •• ••</span>
          <button type="button" class="btn-secondary" onclick="openNewRequestModal()" style="padding:5px 10px;font-size:0.76rem;">Sorğu Yarat & Təklif Al</button>
        </div>
      </div>
    `;
  }).join("");
}

// ============================================================
// CREATE NEW SERVICE REQUEST + PHOTO UPLOAD
// ============================================================
function openNewRequestModal() {
  if (!state.user || !state.token) {
    showToast("Sorğu yaratmaq üçün əvvəlcə hesabınıza daxil olun");
    openAuthModal("login");
    return;
  }
  state.uploadedPhotos = [];
  const prev = document.getElementById("uploadedPhotosPreview");
  if (prev) prev.innerHTML = "";
  document.getElementById("newRequestModal").classList.add("open");
}

function handlePhotoFiles(files) {
  if (!files || !files.length) return;
  Array.from(files).slice(0, 5).forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 900;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        state.uploadedPhotos.push(canvas.toDataURL("image/jpeg", 0.78));
        renderPhotoPreviews();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotoPreviews() {
  const box = document.getElementById("uploadedPhotosPreview");
  if (!box) return;
  box.innerHTML = state.uploadedPhotos.map((src, idx) => `
    <div style="position:relative;width:68px;height:52px;">
      <img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;border:1px solid #cbd5e1;" />
      <button type="button" onclick="state.uploadedPhotos.splice(${idx},1);renderPhotoPreviews();" style="position:absolute;top:-5px;right:-5px;background:#dc2626;color:#fff;border:none;width:18px;height:18px;border-radius:999px;font-size:0.7rem;cursor:pointer;">✕</button>
    </div>
  `).join("");
}

async function submitServiceRequest(e) {
  e.preventDefault();
  if (!state.user || !state.token) {
    openAuthModal("login");
    return;
  }
  const payload = {
    category: document.getElementById("reqCategory").value,
    city: document.getElementById("reqCity").value,
    title: document.getElementById("reqTitle").value.trim(),
    urgency: document.getElementById("reqUrgency").value,
    budget: parseFloat(document.getElementById("reqBudget").value) || 0,
    description: document.getElementById("reqDesc").value.trim(),
    images: state.uploadedPhotos
  };
  try {
    const res = await fetch(`${D1_API_BASE}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${state.token}` },
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "Xəta baş verdi");
    state.requests = [d.request, ...state.requests];
    closeModal("newRequestModal");
    document.getElementById("reqTitle").value = "";
    document.getElementById("reqDesc").value = "";
    document.getElementById("reqBudget").value = "";
    renderAll();
    openRequestDetail(d.request.id);
    showToast("Sorğunuz dərc olundu! Ustalar qiymət təklifi göndərə bilər.");
  } catch (err) {
    showToast("Server xətası");
  }
}

// ============================================================
// REQUEST DETAIL & REVERSE BIDDING ENGINE
// ============================================================
async function openRequestDetail(reqId) {
  let req = state.requests.find(r => r.id === reqId);
  if (!req) return;
  state.activeRequestId = reqId;

  try {
    const headers = state.token ? { "Authorization": `Bearer ${state.token}` } : {};
    const res = await fetch(`${D1_API_BASE}/api/requests/${reqId}`, { headers });
    if (res.ok) {
      const d = await res.json();
      if (d.request) req = d.request;
      if (Array.isArray(d.bids)) {
        state.bids = [...state.bids.filter(b => b.request_id !== reqId), ...d.bids];
      }
    }
  } catch (e) {}

  document.getElementById("detailModalBadge").textContent = req.category;
  document.getElementById("detailModalTitle").textContent = `Sorğu № ${1000 + req.id}`;

  const reqBids = state.bids.filter(b => b.request_id === req.id).sort((a, b) => a.price - b.price);
  const isOwner = Boolean(state.user && state.user.id === req.user_id);
  _galleryPhotos = Array.isArray(req.images) ? req.images : [];

  const body = document.getElementById("requestDetailBody");
  body.innerHTML = `
    <div class="detail-2col">
      <!-- LEFT COLUMN: PROBLEM DETAILS & PHOTOS -->
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;">
          <h2 style="font-size:1.35rem;font-weight:800;color:#0f172a;">${req.title}</h2>
          <button type="button" class="btn-secondary" onclick="shareRequest(${req.id})" style="padding:6px 12px;font-size:0.78rem;">Paylaş</button>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span class="badge-cat">${req.category}</span>
          <span class="badge-urgent">${req.urgency}</span>
          <span class="badge-cat">📍 ${req.city}</span>
          ${req.budget > 0 ? `<span class="badge-status-open">Təxmini büdcə: ${req.budget} ₼</span>` : ""}
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px;">
          <div style="font-size:0.78rem;font-weight:800;color:#64748b;margin-bottom:6px;">PROBLEMİN ƏTRAFLI TƏSVİRİ:</div>
          <p style="font-size:0.93rem;color:#1e293b;line-height:1.65;white-space:pre-line;">${req.description}</p>
        </div>

        ${_galleryPhotos.length ? `
          <div>
            <div style="font-size:0.78rem;font-weight:800;color:#64748b;margin-bottom:6px;">ƏLAVƏ OLUNMUŞ ŞƏKİLLƏR (Tam ekran üçün klikləyin):</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              ${_galleryPhotos.map((img, i) => `
                <img src="${img}" onclick="openPhotoLightbox(${i})" style="width:120px;height:86px;object-fit:cover;border-radius:10px;cursor:zoom-in;border:1px solid #cbd5e1;" />
              `).join("")}
            </div>
          </div>
        ` : ""}

        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
          <div>
            <div style="font-size:0.76rem;color:#64748b;">Sifarişçi (Müştəri)</div>
            <strong style="font-size:0.94rem;color:#0f172a;">${req.customer_name} • ${req.city}</strong>
          </div>
          ${isOwner ? `
            <button type="button" class="btn-secondary" onclick="deleteMyRequest(${req.id})" style="color:#dc2626;border-color:#fecaca;padding:6px 12px;font-size:0.78rem;">
              Sorğunu Sil
            </button>
          ` : req.customer_phone.includes("••") ? `
            <span class="badge-cat" style="background:#f1f5f9;color:#475569;border-color:#cbd5e1;" title="Müştəri təklifinizi qəbul etdikdə nömrə açılır">
              🔒 ${req.customer_phone} (Qəbul edildikdə açılır)
            </span>
          ` : `
            <a href="tel:${req.customer_phone}" class="btn-emerald" style="text-decoration:none;padding:8px 14px;font-size:0.82rem;">
              📞 ${req.customer_phone}
            </a>
          `}
        </div>
      </div>

      <!-- RIGHT COLUMN: INCOMING BIDS & SUBMIT BID FORM -->
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3 style="font-size:1.02rem;font-weight:800;color:#0f172a;">Gələn Qiymət Təklifləri (${reqBids.length})</h3>
            <span style="font-size:0.76rem;color:#059669;font-weight:700;">Ən ucuzdan sıralanıb</span>
          </div>

          ${reqBids.length ? reqBids.map(b => `
            <div class="bid-card ${b.status === 'accepted' ? 'accepted' : ''}">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">
                <div>
                  <strong style="font-size:0.94rem;color:#0f172a;">${b.master_name}</strong>
                  <span style="font-size:0.75rem;color:#d97706;font-weight:800;margin-left:4px;">★ ${(b.master_rating || 5.0).toFixed(1)}</span>
                  <div style="font-size:0.76rem;color:#2563eb;font-weight:700;">${b.master_specialty}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:1.25rem;font-weight:900;color:#059669;">${b.price} ₼</div>
                  <div style="font-size:0.73rem;color:#475569;">⏱ ${b.eta}</div>
                </div>
              </div>
              <p style="font-size:0.83rem;color:#334155;margin-bottom:8px;">${b.comment}</p>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:0.76rem;">
                <span style="color:#059669;font-weight:700;">🛡 ${b.warranty}</span>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                  ${b.master_phone.includes("••") ? `
                    <span class="badge-cat" style="background:#f1f5f9;color:#475569;border-color:#cbd5e1;" title="Təklifi qəbul etdikdə ustanın nömrəsi açılır">
                      🔒 ${b.master_phone}
                    </span>
                  ` : `
                    <a href="tel:${b.master_phone}" class="btn-secondary" style="text-decoration:none;padding:4px 10px;font-size:0.75rem;">📞 ${b.master_phone}</a>
                  `}
                  ${isOwner && req.status === "open" ? `
                    <button type="button" class="btn-emerald" onclick="acceptMasterBid(${req.id}, ${b.id})" style="padding:5px 11px;font-size:0.76rem;">
                      Təklifi Qəbul Et
                    </button>
                  ` : ""}
                  ${b.status === "accepted" ? `<span class="badge-status-open">✔ Seçilmiş Usta</span>` : ""}
                </div>
              </div>
            </div>
          `).join("") : `
            <div style="padding:18px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:12px;text-align:center;color:#64748b;font-size:0.84rem;">
              Hələ qiymət təklifi göndərilməyib. İlk qiymət təklifini siz göndərin!
            </div>
          `}

          ${isOwner && req.status === "assigned" ? `
            <div style="margin-top:12px;padding:12px;background:#ecfdf5;border:1px solid #10b981;border-radius:12px;">
              <div style="font-size:0.78rem;color:#047857;font-weight:700;margin-bottom:6px;">
                🔒 Bu sorğu hazırda digər ustalardan gizlədilib — yalnız siz və seçdiyiniz usta görə bilir.
              </div>
              <strong style="font-size:0.86rem;color:#065f46;display:block;margin-bottom:8px;">Usta işi tamamladı? Təsdiqləyin (sorğu silinəcək):</strong>
              <div style="display:flex;gap:8px;">
                <select id="reviewRatingSelect" class="form-select" style="max-width:110px;">
                  <option value="5">★★★★★ (5)</option>
                  <option value="4">★★★★ (4)</option>
                  <option value="3">★★★ (3)</option>
                  <option value="2">★★ (2)</option>
                  <option value="1">★ (1)</option>
                </select>
                <button type="button" class="btn-emerald" onclick="completeAndRateRequest(${req.id})" style="flex:1;justify-content:center;">
                  Tamamdır — İşi Bitir və Sorğunu Sil
                </button>
              </div>
            </div>
          ` : ""}
        </div>

        ${!isOwner && req.status === "open" && (!state.user || state.user.role === "master") ? `
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:16px;">
            <h4 style="font-size:0.96rem;font-weight:800;color:#1e3a8a;margin-bottom:4px;">Usta Kimi Qiymət Təklifi Göndər</h4>
            <p style="font-size:0.77rem;color:#475569;margin-bottom:10px;">
              ${state.user?.is_pro ? "PRO Usta hesabınız aktivdir — Təklif göndərmək və qəbul edilmək 0 ₼!" : "Təklif göndərmək 0 ₼ (Pulsuzdur)! Yalnız müştəri sizin təklifinizi qəbul etdikdə balansınızdan 2 ₼ çıxılır."}
            </p>
            <form onsubmit="submitMasterBid(event, ${req.id})" style="display:flex;flex-direction:column;gap:10px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <input type="number" class="form-input" id="bidPrice" placeholder="Qiymət (AZN) *" required />
                <select class="form-select" id="bidEta">
                  <option value="30-60 dəqiqəyə gəlirəm">30-60 dəqiqəyə</option>
                  <option value="Bu gün gəlirəm">Bu gün gəlirəm</option>
                  <option value="Sabah gəlirəm">Sabah gəlirəm</option>
                </select>
              </div>
              <input type="text" class="form-input" id="bidWarranty" value="6 ay rəsmi zəmanət" placeholder="Zəmanət müddəti" />
              <textarea class="form-textarea" id="bidComment" rows="2" placeholder="Müştəriyə qeydiniz (məs: Ehtiyat hissələri məndə var, yerində təmir edirəm)..." required></textarea>
              <button type="submit" class="btn-primary" style="justify-content:center;">
                Qiymət Təklifini Göndər
              </button>
            </form>
          </div>
        ` : ""}
      </div>
    </div>
  `;

  document.getElementById("requestDetailModal").classList.add("open");
}

async function submitMasterBid(e, reqId) {
  e.preventDefault();
  if (!state.user || !state.token) {
    showToast("Təklif göndərmək üçün əvvəlcə hesabınıza daxil olun");
    openAuthModal("login");
    return;
  }
  const payload = {
    price: parseFloat(document.getElementById("bidPrice").value),
    eta: document.getElementById("bidEta").value,
    warranty: document.getElementById("bidWarranty").value.trim(),
    comment: document.getElementById("bidComment").value.trim()
  };
  try {
    const res = await fetch(`${D1_API_BASE}/api/requests/${reqId}/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${state.token}` },
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "Təklif göndərilə bilmədi");
    state.bids.push(d.bid);
    if (d.user) {
      state.user = d.user;
      localStorage.setItem("avtolive_user", JSON.stringify(d.user));
      updateAuthUI();
    }
    const rIdx = state.requests.findIndex(r => r.id === reqId);
    if (rIdx !== -1) state.requests[rIdx].offers_count = (state.requests[rIdx].offers_count || 0) + 1;
    renderAll();
    openRequestDetail(reqId);
    showToast("Qiymət təklifiniz müştəriyə göndərildi!");
  } catch (err) {
    showToast("Server xətası");
  }
}

async function acceptMasterBid(reqId, bidId) {
  if (!state.token) return;
  try {
    const res = await fetch(`${D1_API_BASE}/api/requests/${reqId}/accept-bid`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${state.token}` },
      body: JSON.stringify({ bid_id: bidId })
    });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "Xəta baş verdi");
    const rIdx = state.requests.findIndex(r => r.id === reqId);
    if (rIdx !== -1 && d.request) state.requests[rIdx] = d.request;
    renderAll();
    openRequestDetail(reqId);
    showToast("Usta təklifi qəbul edildi!");
  } catch (err) {
    showToast("Server xətası");
  }
}

async function completeAndRateRequest(reqId) {
  if (!state.token) return;
  const rating = parseInt(document.getElementById("reviewRatingSelect")?.value) || 5;
  try {
    const res = await fetch(`${D1_API_BASE}/api/requests/${reqId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${state.token}` },
      body: JSON.stringify({ rating, comment: "İş tamamlandı" })
    });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "Xəta baş verdi");
    state.requests = state.requests.filter(r => r.id !== reqId);
    state.bids = state.bids.filter(b => b.request_id !== reqId);
    closeModal("requestDetailModal");
    await initApp();
    showToast("İş tamamlandı, usta qiymətləndirildi və sorğu həmişəlik silindi!");
  } catch (err) {
    showToast("Server xətası");
  }
}

async function deleteMyRequest(reqId) {
  if (!state.token) return;
  try {
    const res = await fetch(`${D1_API_BASE}/api/requests/${reqId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${state.token}` }
    });
    if (!res.ok) return showToast("Silinə bilmədi");
    state.requests = state.requests.filter(r => r.id !== reqId);
    closeModal("requestDetailModal");
    renderAll();
    showToast("Sorğu silindi");
  } catch (e) {
    showToast("Server xətası");
  }
}

function shareRequest(reqId) {
  const url = `${window.location.origin}/?sorgu=${reqId}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => showToast("Sorğu linki kopyalandı: " + url));
  } else {
    showToast(url);
  }
}

async function upgradeToProMaster() {
  if (!state.user || !state.token) {
    showToast("PRO paket üçün əvvəlcə hesabınıza daxil olun");
    openAuthModal("login");
    return;
  }
  try {
    const res = await fetch(`${D1_API_BASE}/api/masters/upgrade-pro`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${state.token}` }
    });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "Aktivləşdirilə bilmədi");
    state.user = d.user;
    localStorage.setItem("avtolive_user", JSON.stringify(d.user));
    updateAuthUI();
    initApp();
    showToast("Təbriklər! PRO Usta abunəliyiniz aktivləşdirildi.");
  } catch (e) {
    showToast("Server xətası");
  }
}

// ============================================================
// AUTHENTICATION, REAL-TIME UNIQUENESS & PERSONAL CABINET
// ============================================================
function updateAuthUI() {
  const guestBtns = document.getElementById("guestAuthBtns");
  const profileBtn = document.getElementById("userProfileBtn");
  const btnText = document.getElementById("authBtnText");

  document.querySelectorAll(".top-auth-link").forEach(el => {
    el.style.display = state.user ? "none" : "inline-flex";
  });

  if (state.user) {
    if (guestBtns) guestBtns.style.display = "none";
    if (profileBtn) profileBtn.style.display = "inline-flex";
    const firstName = state.user.full_name.split(" ")[0];
    if (btnText) {
      btnText.textContent = state.user.role === "master"
        ? `Hesabım • ${firstName} (${state.user.balance ?? 0} ₼)`
        : `Hesabım • ${firstName}`;
    }
  } else {
    if (guestBtns) guestBtns.style.display = "inline-flex";
    if (profileBtn) profileBtn.style.display = "none";
  }
}

async function topUpMasterBalance(amount) {
  const val = parseFloat(amount) || parseFloat(document.getElementById("customTopupAmount")?.value) || 0;
  if (val < 2) return showToast("Minimum balans artırma məbləği 2 ₼-dir");
  try {
    const res = await fetch(`${D1_API_BASE}/api/masters/topup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${state.token}` },
      body: JSON.stringify({ amount: val })
    });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "Xəta baş verdi");
    state.user = d.user;
    localStorage.setItem("avtolive_user", JSON.stringify(d.user));
    updateAuthUI();
    openAuthModal();
    showToast(`Balansınız +${val} ₼ artırıldı!`);
  } catch (e) {
    showToast("Server xətası");
  }
}

function openAuthModal(defaultTab = "login") {
  const body = document.getElementById("authModalBody");
  if (state.user) {
    const isMaster = state.user.role === "master";
    const myReqs = state.requests.filter(r => r.user_id === state.user.id);
    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
        <div class="master-avatar">${state.user.avatar || "TA"}</div>
        <div>
          <div style="font-weight:800;font-size:1.02rem;color:#0f172a;display:flex;align-items:center;gap:6px;">
            ${state.user.full_name}
            <span class="badge-cat">${isMaster ? "Usta Hesabı" : "Müştəri Hesabı"}</span>
            ${isMaster && state.user.is_pro ? '<span class="pro-badge">PRO</span>' : ''}
          </div>
          <div style="font-size:0.8rem;color:#64748b;">${state.user.email} • ${state.user.phone}</div>
          ${isMaster ? `
            <div style="font-size:0.85rem;color:#059669;font-weight:800;margin-top:3px;">Usta Balansı: ${state.user.balance ?? 0} ₼</div>
          ` : `
            <div style="font-size:0.78rem;color:#059669;font-weight:700;margin-top:2px;">Sorğu yaratmaq və usta seçmək 100% pulsuzdur</div>
          `}
        </div>
      </div>

      ${isMaster ? `
        <div style="margin-bottom:14px;padding:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;">
          <div style="font-weight:800;font-size:0.84rem;color:#1e3a8a;margin-bottom:8px;">💳 Usta Balansını Artır</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;">
            <button type="button" class="btn-secondary" onclick="topUpMasterBalance(10)" style="justify-content:center;font-weight:800;">+10 ₼</button>
            <button type="button" class="btn-secondary" onclick="topUpMasterBalance(20)" style="justify-content:center;font-weight:800;">+20 ₼</button>
            <button type="button" class="btn-secondary" onclick="topUpMasterBalance(30)" style="justify-content:center;font-weight:800;">+30 ₼</button>
          </div>
          <div style="display:flex;gap:6px;">
            <input type="number" class="form-input" id="customTopupAmount" placeholder="Digər məbləğ (AZN)" min="2" max="500" />
            <button type="button" class="btn-primary" onclick="topUpMasterBalance()" style="white-space:nowrap;">Balansı Artır</button>
          </div>
        </div>
      ` : ""}

      <div style="margin-bottom:14px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="font-weight:800;font-size:0.84rem;color:#0f172a;margin-bottom:8px;">Profil Məlumatları</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px;">
          <input type="text" class="form-input" id="profNameInput" value="${state.user.full_name || ''}" placeholder="Ad və Soyad" />
          <input type="text" class="form-input" id="profPhoneInput" value="${state.user.phone || '+994 '}" placeholder="+994" />
          ${isMaster ? `
            <input type="text" class="form-input" id="profSpecialtyInput" value="${state.user.specialty || state.user.salon_name || ''}" placeholder="Usta İxtisasınız (məs: Kombi ustası, Elektrik)" />
          ` : ""}
        </div>
        <button type="button" class="btn-secondary" onclick="saveProfileChanges()" style="width:100%;justify-content:center;">Profili Yenilə</button>
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-weight:800;font-size:0.84rem;color:#0f172a;margin-bottom:6px;">Mənim Sorğularım (${myReqs.length})</div>
        <div style="max-height:150px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
          ${myReqs.length ? myReqs.map(r => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:0.8rem;">
              <span style="font-weight:700;color:#0f172a;cursor:pointer;" onclick="closeModal('authModal');openRequestDetail(${r.id});">${r.title}</span>
              <button type="button" class="btn-secondary" onclick="deleteMyRequest(${r.id});openAuthModal();" style="padding:3px 8px;font-size:0.72rem;color:#dc2626;border-color:#fecaca;">Sil</button>
            </div>
          `).join("") : '<div style="font-size:0.8rem;color:#64748b;">Hələ sorğunuz yoxdur.</div>'}
        </div>
      </div>

      <div style="display:flex;gap:8px;">
        <button type="button" class="btn-emerald" style="flex:1;justify-content:center;" onclick="closeModal('authModal');openNewRequestModal();">+ Yeni Sorğu Yarat</button>
        <button type="button" class="btn-secondary" onclick="logoutUser()">Çıxış</button>
      </div>
    `;
  } else {
    body.innerHTML = `
      <div class="condition-tabs" style="grid-template-columns:1fr 1fr;margin-bottom:16px;">
        <button type="button" class="cond-tab" id="authTab_login" onclick="switchAuthTab('login')">Daxil Ol</button>
        <button type="button" class="cond-tab" id="authTab_register" onclick="switchAuthTab('register')">Yeni Qeydiyyat</button>
      </div>

      <div id="authPane_login" style="display:none;">
        <p style="font-size:0.82rem;color:#64748b;margin-bottom:12px;">
          Qeydiyyatdan keçdiyiniz e-poçt ünvanı və ya telefon nömrənizlə daxil olun.
        </p>
        <form id="loginMainForm" onsubmit="handleLogin(event)" style="display:flex;flex-direction:column;gap:12px;">
          <input type="text" class="form-input" id="loginEmail" placeholder="E-poçt ünvanınız və ya +994 telefon nömrəniz" required />
          <input type="password" class="form-input" id="loginPass" placeholder="Parolunuz" required />
          <div style="text-align:right;">
            <button type="button" onclick="toggleForgotBox(true)" style="background:none;border:none;color:#2563eb;font-size:0.8rem;font-weight:600;cursor:pointer;">Şifrəni unutdum?</button>
          </div>
          <button type="submit" class="btn-primary" style="justify-content:center;">Hesaba Daxil Ol</button>
        </form>

        <div id="forgotPassBox" style="display:none;flex-direction:column;gap:10px;padding:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:0.88rem;color:#0f172a;">Şifrəni Bərpa Et</strong>
            <button type="button" onclick="toggleForgotBox(false)" style="background:none;border:none;color:#64748b;font-size:0.78rem;cursor:pointer;">Geri</button>
          </div>
          <div style="display:flex;gap:8px;">
            <input type="email" class="form-input" id="forgotEmail" placeholder="Qeydiyyatlı e-poçtunuz" />
            <button type="button" class="btn-secondary" id="btnForgotSend" onclick="handleForgotSendOtp()">Kod Göndər</button>
          </div>
          <div id="forgotStep2" style="display:none;flex-direction:column;gap:8px;">
            <input type="text" class="form-input" id="forgotOtpCode" placeholder="E-poçta gələn 4 rəqəmli kod" maxlength="6" />
            <input type="password" class="form-input" id="forgotNewPass" placeholder="Yeni parol (min. 6 simvol)" />
            <button type="button" class="btn-primary" onclick="handleForgotResetSubmit()" style="justify-content:center;">Yeni Parolu Təsdiqlə</button>
          </div>
        </div>
      </div>

      <div id="authPane_register" style="display:none;">
        <form id="regStep1Form" onsubmit="handleRegisterSendCode(event)" style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <select class="form-select" id="regRole" onchange="document.getElementById('regSpecialtyRow').style.display = this.value==='master' ? 'block' : 'none'">
              <option value="customer">Müştəriyəm (Usta axtarıram)</option>
              <option value="master">Ustayam (Sifariş qəbul edirəm)</option>
            </select>
            <input type="text" class="form-input" id="regName" placeholder="Ad və Soyad *" required />
          </div>
          <div id="regSpecialtyRow" style="display:none;">
            <input type="text" class="form-input" id="regSpecialty" placeholder="İxtisasınız (məs: Kombi və Kondisioner ustası)" />
          </div>
          <input type="email" class="form-input" id="regEmail" placeholder="E-poçt ünvanınız *" oninput="scheduleAvailabilityCheck()" required />
          <div class="field-hint" id="regEmailHint"></div>
          <input type="text" class="form-input" id="regPhone" value="+994 " placeholder="+994" oninput="scheduleAvailabilityCheck()" required />
          <div class="field-hint" id="regPhoneHint"></div>
          <input type="password" class="form-input" id="regPass" placeholder="Parol təyin edin (min. 6 simvol) *" required />
          <button type="submit" class="btn-primary" id="btnRegSendCode" style="justify-content:center;">Qeydiyyatı Tamamla</button>
        </form>
      </div>
    `;
    switchAuthTab(defaultTab === "register" ? "register" : "login");
  }
  document.getElementById("authModal").classList.add("open");
}

function switchAuthTab(mode) {
  ["login", "register"].forEach(m => {
    const t = document.getElementById("authTab_" + m);
    const p = document.getElementById("authPane_" + m);
    if (t) t.classList.toggle("active", m === mode);
    if (p) p.style.display = m === mode ? "block" : "none";
  });
}

let _availTimer = null;
let _availBlocked = { email: false, phone: false };

function scheduleAvailabilityCheck() {
  if (_availTimer) clearTimeout(_availTimer);
  _availTimer = setTimeout(() => runAvailabilityCheck(), 320);
}

async function runAvailabilityCheck() {
  const emailEl = document.getElementById("regEmail");
  const phoneEl = document.getElementById("regPhone");
  const eHint = document.getElementById("regEmailHint");
  const pHint = document.getElementById("regPhoneHint");
  const btn = document.getElementById("btnRegSendCode");
  if (!emailEl || !phoneEl) return true;

  const email = emailEl.value.trim().toLowerCase();
  const phone = phoneEl.value.trim();
  try {
    const res = await fetch(`${D1_API_BASE}/api/auth/check-availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone })
    });
    const d = await res.json();
    _availBlocked.email = Boolean(d.email_taken);
    _availBlocked.phone = Boolean(d.phone_taken);

    if (eHint) {
      eHint.textContent = d.email_taken ? "Bu e-poçt artıq qeydiyyatdan keçib. İkinci dəfə bu e-poçt ilə qeydiyyat mümkün deyil." : "";
      eHint.className = "field-hint " + (d.email_taken ? "error" : "");
      emailEl.classList.toggle("input-error", Boolean(d.email_taken));
    }
    if (pHint) {
      pHint.textContent = d.phone_taken ? "Bu telefon nömrəsi artıq qeydiyyatdan keçib. İkinci dəfə bu nömrə ilə qeydiyyat mümkün deyil." : "";
      pHint.className = "field-hint " + (d.phone_taken ? "error" : "");
      phoneEl.classList.toggle("input-error", Boolean(d.phone_taken));
    }
    if (btn) btn.disabled = Boolean(d.email_taken || d.phone_taken);
    return !(d.email_taken || d.phone_taken);
  } catch (e) {
    return true;
  }
}

async function handleRegisterSendCode(e) {
  e.preventDefault();
  const ok = await runAvailabilityCheck();
  if (!ok) return;
  const payload = {
    full_name: document.getElementById("regName").value.trim(),
    email: document.getElementById("regEmail").value.trim().toLowerCase(),
    phone: document.getElementById("regPhone").value.trim(),
    password: document.getElementById("regPass").value,
    role: document.getElementById("regRole").value,
    specialty: (document.getElementById("regSpecialty")?.value || "").trim(),
    verified: 1
  };
  try {
    const res = await fetch(`${D1_API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "Qeydiyyat alınmadı");
    state.token = d.token;
    state.user = d.user;
    localStorage.setItem("avtolive_token", d.token);
    localStorage.setItem("avtolive_user", JSON.stringify(d.user));
    updateAuthUI();
    closeModal("authModal");
    initApp();
    showToast(`Xoş gəldiniz, ${d.user.full_name}!`);
  } catch (err) {
    showToast("Server xətası");
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;
  try {
    const res = await fetch(`${D1_API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier, identifier, password })
    });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "E-poçt / nömrə və ya parol yanlışdır");
    state.token = d.token;
    state.user = d.user;
    localStorage.setItem("avtolive_token", d.token);
    localStorage.setItem("avtolive_user", JSON.stringify(d.user));
    updateAuthUI();
    closeModal("authModal");
    initApp();
    showToast(`Xoş gəldiniz, ${d.user.full_name}!`);
  } catch (err) {
    showToast("Server xətası");
  }
}

async function saveProfileChanges() {
  const full_name = document.getElementById("profNameInput").value.trim();
  const phone = document.getElementById("profPhoneInput").value.trim();
  const specEl = document.getElementById("profSpecialtyInput");
  const specialty = specEl ? specEl.value.trim() : "";
  try {
    const res = await fetch(`${D1_API_BASE}/api/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${state.token}` },
      body: JSON.stringify({ full_name, phone, specialty, role: state.user.role })
    });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "Yenilənmədi");
    state.user = d.user;
    localStorage.setItem("avtolive_user", JSON.stringify(d.user));
    updateAuthUI();
    initApp();
    showToast("Profil məlumatlarınız yeniləndi");
  } catch (e) {
    showToast("Server xətası");
  }
}

function logoutUser() {
  state.user = null;
  state.token = "";
  localStorage.removeItem("avtolive_token");
  localStorage.removeItem("avtolive_user");
  updateAuthUI();
  closeModal("authModal");
  renderAll();
  showToast("Hesabdan çıxış edildi");
}

let _forgotOtpSession = { email: "", code: "" };
function toggleForgotBox(show) {
  const m = document.getElementById("loginMainForm");
  const b = document.getElementById("forgotPassBox");
  if (m) m.style.display = show ? "none" : "flex";
  if (b) b.style.display = show ? "flex" : "none";
}

async function handleForgotSendOtp() {
  const email = (document.getElementById("forgotEmail").value || "").trim().toLowerCase();
  if (!email.includes("@")) return showToast("Düzgün e-poçt daxil edin");
  const code = String(Math.floor(1000 + Math.random() * 9000));
  _forgotOtpSession = { email, code };
  try {
    await fetch(window.AVTOLIVE_EMAIL_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ email, code, name: "TəklifAl.az İstifadəçi" })
    });
    document.getElementById("forgotStep2").style.display = "flex";
    showToast("4 rəqəmli bərpa kodu e-poçtunuza göndərildi.");
  } catch (e) {
    showToast("Kod göndərilə bilmədi");
  }
}

async function handleForgotResetSubmit() {
  const code = (document.getElementById("forgotOtpCode").value || "").trim();
  const newPass = document.getElementById("forgotNewPass").value || "";
  if (code !== _forgotOtpSession.code) return showToast("Təsdiq kodu yanlışdır");
  try {
    const res = await fetch(`${D1_API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: _forgotOtpSession.email, new_password: newPass })
    });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "Xəta");
    showToast("Parolunuz yeniləndi!");
    toggleForgotBox(false);
  } catch (e) {
    showToast("Server xətası");
  }
}

// ============================================================
// FULLSCREEN PHOTO LIGHTBOX & FOOTER INFO
// ============================================================
function openPhotoLightbox(idx = 0) {
  if (!_galleryPhotos.length) return;
  _lbIndex = (idx + _galleryPhotos.length) % _galleryPhotos.length;
  renderLightbox();
  document.getElementById("photoLightbox").classList.add("open");
}

function closePhotoLightbox() {
  document.getElementById("photoLightbox")?.classList.remove("open");
}

function stepLightbox(delta) {
  if (!_galleryPhotos.length) return;
  _lbIndex = (_lbIndex + delta + _galleryPhotos.length) % _galleryPhotos.length;
  renderLightbox();
}

function renderLightbox() {
  document.getElementById("lightboxImg").src = _galleryPhotos[_lbIndex];
  document.getElementById("lightboxCounter").textContent = `${_lbIndex + 1} / ${_galleryPhotos.length}`;
}

function openInfoModal(topic) {
  const pages = {
    about: {
      t: "TəklifAl.az Haqqında",
      b: "<p><strong>TəklifAl.az</strong> — Azərbaycanda ev təmiri, kombi, kondisioner, santexnika, elektrik, məişət texnikası və avtoservis xidmətləri üzrə ilk tərs-hərrac (qiymət təklifi) platformasıdır.</p><p style='margin-top:8px;'>Müştərilər problemi pulsuz paylaşır, ustalar isə 5 dəqiqə ərzində öz qiymət və zəmanət təkliflərini göndərirlər.</p>"
    },
    rules: {
      t: "İstifadə Qaydaları",
      b: "<p>1. Müştərilər üçün sorğu yaratmaq və usta seçmək 100% pulsuzdur.</p><p style='margin-top:8px;'>2. Ustalar yalnız real yerinə yetirə biləcəkləri işlərə dəqiq qiymət və zəmanət təklifi göndərməlidirlər.</p><p style='margin-top:8px;'>3. Hər e-poçt və telefon nömrəsi ilə yalnız bir hesab yaradıla bilər.</p>"
    },
    privacy: {
      t: "Məxfilik Siyasəti",
      b: "<p>Şəxsi məlumatlarınız və şifrələriniz (SHA-256) Cloudflare D1 SQL verilənlər bazasında təhlükəsiz şəkildə qorunur.</p>"
    },
    contact: {
      t: "Əlaqə və Dəstək",
      b: "<p><strong>Qaynar xətt:</strong> *8899 (09:00 – 21:00)</p><p style='margin-top:8px;'><strong>Ünvan:</strong> Bakı şəhəri, Azərbaycan</p><p style='margin-top:8px;'><strong>E-poçt:</strong> support@teklifal.az</p>"
    }
  };
  const p = pages[topic] || pages.about;
  document.getElementById("infoModalTitle").textContent = p.t;
  document.getElementById("infoModalBody").innerHTML = p.b;
  document.getElementById("infoModal").classList.add("open");
}
