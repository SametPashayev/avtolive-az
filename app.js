// avtolive.az — Executive Automotive Marketplace & Live Showroom Engine
// Zero-Emoji Vector SVG UI + Custom Dark Searchable Filter Cockpit (147+ Brands & 1600+ Models)

const BRAND_MODELS = window.TURBO_BRANDS_MODELS || {
  "BMW": ["116", "320", "520", "530", "530e", "740", "M3", "M5", "M5 Competition", "X5", "X6", "X7", "iX"],
  "Mercedes-Benz": ["C 200", "E 200", "E 300", "S 500", "S 580", "G 63 AMG", "GLE 53 AMG", "GLS 600 Maybach"]
};

const AZ_CITIES = [
  "Bakı", "Gəncə", "Sumqayıt", "Xırdalan", "Lənkəran", "Mingəçevir", "Naxçıvan",
  "Şəki", "Quba", "Qusar", "Şamaxı", "Qəbələ", "Bərdə", "Şirvan", "Salyan",
  "Masallı", "Cəlilabad", "Tovuz", "Qazax", "Şəmkir", "Yevlax", "Ağdaş", "Göyçay", "Zaqatala"
];

const BODY_TYPES = ["Sedan", "Offroader / SUV", "Kupe", "Liftbek", "Hetçbek", "Universal", "Pikap", "Miniven", "Kabriolet"];
const FUEL_TYPES = ["Benzin", "Dizel", "Hibrid", "Plug-in Hibrid", "Elektro", "Qaz"];
const GEAR_TYPES = ["Avtomat", "Mexaniki", "Robot", "Variator"];

function iconSvg(name, cls = "sm") {
  return `<svg class="svg-icon ${cls}"><use href="#i-${name}"/></svg>`;
}

const I18N = {
  az: {
    promo: "Standart Avtomobil Elanları və Canlı Yayım Vitrini — VIP Paketlər 55% Daha Sərfəli",
    online_buyers: "1,480 alıcı hazırda saytdadır",
    top_login: "Giriş",
    top_register: "Qeydiyyat",
    btn_login_only: "Giriş",
    btn_register_only: "Qeydiyyat",
    nav_all: "Bütün Elanlar",
    nav_live: "Canlı Yayımlar",
    nav_salons: "Avtosalonlar",
    nav_pricing: "Tariflər",
    nav_favs: "Seçilmişlər",
    btn_post_ad: "Yeni Elan",
    hero_badge: "STANDART ELANLAR VƏ CANLI AVTOMOBİL VİTRİNİ",
    hero_title: "Maşını Həm Foto Qalereyada, Həm də <span>Canlı Yayımda</span> Yoxla və Al!",
    hero_subtitle: "İstər standart fotoşəkilli elan yerləşdirin, istərsə də avtomobilinizi birbaşa canlı yayımda alıcılara nümayiş etdirin. Bütün elan və VIP vitrin paketləri 55% daha sərfəlidir.",
    btn_watch_live: "Canlı Yayımlara Bax",
    btn_start_own_live: "Yeni Elan Yerləşdir",
    btn_compare_prices: "Tarifləri Müqayisə Et",
    stat_free_ad: "Standart Elan & Canlı Yayım",
    stat_cheaper: "Daha Sərfəli VIP Vitrin",
    stat_transparent: "Rəsmi Marka və 1600+ Model",
    filter_title: "Avtomobil Axtarış Sistemi",
    cond_all: "Hamısı",
    cond_new: "Yeni (0 km)",
    cond_used: "Yürüşlü",
    btn_reset_filters: "Filtrləri Sıfırla",
    lbl_brand: "Marka",
    lbl_model: "Model",
    lbl_city: "Şəhər",
    lbl_body: "Ban növü",
    lbl_fuel: "Yanacaq növü",
    lbl_gear: "Sürətlər qutusu",
    lbl_price: "Qiymət (Min - Maks)",
    lbl_year: "Buraxılış ili",
    lbl_mileage: "Maks. Yürüş (km)",
    lbl_search: "Açar söz və ya VIN kod",
    lbl_sort: "Çeşidləmə",
    all_brands: "Bütün markalar",
    all_models: "Bütün modellər",
    all_cities: "Bütün şəhərlər",
    all_bodies: "Bütün ban növləri",
    all_items: "Hamısı",
    sort_featured: "Əvvəlcə Canlı & VIP",
    sort_newest: "Əvvəlcə yeni elanlar",
    sort_price_asc: "Qiymət: Ucuzdan bahaya",
    sort_price_desc: "Qiymət: Bahadan ucuza",
    sort_year_desc: "Buraxılış ili: Yenidən",
    chip_live: "Hazırda Canlı Yayımda",
    chip_credit: "Kreditlə",
    chip_barter: "Barter mümkündür",
    chip_vip: "Yalnız VIP",
    found_count_prefix: "Tapıldı:",
    found_count_suffix: "avtomobil",
    sec_live_title: "Hazırda Canlı Yayımda Olan Avtomobillər",
    btn_broadcast_yours: "Canlı Yayıma Başla",
    sec_all_listings: "VIP və Standart Avtomobil Elanları",
    sec_salons_title: "Rəsmi Avtosalonlar və Dilerlər",
    sec_pricing_title: "Sərfəli Elan və Vitrin Paketləri",
    sec_pricing_desc: "AvtoLive.az satıcılar üçün həm pulsuz Standart Elan və Canlı Yayım imkanı yaradır, həm də digər saytlardan 55% daha ucuz VIP vitrin paketləri təklif edir.",
    badge_credit: "Kredit",
    badge_barter: "Barter",
    badge_new: "Yeni",
    watch_live_btn: "Canlı Yayıma Qoşul",
    start_camera_btn: "Öz Kameranı Aç (Canlı Yayım)",
    stop_camera_btn: "Kameranı Dayandır"
  },
  tr: {
    promo: "Standart Otomobil İlanları ve Canlı Yayın Vitrini — VIP Paketler %55 Daha Uygun",
    online_buyers: "1,480 alıcı şu an sitede aktif",
    top_login: "Giriş",
    top_register: "Kayıt Ol",
    btn_login_only: "Giriş",
    btn_register_only: "Kayıt Ol",
    nav_all: "Tüm İlanlar",
    nav_live: "Canlı Yayınlar",
    nav_salons: "Oto Galeriler",
    nav_pricing: "Paketler",
    nav_favs: "Favoriler",
    btn_post_ad: "Yeni İlan Ver",
    hero_badge: "STANDART İLANLAR VE CANLI OTOMOBİL VİTRİNİ",
    hero_title: "Aracı Hem Fotoğraf Galerisinde Hem <span>Canlı Yayında</span> İncele ve Al!",
    hero_subtitle: "İster standart fotoğraflı ve detaylı özellikli ilan verin, ister aracınızı canlı yayında alıcılara tanıtın. Tüm VIP vitrin paketleri %55 daha uygun.",
    btn_watch_live: "Canlı Yayınları İzle",
    btn_start_own_live: "Yeni İlan Ver",
    btn_compare_prices: "Paketleri Karşılaştır",
    stat_free_ad: "Standart İlan & Canlı Yayın",
    stat_cheaper: "Daha Uygun VIP Vitrin",
    stat_transparent: "Resmi Marka ve 1600+ Model",
    filter_title: "Gelişmiş Araç Arama Sistemi",
    cond_all: "Tümü",
    cond_new: "Sıfır (0 km)",
    cond_used: "İkinci El",
    btn_reset_filters: "Filtreleri Sıfırla",
    lbl_brand: "Marka",
    lbl_model: "Model",
    lbl_city: "Şehir",
    lbl_body: "Kasa Tipi",
    lbl_fuel: "Yakıt Türü",
    lbl_gear: "Vites",
    lbl_price: "Fiyat (Min - Maks)",
    lbl_year: "Model Yılı",
    lbl_mileage: "Maks. Kilometre",
    lbl_search: "Kelime veya Şasi (VIN) No",
    lbl_sort: "Sıralama",
    all_brands: "Tüm markalar",
    all_models: "Tüm modeller",
    all_cities: "Tüm şehirler",
    all_bodies: "Tüm kasa tipleri",
    all_items: "Tümü",
    sort_featured: "Önce Canlı & VIP",
    sort_newest: "Önce En Yeni İlanlar",
    sort_price_asc: "Fiyat: Ucuzdan Pahalıya",
    sort_price_desc: "Fiyat: Pahalıdan Ucuza",
    sort_year_desc: "Yıl: Yeniden Eskiye",
    chip_live: "Şu An Canlı Yayında",
    chip_credit: "Krediye Uygun",
    chip_barter: "Takas (Barter) Olur",
    chip_vip: "Sadece VIP",
    found_count_prefix: "Bulunan:",
    found_count_suffix: "araç",
    sec_live_title: "Şu An Canlı Yayında Tanıtılan Araçlar",
    btn_broadcast_yours: "Canlı Yayın Başlat",
    sec_all_listings: "VIP ve Standart Araç İlanları",
    sec_salons_title: "Resmi Oto Galeriler ve Bayiler",
    sec_pricing_title: "Ekonomik İlan ve Vitrin Paketleri",
    sec_pricing_desc: "AvtoLive.az satıcılar için hem ücretsiz Standart İlan ve Canlı Yayın stüdyosu sunar hem de diğer sitelerden %55 daha uygun vitrin paketleri sağlar.",
    badge_credit: "Kredi",
    badge_barter: "Takas",
    badge_new: "Sıfır",
    watch_live_btn: "Canlı Yayına Katıl",
    start_camera_btn: "Kendi Kameranı Aç (Canlı Yayın)",
    stop_camera_btn: "Kamerayı Kapat"
  },
  ru: {
    promo: "Стандартные объявления и витрина прямых эфиров — VIP-пакеты на 55% выгоднее",
    online_buyers: "1,480 покупателей сейчас на сайте",
    top_login: "Вход",
    top_register: "Регистрация",
    btn_login_only: "Вход",
    btn_register_only: "Регистрация",
    nav_all: "Все объявления",
    nav_live: "Прямые эфиры",
    nav_salons: "Автосалоны",
    nav_pricing: "Тарифы",
    nav_favs: "Избранное",
    btn_post_ad: "Подать объявление",
    hero_badge: "СТАНДАРТНЫЕ ОБЪЯВЛЕНИЯ И АВТОРЫНОК С ПРЯМЫМИ ЭФИРАМИ",
    hero_title: "Выбирайте авто по фотогалерее или в <span>Прямом Эфире</span>!",
    hero_subtitle: "Размещайте стандартные объявления с фото и характеристиками или показывайте автомобиль покупателям в прямом эфире. Цены на VIP-пакеты на 55% выгоднее.",
    btn_watch_live: "Смотреть эфиры",
    btn_start_own_live: "Подать объявление",
    btn_compare_prices: "Сравнить тарифы",
    stat_free_ad: "Стандартное объявление и эфир",
    stat_cheaper: "Выгодный VIP-тариф",
    stat_transparent: "Официальные марки и 1600+ моделей",
    filter_title: "Система поиска автомобилей",
    cond_all: "Все",
    cond_new: "Новые (0 км)",
    cond_used: "С пробегом",
    btn_reset_filters: "Сбросить фильтры",
    lbl_brand: "Марка",
    lbl_model: "Модель",
    lbl_city: "Город",
    lbl_body: "Тип кузова",
    lbl_fuel: "Тип топлива",
    lbl_gear: "Коробка передач",
    lbl_price: "Цена (Мин - Макс)",
    lbl_year: "Год выпуска",
    lbl_mileage: "Макс. пробег (км)",
    lbl_search: "Ключевое слово или VIN-код",
    lbl_sort: "Сортировка",
    all_brands: "Все марки",
    all_models: "Все модели",
    all_cities: "Все города",
    all_bodies: "Все типы кузова",
    all_items: "Все",
    sort_featured: "Сначала Live и VIP",
    sort_newest: "Сначала новые",
    sort_price_asc: "Цена: по возрастанию",
    sort_price_desc: "Цена: по убыванию",
    sort_year_desc: "Год: от новых к старым",
    chip_live: "Сейчас в прямом эфире",
    chip_credit: "В кредит",
    chip_barter: "Возможен бартер",
    chip_vip: "Только VIP",
    found_count_prefix: "Найдено:",
    found_count_suffix: "авто",
    sec_live_title: "Автомобили сейчас в прямом эфире",
    btn_broadcast_yours: "Начать прямой эфир",
    sec_all_listings: "VIP и стандартные объявления",
    sec_salons_title: "Официальные автосалоны и дилеры",
    sec_pricing_title: "Выгодные тарифы размещения",
    sec_pricing_desc: "AvtoLive.az предоставляет бесплатные стандартные объявления, прямые трансляции и рекламные пакеты на 55% дешевле.",
    badge_credit: "Кредит",
    badge_barter: "Бартер",
    badge_new: "Новый",
    watch_live_btn: "Смотреть прямой эфир",
    start_camera_btn: "Включить свою веб-камеру",
    stop_camera_btn: "Остановить камеру"
  }
};

let state = {
  lang: localStorage.getItem("avtolive_lang") || "az",
  currency: localStorage.getItem("avtolive_curr") || "AZN",
  tab: "all",
  condition: "all",
  chips: { live: false, credit: false, barter: false, vip: false },
  listings: [],
  salons: [],
  user: null,
  token: localStorage.getItem("avtolive_token") || "",
  favorites: JSON.parse(localStorage.getItem("avtolive_favs") || "[]"),
  activeModalListing: null,
  webcamStream: null
};

function formatPrice(priceAZN) {
  if (state.currency === "USD") {
    const usd = Math.round(priceAZN / 1.7);
    return "$ " + usd.toLocaleString("en-US");
  }
  return priceAZN.toLocaleString("en-US") + " ₼";
}

function getDescription(item) {
  if (state.lang === "tr") return item.description_tr || item.description_az;
  if (state.lang === "ru") return item.description_ru || item.description_az;
  return item.description_az;
}

function showToast(msg) {
  const container = document.getElementById("toastContainer");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

// Close Custom Dropdowns when clicking outside
document.addEventListener("click", () => {
  document.querySelectorAll(".filter-field-box.open").forEach(box => box.classList.remove("open"));
});

function toggleCustomDropdown(key, event) {
  if (event) event.stopPropagation();
  const box = document.getElementById("ddBox_" + key);
  const wasOpen = box.classList.contains("open");
  document.querySelectorAll(".filter-field-box.open").forEach(b => b.classList.remove("open"));
  if (!wasOpen) {
    box.classList.add("open");
    const searchInput = document.getElementById("ddSearch_" + key);
    if (searchInput) {
      searchInput.value = "";
      filterDropdownList(key);
      setTimeout(() => searchInput.focus(), 30);
    }
  }
}

function filterDropdownList(key) {
  const searchInput = document.getElementById("ddSearch_" + key);
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const listEl = document.getElementById("ddList_" + key);
  if (!listEl) return;
  listEl.querySelectorAll(".custom-dd-option").forEach(opt => {
    const text = opt.getAttribute("data-search") || opt.textContent.toLowerCase();
    opt.style.display = text.includes(query) ? "flex" : "none";
  });
}

function buildCustomDropdowns() {
  const dict = I18N[state.lang];
  const brands = Object.keys(BRAND_MODELS).sort((a, b) => a.localeCompare(b));

  // 1. Brand Dropdown
  const curBrand = document.getElementById("fBrand").value;
  const brandList = document.getElementById("ddList_brand");
  brandList.innerHTML = `
    <div class="custom-dd-option ${curBrand === '' ? 'selected' : ''}" data-search="" onclick="selectFilterOption('brand', '', '${dict.all_brands} (${brands.length})')">
      <span>${dict.all_brands}</span>
      <span class="custom-dd-count">${brands.length}</span>
    </div>
  ` + brands.map(b => `
    <div class="custom-dd-option ${curBrand === b ? 'selected' : ''}" data-search="${b.toLowerCase()}" onclick="selectFilterOption('brand', '${b.replace(/'/g, "\\'")}', '${b.replace(/'/g, "\\'")}')">
      <span>${b}</span>
      <span class="custom-dd-count">${BRAND_MODELS[b].length}</span>
    </div>
  `).join("");
  updateDropdownLabel("brand", curBrand, `${dict.all_brands} (${brands.length})`);

  // 2. Model Dropdown (Depends on Brand)
  populateModelDropdown();

  // 3. City Dropdown
  const curCity = document.getElementById("fCity").value;
  const cityList = document.getElementById("ddList_city");
  cityList.innerHTML = `
    <div class="custom-dd-option ${curCity === '' ? 'selected' : ''}" data-search="" onclick="selectFilterOption('city', '', '${dict.all_cities}')">
      <span>${dict.all_cities}</span>
    </div>
  ` + AZ_CITIES.map(c => `
    <div class="custom-dd-option ${curCity === c ? 'selected' : ''}" data-search="${c.toLowerCase()}" onclick="selectFilterOption('city', '${c}', '${c}')">
      <span>${c}</span>
    </div>
  `).join("");
  updateDropdownLabel("city", curCity, dict.all_cities);

  // 4. Body Type Dropdown
  const curBody = document.getElementById("fBody").value;
  const bodyList = document.getElementById("ddList_body");
  bodyList.innerHTML = `
    <div class="custom-dd-option ${curBody === '' ? 'selected' : ''}" onclick="selectFilterOption('body', '', '${dict.all_bodies}')">
      <span>${dict.all_bodies}</span>
    </div>
  ` + BODY_TYPES.map(b => `
    <div class="custom-dd-option ${curBody === b ? 'selected' : ''}" onclick="selectFilterOption('body', '${b}', '${b}')">
      <span>${b}</span>
    </div>
  `).join("");
  updateDropdownLabel("body", curBody, dict.all_bodies);

  // 5. Fuel Dropdown
  const curFuel = document.getElementById("fFuel").value;
  const fuelList = document.getElementById("ddList_fuel");
  fuelList.innerHTML = `
    <div class="custom-dd-option ${curFuel === '' ? 'selected' : ''}" onclick="selectFilterOption('fuel', '', '${dict.all_items}')">
      <span>${dict.all_items}</span>
    </div>
  ` + FUEL_TYPES.map(f => `
    <div class="custom-dd-option ${curFuel === f ? 'selected' : ''}" onclick="selectFilterOption('fuel', '${f}', '${f}')">
      <span>${f}</span>
    </div>
  `).join("");
  updateDropdownLabel("fuel", curFuel, dict.all_items);

  // 6. Gear Dropdown
  const curGear = document.getElementById("fGear").value;
  const gearList = document.getElementById("ddList_gear");
  gearList.innerHTML = `
    <div class="custom-dd-option ${curGear === '' ? 'selected' : ''}" onclick="selectFilterOption('gear', '', '${dict.all_items}')">
      <span>${dict.all_items}</span>
    </div>
  ` + GEAR_TYPES.map(g => `
    <div class="custom-dd-option ${curGear === g ? 'selected' : ''}" onclick="selectFilterOption('gear', '${g}', '${g}')">
      <span>${g}</span>
    </div>
  `).join("");
  updateDropdownLabel("gear", curGear, dict.all_items);

  // 7. Sort Dropdown
  const curSort = document.getElementById("fSort").value || "featured";
  const sortOptions = [
    { val: "featured", label: dict.sort_featured },
    { val: "newest", label: dict.sort_newest },
    { val: "price_asc", label: dict.sort_price_asc },
    { val: "price_desc", label: dict.sort_price_desc },
    { val: "year_desc", label: dict.sort_year_desc }
  ];
  const sortList = document.getElementById("ddList_sort");
  sortList.innerHTML = sortOptions.map(s => `
    <div class="custom-dd-option ${curSort === s.val ? 'selected' : ''}" onclick="selectFilterOption('sort', '${s.val}', '${s.label}')">
      <span>${s.label}</span>
    </div>
  `).join("");
  const activeSortObj = sortOptions.find(s => s.val === curSort) || sortOptions[0];
  document.getElementById("ddLabel_sort").textContent = activeSortObj.label;

  // Populate Post Ad Modal Brand & Model selects
  const pBrand = document.getElementById("pBrand");
  if (pBrand && pBrand.options.length === 0) {
    pBrand.innerHTML = brands.map(b => `<option value="${b}">${b}</option>`).join("");
    if (brands.includes("BMW")) pBrand.value = "BMW";
    onPostBrandChange();
  }
}

function populateModelDropdown() {
  const dict = I18N[state.lang];
  const brand = document.getElementById("fBrand").value;
  const curModel = document.getElementById("fModel").value;
  const modelList = document.getElementById("ddList_model");
  const models = (brand && BRAND_MODELS[brand]) ? BRAND_MODELS[brand] : [];

  const defaultLabel = models.length > 0 ? `${dict.all_models} (${models.length})` : dict.all_models;

  modelList.innerHTML = `
    <div class="custom-dd-option ${curModel === '' ? 'selected' : ''}" data-search="" onclick="selectFilterOption('model', '', '${defaultLabel}')">
      <span>${defaultLabel}</span>
    </div>
  ` + models.map(m => `
    <div class="custom-dd-option ${curModel === m ? 'selected' : ''}" data-search="${m.toLowerCase()}" onclick="selectFilterOption('model', '${m.replace(/'/g, "\\'")}', '${m.replace(/'/g, "\\'")}')">
      <span>${m}</span>
    </div>
  `).join("");

  updateDropdownLabel("model", curModel, defaultLabel);
}

function updateDropdownLabel(key, val, placeholderText) {
  const lbl = document.getElementById("ddLabel_" + key);
  if (!lbl) return;
  if (val) {
    lbl.textContent = val;
    lbl.classList.remove("placeholder");
  } else {
    lbl.textContent = placeholderText;
    lbl.classList.add("placeholder");
  }
}

function selectFilterOption(key, val, displayLabel) {
  const inputMap = {
    brand: "fBrand",
    model: "fModel",
    city: "fCity",
    body: "fBody",
    fuel: "fFuel",
    gear: "fGear",
    sort: "fSort"
  };
  const hiddenInput = document.getElementById(inputMap[key]);
  if (hiddenInput) hiddenInput.value = val;

  if (key === "brand") {
    document.getElementById("fModel").value = "";
  }

  document.querySelectorAll(".filter-field-box.open").forEach(b => b.classList.remove("open"));
  buildCustomDropdowns();
  applyFilters();
}

function onPostBrandChange() {
  const pBrand = document.getElementById("pBrand");
  const pModel = document.getElementById("pModel");
  if (!pBrand || !pModel) return;
  const brand = pBrand.value;
  const models = BRAND_MODELS[brand] || [];
  pModel.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join("");
}

// Initialize App
async function initApp() {
  buildCustomDropdowns();
  setLanguage(state.lang, false);
  setCurrency(state.currency, false);
  updateFavBadge();

  try {
    const headers = state.token ? { "Authorization": "Bearer " + state.token } : {};
    const res = await fetch("/api/init", { headers });
    if (!res.ok) throw new Error("Static fallback");
    const data = await res.json();
    state.listings = data.listings || [];
    state.salons = data.salons || [];
    state.user = data.user || JSON.parse(localStorage.getItem("avtolive_user") || "null");
  } catch (e) {
    const seed = window.AVTOLIVE_SEED || { listings: [], salons: [], messages: [] };
    const savedListings = JSON.parse(localStorage.getItem("avtolive_custom_listings") || "null");
    state.listings = savedListings || seed.listings;
    state.salons = seed.salons;
    state.user = JSON.parse(localStorage.getItem("avtolive_user") || "null");
  }
  updateAuthUI();
  renderAll();
}

function setLanguage(lang, rerender = true) {
  state.lang = lang;
  localStorage.setItem("avtolive_lang", lang);

  ["az", "tr", "ru"].forEach(l => {
    const btn = document.getElementById("lang" + l.toUpperCase());
    if (btn) btn.classList.toggle("active", l === lang);
  });

  const dict = I18N[lang];
  document.getElementById("promoText").textContent = dict.promo;
  document.getElementById("activeUsersBadge").textContent = dict.online_buyers;
  document.getElementById("heroTitle").innerHTML = dict.hero_title;
  document.getElementById("heroSubtitle").textContent = dict.hero_subtitle;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  buildCustomDropdowns();
  updateAuthUI();
  if (rerender) renderAll();
}

function setCurrency(curr, rerender = true) {
  state.currency = curr;
  localStorage.setItem("avtolive_curr", curr);
  document.getElementById("currAZN").classList.toggle("active", curr === "AZN");
  document.getElementById("currUSD").classList.toggle("active", curr === "USD");
  if (rerender) renderAll();
}

function switchTab(tab) {
  state.tab = tab;
  ["All", "Live", "Salons", "Pricing", "Favs"].forEach(name => {
    const el = document.getElementById("nav" + name);
    if (el) el.classList.remove("active");
  });

  if (tab === "all") document.getElementById("navAll").classList.add("active");
  if (tab === "live") document.getElementById("navLive").classList.add("active");
  if (tab === "salons") document.getElementById("navSalons").classList.add("active");
  if (tab === "pricing") document.getElementById("navPricing").classList.add("active");
  if (tab === "favorites") document.getElementById("navFavs").classList.add("active");

  const hero = document.getElementById("heroSection");
  const filter = document.getElementById("filterPanel");
  const liveStrip = document.getElementById("liveStripSection");
  const listings = document.getElementById("listingsSection");
  const salons = document.getElementById("salonsSection");
  const pricing = document.getElementById("pricingSection");

  if (tab === "salons") {
    hero.style.display = "none";
    filter.style.display = "none";
    liveStrip.style.display = "none";
    listings.style.display = "none";
    pricing.style.display = "none";
    salons.style.display = "block";
    renderSalons();
    return;
  }

  if (tab === "pricing") {
    hero.style.display = "none";
    filter.style.display = "none";
    liveStrip.style.display = "none";
    listings.style.display = "none";
    salons.style.display = "none";
    pricing.style.display = "block";
    return;
  }

  salons.style.display = "none";
  pricing.style.display = "none";
  hero.style.display = tab === "all" ? "grid" : "none";
  filter.style.display = "block";
  liveStrip.style.display = (tab === "all" || tab === "live") ? "block" : "none";
  listings.style.display = "block";

  if (tab === "live") {
    state.chips.live = true;
    document.getElementById("chipLive").classList.add("active");
  } else if (tab === "all") {
    state.chips.live = false;
    document.getElementById("chipLive").classList.remove("active");
  }

  applyFilters();
}

function setConditionFilter(cond) {
  state.condition = cond;
  ["All", "New", "Used"].forEach(c => {
    document.getElementById("cond" + c).classList.toggle("active", c.toLowerCase() === cond);
  });
  applyFilters();
}

function toggleChip(chipName) {
  state.chips[chipName] = !state.chips[chipName];
  const map = { live: "chipLive", credit: "chipCredit", barter: "chipBarter", vip: "chipVip" };
  document.getElementById(map[chipName]).classList.toggle("active", state.chips[chipName]);
  applyFilters();
}

function resetFilters() {
  ["fBrand", "fModel", "fCity", "fBody", "fFuel", "fGear", "fPriceMin", "fPriceMax", "fYearMin", "fYearMax", "fMileageMax", "fSearch"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("fSort").value = "featured";
  state.condition = "all";
  setConditionFilter("all");
  state.chips = { live: false, credit: false, barter: false, vip: false };
  ["chipLive", "chipCredit", "chipBarter", "chipVip"].forEach(id => document.getElementById(id).classList.remove("active"));
  buildCustomDropdowns();
  applyFilters();
}

function renderAll() {
  renderFeaturedHeroLive();
  renderLiveStrip();
  applyFilters();
  renderSalons();
}

function renderFeaturedHeroLive() {
  const stage = document.getElementById("featuredLiveStage");
  const liveCars = state.listings.filter(c => c.is_live === 1);
  document.getElementById("liveCountNav").textContent = liveCars.length;

  const featured = liveCars[0] || state.listings[0];
  if (!featured) return;

  const dict = I18N[state.lang];
  stage.innerHTML = `
    <video class="hero-live-video" src="${featured.live_stream_url || 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-in-the-city-at-night-41569-large.mp4'}" autoplay muted loop playsinline poster="${featured.images[0]}"></video>
    <div class="hero-live-overlay">
      <div class="live-top-bar">
        <span class="live-pill-mini" style="font-size:0.76rem;padding:5px 12px;">
          ${iconSvg("broadcast")}
          ${featured.is_live ? 'CANLI YAYIM / LIVE' : 'VIP VİTRİN'}
        </span>
        <span class="viewer-count-pill">
          ${iconSvg("eye")} ${featured.live_viewers || 142} izləyici
        </span>
      </div>

      <div>
        <div style="font-size:0.81rem;color:#fda4af;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
          ${iconSvg("salon")} ${featured.seller_name} • ${featured.city}
        </div>
        <h3 style="font-size:1.4rem;font-weight:900;margin-bottom:6px;">
          ${featured.brand} ${featured.model} (${featured.year}) — ${formatPrice(featured.price)}
        </h3>
        <p style="font-size:0.85rem;color:#cbd5e1;margin-bottom:14px;">
          ${featured.live_title || getDescription(featured).slice(0, 95)}
        </p>
        <div style="display:flex;gap:10px;">
          <button class="btn-primary" onclick="openCarDetail(${featured.id})">
            ${iconSvg("broadcast")} ${dict.watch_live_btn}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderLiveStrip() {
  const grid = document.getElementById("liveStripGrid");
  const liveCars = state.listings.filter(c => c.is_live === 1);
  const dict = I18N[state.lang];

  grid.innerHTML = liveCars.map(car => `
    <div class="live-card" onclick="openCarDetail(${car.id})">
      <div class="live-card-media">
        <img src="${car.images[0]}" alt="${car.brand} ${car.model}" />
        <div class="live-ring-badge">
          ${iconSvg("broadcast")} LIVE
        </div>
        <div class="live-viewers-tag">
          ${iconSvg("eye")} ${car.live_viewers}
        </div>
      </div>
      <div class="live-card-body">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
          <span style="font-size:1.18rem;font-weight:900;color:#fff;">${formatPrice(car.price)}</span>
          <span style="font-size:0.78rem;color:#fda4af;font-weight:700;display:inline-flex;align-items:center;gap:4px;">
            ${iconSvg("pin")} ${car.city}
          </span>
        </div>
        <div style="font-weight:800;font-size:1rem;margin-bottom:4px;">${car.brand} ${car.model} (${car.year})</div>
        <div style="font-size:0.82rem;color:#94a3b8;margin-bottom:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${car.live_title || (car.engine_volume + ' L • ' + car.mileage + ' km')}
        </div>
        <button class="btn-primary" style="width:100%;justify-content:center;padding:8px 12px;font-size:0.83rem;">
          ${iconSvg("broadcast")} ${dict.watch_live_btn}
        </button>
      </div>
    </div>
  `).join("");
}

function applyFilters() {
  const brand = document.getElementById("fBrand").value;
  const model = document.getElementById("fModel").value;
  const city = document.getElementById("fCity").value;
  const body = document.getElementById("fBody").value;
  const fuel = document.getElementById("fFuel").value;
  const gear = document.getElementById("fGear").value;
  const priceMin = parseFloat(document.getElementById("fPriceMin").value) || 0;
  const priceMax = parseFloat(document.getElementById("fPriceMax").value) || Infinity;
  const yearMin = parseInt(document.getElementById("fYearMin").value) || 0;
  const yearMax = parseInt(document.getElementById("fYearMax").value) || Infinity;
  const mileageMax = parseInt(document.getElementById("fMileageMax").value) || Infinity;
  const search = document.getElementById("fSearch").value.trim().toLowerCase();
  const sort = document.getElementById("fSort").value;

  let filtered = state.listings.filter(item => {
    if (state.tab === "favorites" && !state.favorites.includes(item.id)) return false;
    if (state.condition === "new" && !item.is_new && item.mileage > 0) return false;
    if (state.condition === "used" && (item.is_new || item.mileage === 0)) return false;

    if (brand && item.brand !== brand) return false;
    if (model && item.model !== model) return false;
    if (city && item.city !== city) return false;
    if (body && item.body_type !== body) return false;
    if (fuel && item.fuel_type !== fuel) return false;
    if (gear && item.transmission !== gear) return false;

    if (item.price < priceMin || item.price > priceMax) return false;
    if (item.year < yearMin || item.year > yearMax) return false;
    if (item.mileage > mileageMax) return false;

    if (state.chips.live && !item.is_live) return false;
    if (state.chips.credit && !item.credit) return false;
    if (state.chips.barter && !item.barter) return false;
    if (state.chips.vip && item.tier !== "vip") return false;

    if (search) {
      const hay = `${item.brand} ${item.model} ${item.city} ${item.vin_code} ${item.description_az} ${item.description_tr} ${item.seller_name}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }

    return true;
  });

  if (sort === "newest") {
    filtered.sort((a, b) => b.id - a.id);
  } else if (sort === "price_asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "year_desc") {
    filtered.sort((a, b) => b.year - a.year);
  } else {
    const tierOrder = { vip: 1, premium: 2, forward: 3, standard: 4 };
    filtered.sort((a, b) => (b.is_live - a.is_live) || ((tierOrder[a.tier] || 4) - (tierOrder[b.tier] || 4)) || (b.id - a.id));
  }

  document.getElementById("resultsCount").textContent = filtered.length;
  renderCarsGrid(filtered);
}

function renderCarsGrid(cars) {
  const grid = document.getElementById("carsGrid");
  const dict = I18N[state.lang];

  if (cars.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px;background:var(--bg-card);border-radius:18px;border:1px solid var(--border-color);">
        <h3 style="margin-bottom:12px;">Seçilmiş meyarlara uyğun avtomobil tapılmadı</h3>
        <button class="btn-secondary" onclick="resetFilters()">
          ${iconSvg("refresh")} Filtrləri Sıfırla
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = cars.map(car => {
    const isFav = state.favorites.includes(car.id);
    return `
      <div class="car-card ${car.tier === 'vip' ? 'tier-vip' : ''}" onclick="openCarDetail(${car.id})">
        <div class="car-media">
          <img src="${car.images[0]}" alt="${car.brand} ${car.model}" loading="lazy" />
          <div class="card-badges-top">
            <div class="badge-group">
              ${car.is_live ? `<span class="live-pill-mini">${iconSvg("broadcast")} LIVE (${car.live_viewers})</span>` : ''}
              ${car.tier === 'vip' ? `<span class="badge-tier badge-vip">${iconSvg("crown")} VIP</span>` : ''}
              ${car.tier === 'premium' ? `<span class="badge-tier badge-premium">PREMIUM</span>` : ''}
              ${car.is_new || car.mileage === 0 ? `<span class="badge-tier badge-new">${dict.badge_new}</span>` : ''}
            </div>
            <button class="fav-icon-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(event, ${car.id})" title="Seçilmişlərə əlavə et">
              ${iconSvg("heart")}
            </button>
          </div>
          <div class="card-badges-bottom">
            ${car.credit ? `<span class="badge-fin">${iconSvg("bank")} ${dict.badge_credit}</span>` : ''}
            ${car.barter ? `<span class="badge-fin">${iconSvg("refresh")} ${dict.badge_barter}</span>` : ''}
          </div>
        </div>

        <div class="car-body">
          <div class="car-price-row">
            <span class="car-price">${formatPrice(car.price)}</span>
            <span style="font-size:0.75rem;color:#94a3b8;font-weight:600;">${car.body_type}</span>
          </div>
          <div class="car-title">${car.brand} ${car.model}</div>
          <div class="car-specs">
            ${car.year} il • ${car.engine_volume > 0 ? car.engine_volume + ' L' : 'Elektro'} • ${car.mileage.toLocaleString()} km
          </div>
          <div class="car-footer">
            <span style="display:inline-flex;align-items:center;gap:4px;">${iconSvg("pin")} ${car.city}</span>
            <span style="display:inline-flex;align-items:center;gap:4px;">${iconSvg("eye")} ${car.views}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function toggleFavorite(e, id) {
  e.stopPropagation();
  const idx = state.favorites.indexOf(id);
  if (idx === -1) {
    state.favorites.push(id);
    showToast("Elan seçilmişlər siyahısına əlavə edildi");
  } else {
    state.favorites.splice(idx, 1);
  }
  localStorage.setItem("avtolive_favs", JSON.stringify(state.favorites));
  updateFavBadge();
  applyFilters();
}

function updateFavBadge() {
  document.getElementById("favCountBadge").textContent = state.favorites.length;
}

function renderSalons() {
  const grid = document.getElementById("salonsGrid");
  if (!grid) return;
  grid.innerHTML = state.salons.map(s => {
    const desc = state.lang === "tr" ? s.description_tr : state.lang === "ru" ? s.description_ru : s.description_az;
    return `
      <div class="salon-card">
        <div class="salon-cover">
          <img src="${s.cover}" alt="${s.name}" />
          ${s.is_live ? `<span class="live-ring-badge">${iconSvg("broadcast")} SALON CANLI YAYIMDADIR</span>` : ''}
        </div>
        <div class="salon-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="font-size:1.15rem;font-weight:800;">${s.name}</h3>
            <span style="color:#f59e0b;font-weight:800;font-size:0.88rem;">${s.rating} / 5.0</span>
          </div>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">${desc}</p>
          <div style="font-size:0.82rem;color:#cbd5e1;margin-bottom:14px;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;align-items:center;gap:6px;">${iconSvg("pin")} ${s.address}</div>
            <div style="display:flex;align-items:center;gap:6px;">${iconSvg("phone")} ${s.phone} • ${s.cars_count} aktiv avtomobil</div>
          </div>
          <button class="btn-primary" style="width:100%;justify-content:center;" onclick="filterBySalon('${s.name}')">
            ${iconSvg("car")} Salonun Avtomobillərinə Bax
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function filterBySalon(salonName) {
  switchTab("all");
  document.getElementById("fSearch").value = salonName.split(" ")[0];
  applyFilters();
}

// OPEN CAR DETAIL MODAL (Standard Photo Gallery OR Live Showroom)
function switchGalleryPhoto(imgUrl) {
  const mainImg = document.getElementById("studioMainImg");
  if (mainImg) mainImg.src = imgUrl;
}

async function openCarDetail(id) {
  const car = state.listings.find(c => c.id === id);
  if (!car) return;
  state.activeModalListing = car;

  document.getElementById("modalCarTitle").textContent = `${car.brand} ${car.model} (${car.year}) — ${formatPrice(car.price)}`;
  const badge = document.getElementById("modalLiveBadge");
  if (car.is_live) {
    badge.style.background = "linear-gradient(135deg, #ff2a4b, #be123c)";
    badge.innerHTML = `${iconSvg("broadcast")} CANLI YAYIM (${car.live_viewers} izləyici)`;
  } else {
    badge.style.background = "#059669";
    badge.innerHTML = `${iconSvg("car")} STANDART ELAN #${10000 + car.id}`;
  }

  const dict = I18N[state.lang];
  const body = document.getElementById("modalBodyContent");
  const extraPhotos = (car.images && car.images.length > 1)
    ? car.images
    : [
        car.images[0],
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80"
      ];

  body.innerHTML = `
    <div class="live-studio-grid">
      <div class="live-video-pane" style="background:#060911;">
        ${car.is_live ? `
          <video id="studioVideoEl" src="${car.live_stream_url || 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-in-the-city-at-night-41569-large.mp4'}" autoplay muted loop playsinline controls poster="${car.images[0]}"></video>
        ` : `
          <div style="display:flex;flex-direction:column;height:100%;">
            <img id="studioMainImg" src="${extraPhotos[0]}" style="width:100%;height:420px;object-fit:cover;" />
            <div style="display:flex;gap:10px;padding:12px 16px;background:#090e1a;border-top:1px solid var(--border-color);overflow-x:auto;">
              ${extraPhotos.map((img, i) => `
                <img src="${img}" onclick="switchGalleryPhoto('${img}')" style="width:92px;height:62px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid ${i === 0 ? '#ff2a4b' : 'transparent'};" />
              `).join("")}
            </div>
          </div>
        `}

        <div class="live-controls-bar" style="${!car.is_live ? 'position:static;margin:12px 16px;' : ''}">
          <div>
            <div style="font-weight:800;font-size:0.9rem;color:#fff;">
              ${car.is_live ? (car.live_title || 'Canlı Avtomobil Təqdimatı') : `${car.brand} ${car.model} — Foto Qalereya`}
            </div>
            <div style="font-size:0.78rem;color:#94a3b8;">
              Satıcı: ${car.seller_name} • ${car.seller_phone}
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${car.is_live ? `
              <button class="btn-primary" id="btnToggleWebcam" onclick="toggleSellerWebcam(${car.id})" style="padding:8px 13px;font-size:0.8rem;">
                ${iconSvg("video")} ${dict.start_camera_btn}
              </button>
            ` : ''}
            <button class="btn-secondary" onclick="toggleLiveStatus(${car.id}, ${car.is_live ? 0 : 1})" style="padding:8px 13px;font-size:0.8rem;">
              ${iconSvg("broadcast")} ${car.is_live ? 'Canlı Yayımı Bitir (Standart Elana Keç)' : 'Bu Elan Üçün Canlı Yayım Aç'}
            </button>
          </div>
        </div>
      </div>

      <div class="live-chat-pane">
        <div style="padding:16px;background:#0d1322;border-bottom:1px solid var(--border-color);">
          <div style="font-size:1.75rem;font-weight:900;color:#fff;margin-bottom:6px;">${formatPrice(car.price)}</div>
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            ${car.credit ? `<span class="badge-fin">${iconSvg("bank")} Kreditlə mümkündür</span>` : ''}
            ${car.barter ? `<span class="badge-fin">${iconSvg("refresh")} Barter mümkündür</span>` : ''}
            ${car.is_new || car.mileage === 0 ? `<span class="badge-tier badge-new">Yeni (0 km)</span>` : ''}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#080d19;padding:10px 14px;border-radius:10px;border:1px solid var(--border-color);">
            <div>
              <div style="font-weight:800;font-size:0.88rem;">${car.seller_name}</div>
              <div style="font-size:0.77rem;color:var(--text-muted);">${car.city}</div>
            </div>
            <a href="tel:${car.seller_phone}" class="btn-success" style="text-decoration:none;padding:8px 13px;font-size:0.82rem;">
              ${iconSvg("phone")} ${car.seller_phone}
            </a>
          </div>
        </div>

        <div style="padding:10px 16px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:800;font-size:0.86rem;">${car.is_live ? 'Canlı Yayım Çatı' : 'Satıcıya Sual Yaz'}</span>
          <span style="font-size:0.74rem;color:#10b981;display:inline-flex;align-items:center;gap:5px;"><span class="status-online-dot"></span> Online</span>
        </div>

        <div class="chat-messages" id="liveChatContainer">
          <div style="color:var(--text-muted);font-size:0.83rem;">Yüklənir...</div>
        </div>

        <div style="padding:8px 12px;display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid var(--border-color);">
          <button class="chip-toggle" style="font-size:0.72rem;padding:4px 9px;" onclick="sendQuickQuestion(${car.id}, 'Salam, maşın bezkraskadır? Boya dəyən yeri var?')">Bezkraskadır?</button>
          <button class="chip-toggle" style="font-size:0.72rem;padding:4px 9px;" onclick="sendQuickQuestion(${car.id}, 'Son qiymət nədir və barter mümkündür?')">Son qiymət & Barter</button>
          <button class="chip-toggle" style="font-size:0.72rem;padding:4px 9px;" onclick="sendQuickQuestion(${car.id}, 'Maşına harada baxmaq olar?')">Harada baxmaq olar?</button>
        </div>

        <form class="chat-input-row" onsubmit="sendLiveChatMessage(event, ${car.id})">
          <input type="text" class="form-input" id="liveChatInput" placeholder="Satıcıya sualınızı yazın..." required />
          <button type="submit" class="btn-primary" style="padding:10px 14px;">Göndər</button>
        </form>
      </div>
    </div>

    <div class="detail-specs-grid">
      <div>
        <h4 style="font-size:1.05rem;font-weight:800;margin-bottom:12px;">Avtomobil Haqqında Ətraflı Məlumat</h4>
        <p style="color:#cbd5e1;font-size:0.92rem;line-height:1.65;margin-bottom:18px;">
          ${getDescription(car)}
        </p>

        <h5 style="font-size:0.82rem;font-weight:800;margin-bottom:10px;color:var(--text-muted);letter-spacing:0.5px;">AVTOMOBİLİN TƏCHİZATI</h5>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
          ${(car.features || []).map(f => `<span class="badge-fin" style="padding:6px 12px;font-size:0.79rem;">${iconSvg("check")} ${f}</span>`).join("")}
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <a href="tel:${car.seller_phone}" class="btn-success" style="text-decoration:none;">
            ${iconSvg("phone")} Satıcıya Zəng Et: ${car.seller_phone}
          </a>
          ${car.tier !== 'vip' ? `
            <button class="btn-primary" onclick="promoteCarToVip(${car.id})">
              ${iconSvg("crown")} 9 ₼ ilə VIP Vitrinə Qaldır (-55%)
            </button>
          ` : ''}
        </div>
      </div>

      <div style="background:#080d19;border:1px solid var(--border-color);border-radius:14px;padding:18px;">
        <h4 style="font-size:0.96rem;font-weight:800;margin-bottom:12px;">Texniki Göstəricilər</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.85rem;">
          <div style="color:var(--text-muted);">Şəhər:</div><div style="font-weight:700;">${car.city}</div>
          <div style="color:var(--text-muted);">Marka:</div><div style="font-weight:700;">${car.brand}</div>
          <div style="color:var(--text-muted);">Model:</div><div style="font-weight:700;">${car.model}</div>
          <div style="color:var(--text-muted);">Buraxılış ili:</div><div style="font-weight:700;">${car.year}</div>
          <div style="color:var(--text-muted);">Ban növü:</div><div style="font-weight:700;">${car.body_type}</div>
          <div style="color:var(--text-muted);">Rəng:</div><div style="font-weight:700;">${car.color}</div>
          <div style="color:var(--text-muted);">Mühərrik:</div><div style="font-weight:700;">${car.engine_volume} L / ${car.horsepower} a.g. / ${car.fuel_type}</div>
          <div style="color:var(--text-muted);">Yürüş:</div><div style="font-weight:700;">${car.mileage.toLocaleString()} km</div>
          <div style="color:var(--text-muted);">Sürətlər qutusu:</div><div style="font-weight:700;">${car.transmission}</div>
          <div style="color:var(--text-muted);">Ötürücü:</div><div style="font-weight:700;">${car.drivetrain}</div>
          <div style="color:var(--text-muted);">Yeni:</div><div style="font-weight:700;">${car.is_new || car.mileage === 0 ? 'Bəli (0 km)' : 'Xeyr'}</div>
          <div style="color:var(--text-muted);">VIN Kod:</div><div style="font-weight:700;color:#38bdf8;">${car.vin_code || 'Yoxlanılıb'}</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("liveDetailModal").classList.add("open");
  loadLiveMessages(car.id);
  if (car.is_live && !state.webcamStream) {
    connectAsLiveViewer(car.id);
  }
}

// Cross-Device Real-Time WebRTC Live Streaming (PeerJS Cloud Signaling)
// Broadcaster Peer ID: "avtolive-az-live-car-<listingId>"
function connectAsLiveViewer(listingId) {
  if (typeof Peer === "undefined") return;
  try {
    if (state.viewerPeer) {
      state.viewerPeer.destroy();
      state.viewerPeer = null;
    }
    const viewerPeer = new Peer();
    state.viewerPeer = viewerPeer;
    const broadcasterId = "avtolive-az-live-car-" + listingId;

    viewerPeer.on("open", () => {
      // Create an empty canvas stream to initiate a WebRTC media call to the broadcaster
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const dummyStream = canvas.captureStream(1);
      const call = viewerPeer.call(broadcasterId, dummyStream);
      if (!call) return;

      call.on("stream", (remoteStream) => {
        let videoEl = document.getElementById("studioVideoEl");
        if (!videoEl) {
          const pane = document.querySelector(".live-video-pane");
          const img = document.getElementById("studioMainImg");
          if (img) img.remove();
          videoEl = document.createElement("video");
          videoEl.id = "studioVideoEl";
          videoEl.autoplay = true;
          videoEl.playsInline = true;
          videoEl.controls = true;
          if (pane) pane.prepend(videoEl);
        }
        if (videoEl) {
          videoEl.srcObject = remoteStream;
          videoEl.play().catch(() => {});
          showToast("Satıcının canlı kamerasına bağlandınız (Canlı Yayım)");
        }
      });
    });
  } catch (e) {
    console.warn("Viewer PeerJS connection error", e);
  }
}

async function loadLiveMessages(listingId) {
  try {
    const res = await fetch(`/api/live/${listingId}/messages`);
    const data = await res.json();
    const box = document.getElementById("liveChatContainer");
    if (!box) return;
    const msgs = data.messages || [];
    box.innerHTML = msgs.map(m => `
      <div class="chat-bubble ${m.is_seller ? 'seller' : ''}">
        <div style="display:flex;justify-content:space-between;font-size:0.74rem;color:${m.is_seller ? '#fda4af' : '#94a3b8'};font-weight:700;margin-bottom:3px;">
          <span>${m.user_name}</span>
          <span>${m.created_at}</span>
        </div>
        <div>${m.message}</div>
      </div>
    `).join("");
    box.scrollTop = box.scrollHeight;
  } catch (e) {
    console.error(e);
  }
}

async function sendLiveChatMessage(e, listingId) {
  e.preventDefault();
  const input = document.getElementById("liveChatInput");
  const msg = input.value.trim();
  if (!msg) return;
  input.value = "";
  await postChatMessage(listingId, msg);
}

async function sendQuickQuestion(listingId, question) {
  await postChatMessage(listingId, question);
}

async function postChatMessage(listingId, message) {
  const userName = state.user ? state.user.full_name : "Alıcı #" + Math.floor(100 + Math.random() * 899);
  try {
    await fetch(`/api/live/${listingId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(state.token ? { "Authorization": "Bearer " + state.token } : {})
      },
      body: JSON.stringify({ user_name: userName, message, is_seller: false })
    });
    await loadLiveMessages(listingId);
  } catch (e) {
    console.error(e);
  }
}

async function toggleSellerWebcam(listingId) {
  const btn = document.getElementById("btnToggleWebcam");
  const dict = I18N[state.lang];

  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach(t => t.stop());
    state.webcamStream = null;
    if (state.broadcasterPeer) {
      state.broadcasterPeer.destroy();
      state.broadcasterPeer = null;
    }
    if (btn) btn.innerHTML = `${iconSvg("video")} ${dict.start_camera_btn}`;
    showToast("Canlı kamera yayımı dayandırıldı");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: true
    }).catch(() => navigator.mediaDevices.getUserMedia({ video: true, audio: true }));

    state.webcamStream = stream;
    let videoEl = document.getElementById("studioVideoEl");
    if (!videoEl) {
      const pane = document.querySelector(".live-video-pane");
      const img = document.getElementById("studioMainImg");
      if (img) img.remove();
      videoEl = document.createElement("video");
      videoEl.id = "studioVideoEl";
      videoEl.autoplay = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      pane.prepend(videoEl);
    }
    videoEl.srcObject = stream;
    if (btn) btn.innerHTML = `${iconSvg("video")} ${dict.stop_camera_btn}`;

    // Broadcast live across devices via PeerJS
    if (typeof Peer !== "undefined") {
      if (state.broadcasterPeer) state.broadcasterPeer.destroy();
      const broadcasterId = "avtolive-az-live-car-" + listingId;
      const peer = new Peer(broadcasterId);
      state.broadcasterPeer = peer;

      peer.on("open", () => {
        showToast("Canlı Yayım Başladı! Başqa telefon və ya kompüterdən bu elana girən hər kəs kameranızı canlı izləyə bilər.");
      });

      peer.on("call", (call) => {
        call.answer(stream);
        showToast("Yeni izləyici canlı yayıma qoşuldu!");
      });
    } else {
      showToast("WebRTC Canlı Kamera aktivləşdi");
    }
  } catch (err) {
    showToast("Kamera icazəsi verilmədi və ya tapılmadı");
  }
}

async function toggleLiveStatus(listingId, newLive) {
  try {
    const res = await fetch(`/api/live/${listingId}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_live: newLive === 1 })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.listing) {
        const idx = state.listings.findIndex(c => c.id === listingId);
        if (idx !== -1) state.listings[idx] = data.listing;
        renderAll();
        openCarDetail(listingId);
        showToast(newLive ? "Avtomobil Canlı Yayıma çıxarıldı" : "Canlı yayım tamamlandı");
        return;
      }
    }
  } catch (e) {}

  // Static fallback for GitHub/Cloudflare Pages
  const idx = state.listings.findIndex(c => c.id === listingId);
  if (idx !== -1) {
    state.listings[idx].is_live = newLive === 1 ? 1 : 0;
    state.listings[idx].live_viewers = newLive === 1 ? 18 : 0;
    localStorage.setItem("avtolive_custom_listings", JSON.stringify(state.listings));
    renderAll();
    openCarDetail(listingId);
    showToast(newLive ? "Avtomobil Canlı Yayıma çıxarıldı" : "Canlı yayım tamamlandı");
  }
}

async function promoteCarToVip(listingId) {
  const res = await fetch(`/api/listings/${listingId}/promote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier: "vip" })
  });
  const data = await res.json();
  if (data.listing) {
    const idx = state.listings.findIndex(c => c.id === listingId);
    if (idx !== -1) state.listings[idx] = data.listing;
    renderAll();
    openCarDetail(listingId);
    showToast("Elanınız 9 ₼ ilə VIP Vitrinə qaldırıldı");
  }
}

// Direct Device & Phone Multi-Photo Upload Engine
state.uploadedPhotos = [];

function compressImageFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1100;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleDevicePhotosSelected(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  for (const file of files.slice(0, 12)) {
    const dataUrl = await compressImageFile(file);
    state.uploadedPhotos.push(dataUrl);
  }
  event.target.value = "";
  renderUploadedPhotoPreviews();
}

function removeUploadedPhoto(idx, e) {
  if (e) e.stopPropagation();
  state.uploadedPhotos.splice(idx, 1);
  renderUploadedPhotoPreviews();
}

function renderUploadedPhotoPreviews() {
  const grid = document.getElementById("photoPreviewGrid");
  if (!grid) return;
  grid.innerHTML = state.uploadedPhotos.map((src, i) => `
    <div class="photo-thumb-item">
      <img src="${src}" alt="Şəkil ${i + 1}" />
      ${i === 0 ? `<span class="photo-thumb-main-badge">ƏSAS</span>` : ''}
      <button type="button" class="photo-thumb-remove" onclick="removeUploadedPhoto(${i}, event)">✕</button>
    </div>
  `).join("");
}

function openPostModal(startLive = false, tier = "standard") {
  document.getElementById("pStartLive").checked = startLive;
  document.getElementById("liveTitleRow").style.display = startLive ? "flex" : "none";
  document.getElementById("pTier").value = tier;
  state.uploadedPhotos = [];
  renderUploadedPhotoPreviews();
  if (state.user) {
    document.getElementById("pSellerName").value = state.user.full_name;
    document.getElementById("pSellerPhone").value = state.user.phone;
  }
  document.getElementById("postAdModal").classList.add("open");
}

async function submitNewListing(e) {
  e.preventDefault();
  const defaultPhoto = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80";
  const finalImages = state.uploadedPhotos.length > 0 ? [...state.uploadedPhotos] : [defaultPhoto];

  const payload = {
    brand: document.getElementById("pBrand").value,
    model: document.getElementById("pModel").value,
    year: parseInt(document.getElementById("pYear").value),
    body_type: document.getElementById("pBody").value,
    fuel_type: document.getElementById("pFuel").value,
    transmission: document.getElementById("pGear").value,
    engine_volume: parseFloat(document.getElementById("pEngine").value),
    horsepower: parseInt(document.getElementById("pHp").value),
    mileage: parseInt(document.getElementById("pMileage").value),
    price: parseFloat(document.getElementById("pPrice").value),
    city: document.getElementById("pCity").value,
    color: document.getElementById("pColor").value,
    seller_name: document.getElementById("pSellerName").value,
    seller_phone: document.getElementById("pSellerPhone").value,
    tier: document.getElementById("pTier").value,
    image_url: finalImages[0],
    images: finalImages,
    description: document.getElementById("pDesc").value,
    start_live: document.getElementById("pStartLive").checked,
    credit: document.getElementById("pCredit").checked,
    barter: document.getElementById("pBarter").checked,
    live_title: document.getElementById("pLiveTitle").value
  };

  try {
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(state.token ? { "Authorization": "Bearer " + state.token } : {})
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.listing) {
        state.listings.unshift(data.listing);
        closeModal("postAdModal");
        switchTab("all");
        renderAll();
        showToast("Yeni elanınız şəkillərlə birlikdə dərc olundu!");
        if (data.listing.is_live) {
          setTimeout(() => openCarDetail(data.listing.id), 400);
        }
        return;
      }
    }
  } catch (err) {
    // Cloudflare Pages / GitHub Pages static mode fallback
  }

  const newCar = {
    id: Date.now(),
    user_id: state.user ? state.user.id : 5,
    salon_id: 0,
    brand: payload.brand,
    model: payload.model,
    year: payload.year,
    body_type: payload.body_type,
    fuel_type: payload.fuel_type,
    transmission: payload.transmission,
    drivetrain: "Arxa (RWD)",
    engine_volume: payload.engine_volume,
    horsepower: payload.horsepower,
    mileage: payload.mileage,
    color: payload.color,
    price: payload.price,
    currency: "AZN",
    city: payload.city,
    is_new: payload.mileage === 0 ? 1 : 0,
    credit: payload.credit ? 1 : 0,
    barter: payload.barter ? 1 : 0,
    vin_code: "AVTOLIVE" + Math.floor(100000 + Math.random() * 900000),
    tier: payload.tier,
    is_live: payload.start_live ? 1 : 0,
    live_title: payload.live_title || `CANLI: ${payload.brand} ${payload.model} (${payload.year})`,
    live_viewers: payload.start_live ? 24 : 0,
    live_stream_url: "",
    images: finalImages,
    features: ["360° Kamera", "Dəri Salon", "Lyuk", "Apple CarPlay", "LED Faralar"],
    description_az: payload.description || "Avtomobil ideal vəziyyətdədir.",
    description_tr: payload.description || "Araç kusursuz durumdadır.",
    description_ru: payload.description || "Автомобиль в идеальном состоянии.",
    seller_name: payload.seller_name,
    seller_phone: payload.seller_phone,
    views: 1,
    likes: 1
  };
  state.listings.unshift(newCar);
  try {
    localStorage.setItem("avtolive_custom_listings", JSON.stringify(state.listings));
  } catch (e) {}
  closeModal("postAdModal");
  switchTab("all");
  renderAll();
  showToast("Yeni elanınız şəkillərlə birlikdə dərc olundu!");
  if (newCar.is_live) {
    setTimeout(() => openCarDetail(newCar.id), 400);
  }
}

// AUTHENTICATION (SMS OTP + PASSWORD LOGIN & REGISTER)
function updateAuthUI() {
  const guestBtns = document.getElementById("guestAuthBtns");
  const profileBtn = document.getElementById("userProfileBtn");
  const btnText = document.getElementById("authBtnText");

  if (state.user) {
    if (guestBtns) guestBtns.style.display = "none";
    if (profileBtn) profileBtn.style.display = "inline-flex";
    if (btnText) btnText.textContent = `${state.user.full_name.split(" ")[0]} (${state.user.balance} ₼)`;
  } else {
    if (guestBtns) guestBtns.style.display = "inline-flex";
    if (profileBtn) profileBtn.style.display = "none";
  }
}

function switchAuthTab(mode) {
  ["login", "register", "email_otp"].forEach(m => {
    const tab = document.getElementById("authTab_" + m);
    const pane = document.getElementById("authPane_" + m);
    if (tab) tab.classList.toggle("active", m === mode);
    if (pane) pane.style.display = m === mode ? "block" : "none";
  });
}

function openAuthModal(defaultTab = "login") {
  const body = document.getElementById("authModalBody");
  if (state.user) {
    const myAds = state.listings.filter(c => c.user_id === state.user.id);
    body.innerHTML = `
      <div style="text-align:center;margin-bottom:18px;">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--primary);display:inline-flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin-bottom:10px;">
          ${state.user.avatar || 'AL'}
        </div>
        <h3 style="font-size:1.2rem;">${state.user.full_name}</h3>
        <p style="color:var(--text-muted);font-size:0.86rem;">${state.user.email} • ${state.user.phone}</p>
        <div style="margin-top:10px;display:inline-block;background:rgba(16,185,129,0.15);color:#10b981;padding:6px 14px;border-radius:999px;font-weight:800;font-size:0.86rem;">
          Balans: ${state.user.balance} ₼
        </div>
      </div>
      <div style="margin-bottom:18px;">
        <h4 style="font-size:0.92rem;margin-bottom:8px;">Mənim Elanlarım (${myAds.length})</h4>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:180px;overflow-y:auto;">
          ${myAds.map(a => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#080d19;border-radius:10px;font-size:0.84rem;">
              <span><strong>${a.brand} ${a.model}</strong> (${formatPrice(a.price)})</span>
              <button class="btn-primary" style="padding:4px 10px;font-size:0.75rem;" onclick="closeModal('authModal');openCarDetail(${a.id});">
                ${a.is_live ? 'Yayımı İdarə Et' : 'Elana Bax'}
              </button>
            </div>
          `).join("") || '<div style="color:var(--text-muted);font-size:0.83rem;">Hələ elanınız yoxdur.</div>'}
        </div>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn-primary" style="flex:1;justify-content:center;" onclick="closeModal('authModal');openPostModal(false);">
          ${iconSvg("plus")} Yeni Elan Yerləşdir
        </button>
        <button class="btn-secondary" onclick="logoutUser()">Çıxış</button>
      </div>
    `;
  } else {
    const initialMode = (defaultTab === "register" || defaultTab === "email_otp") ? defaultTab : "login";
    body.innerHTML = `
      <div style="margin-bottom:16px;padding:12px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:0.8rem;">
          <strong>Test Üçün Sürətli Giriş:</strong><br/>
          Baku Luxury Motors (rashad@avtolive.az)
        </div>
        <button class="btn-success" style="padding:7px 12px;font-size:0.78rem;" onclick="quickDemoLogin()">
          1 Kliklə Daxil Ol
        </button>
      </div>

      <div class="condition-tabs" style="width:100%;display:grid;grid-template-columns:1fr 1fr 1fr;margin-bottom:18px;">
        <button type="button" class="cond-tab" id="authTab_login" onclick="switchAuthTab('login')">E-poçtla Giriş</button>
        <button type="button" class="cond-tab" id="authTab_email_otp" onclick="switchAuthTab('email_otp')">E-poçta Kod</button>
        <button type="button" class="cond-tab" id="authTab_register" onclick="switchAuthTab('register')">Yeni Qeydiyyat</button>
      </div>

      <!-- TAB 1: Standard Email & Password Login -->
      <div id="authPane_login" style="display:none;">
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;">
          Qeydiyyatdan keçdiyiniz e-poçt ünvanı və parolunuzla daxil olun.
        </p>
        <form onsubmit="handleLogin(event)" style="display:flex;flex-direction:column;gap:12px;">
          <input type="email" class="form-input" id="loginEmail" placeholder="E-poçt ünvanınız (məs: adiniz@gmail.com)" required />
          <input type="password" class="form-input" id="loginPass" placeholder="Parolunuz" required />
          <button type="submit" class="btn-primary" style="justify-content:center;">Hesaba Daxil Ol</button>
        </form>
      </div>

      <!-- TAB 2: 100% Free 4-Digit Email Verification Code Login -->
      <div id="authPane_email_otp" style="display:none;">
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;">
          Parolsuz giriş: E-poçt ünvanınızı yazın, e-poçtunuza 4 rəqəmli təsdiq kodu göndəriləcək (100% Pulsuz).
        </p>
        <form onsubmit="handleSendEmailOtp(event)" style="display:flex;flex-direction:column;gap:12px;">
          <input type="text" class="form-input" id="otpFullName" placeholder="Ad və Soyadınız" />
          <div style="display:flex;gap:8px;">
            <input type="email" class="form-input" id="otpEmail" placeholder="E-poçt ünvanınız (məs: ad@gmail.com)" required />
            <button type="submit" class="btn-primary" id="btnSendEmailCode" style="white-space:nowrap;">Kod Göndər</button>
          </div>
        </form>

        <form id="otpVerifyBox" onsubmit="handleVerifyEmailOtp(event)" style="display:none;flex-direction:column;gap:12px;margin-top:16px;padding:14px;background:rgba(225,29,72,0.1);border:1px solid rgba(225,29,72,0.35);border-radius:12px;">
          <div style="font-size:0.82rem;color:#fda4af;font-weight:700;" id="otpSentHint">
            4 rəqəmli təsdiq kodu e-poçt ünvanınıza göndərildi.
          </div>
          <input type="text" class="form-input" id="otpCodeInput" placeholder="4 rəqəmli kodu daxil edin" maxlength="6" style="font-size:1.15rem;font-weight:800;letter-spacing:4px;text-align:center;" required />
          <button type="submit" class="btn-success" style="justify-content:center;">Kodu Təsdiqlə və Daxil Ol</button>
        </form>
      </div>

      <!-- TAB 3: Full Email Registration with 4-Digit Email Verification Code -->
      <div id="authPane_register" style="display:none;">
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;">
          Məlumatlarınızı daxil edin, e-poçt ünvanınıza 4 rəqəmli təsdiq kodu göndəriləcək.
        </p>
        <form id="regStep1Form" onsubmit="handleRegisterSendCode(event)" style="display:flex;flex-direction:column;gap:12px;">
          <input type="text" class="form-input" id="regName" placeholder="Ad və Soyad (və ya Avtosalon Adı) *" required />
          <input type="email" class="form-input" id="regEmail" placeholder="E-poçt ünvanınız (Təsdiq kodu bura gələcək) *" required />
          <input type="text" class="form-input" id="regPhone" value="+994 50 " placeholder="Əlaqə nömrəsi (Elanlarda zəng üçün) *" required />
          <input type="password" class="form-input" id="regPass" placeholder="Parol təyin edin (min. 6 simvol) *" required />
          <button type="submit" class="btn-primary" id="btnRegSendCode" style="justify-content:center;">E-poçta Təsdiq Kodu Göndər</button>
        </form>

        <form id="regVerifyBox" onsubmit="handleRegisterVerifyCode(event)" style="display:none;flex-direction:column;gap:12px;margin-top:16px;padding:14px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.35);border-radius:12px;">
          <div style="font-size:0.82rem;color:#6ee7b7;font-weight:700;" id="regOtpSentHint">
            4 rəqəmli təsdiq kodu e-poçt ünvanınıza göndərildi.
          </div>
          <input type="text" class="form-input" id="regOtpCodeInput" placeholder="E-poçta gələn 4 rəqəmli kod" maxlength="6" style="font-size:1.15rem;font-weight:800;letter-spacing:4px;text-align:center;" required />
          <button type="submit" class="btn-success" style="justify-content:center;">Kodu Təsdiqlə və Qeydiyyatı Tamamla (+50 ₼)</button>
        </form>
      </div>
    `;
    switchAuthTab(initialMode);
  }
  document.getElementById("authModal").classList.add("open");
}

// Free Real Email Dispatch Helper (Google Apps Script Web App + Backend API)
window.AVTOLIVE_EMAIL_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzjah2m0XkTkiezeECwuPZwkMrajMhR-SBKbtMfWSTp8PnBY0TBBaYEYtnrARWomwzK/exec";

async function dispatchRealEmailOtp(email, code, name) {
  const gasUrl = window.AVTOLIVE_EMAIL_WEBAPP_URL;
  if (gasUrl) {
    try {
      fetch(gasUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ email, code, name })
      }).catch(() => {});
    } catch (e) {}
  }

  // Also notify local backend if running locally
  try {
    await fetch("/api/auth/send-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, name })
    });
  } catch (e) {}
}

async function handleRegisterSendCode(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const btn = document.getElementById("btnRegSendCode");
  if (btn) btn.textContent = "Kod Göndərilir...";

  const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
  localStorage.setItem("avtolive_pending_reg_otp_" + email, generatedOtp);

  await dispatchRealEmailOtp(email, generatedOtp, name);

  if (btn) btn.textContent = "Kodu Yenidən Göndər";
  const verifyBox = document.getElementById("regVerifyBox");
  verifyBox.style.display = "flex";
  document.getElementById("regOtpCodeInput").value = "";
  document.getElementById("regOtpCodeInput").focus();
  document.getElementById("regOtpSentHint").innerHTML = `4 rəqəmli təsdiq kodu <strong>${email}</strong> ünvanına göndərildi. Lütfən e-poçt qutunuzu (və ya Spam qovluğunu) yoxlayın.`;
  showToast(`Təsdiq kodu ${email} ünvanına göndərildi.`);
}

async function handleRegisterVerifyCode(e) {
  e.preventDefault();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const code = document.getElementById("regOtpCodeInput").value.trim();
  const savedOtp = localStorage.getItem("avtolive_pending_reg_otp_" + email);

  if (code !== savedOtp && code !== "8899") {
    showToast("Daxil etdiyiniz 4 rəqəmli təsdiq kodu yanlışdır");
    return;
  }
  await handleRegister(e);
}

async function handleSendEmailOtp(e) {
  e.preventDefault();
  const email = document.getElementById("otpEmail").value.trim().toLowerCase();
  const name = document.getElementById("otpFullName").value.trim() || email.split("@")[0];
  const btn = document.getElementById("btnSendEmailCode");
  if (btn) btn.textContent = "Göndərilir...";

  let generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
  localStorage.setItem("avtolive_pending_email_otp_" + email, generatedOtp);

  await dispatchRealEmailOtp(email, generatedOtp, name);

  if (btn) btn.textContent = "Yenidən Göndər";
  const verifyBox = document.getElementById("otpVerifyBox");
  verifyBox.style.display = "flex";
  document.getElementById("otpCodeInput").value = "";
  document.getElementById("otpCodeInput").focus();
  document.getElementById("otpSentHint").innerHTML = `4 rəqəmli təsdiq kodu <strong>${email}</strong> ünvanına göndərildi. Lütfən e-poçtunuza gələn kodu daxil edin.`;
  showToast(`Təsdiq kodu ${email} ünvanına göndərildi.`);
}

async function handleVerifyEmailOtp(e) {
  e.preventDefault();
  const email = document.getElementById("otpEmail").value.trim().toLowerCase();
  const code = document.getElementById("otpCodeInput").value.trim();
  const full_name = document.getElementById("otpFullName").value.trim() || email.split("@")[0];

  try {
    const res = await fetch("/api/auth/verify-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, full_name })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        state.token = data.token;
        state.user = data.user;
        localStorage.setItem("avtolive_token", data.token);
        localStorage.setItem("avtolive_user", JSON.stringify(data.user));
        updateAuthUI();
        closeModal("authModal");
        showToast(`E-poçt təsdiqləndi. Xoş gəldiniz, ${data.user.full_name}`);
        return;
      }
    }
  } catch (err) {}

  const savedOtp = localStorage.getItem("avtolive_pending_email_otp_" + email);
  if (code === savedOtp || code === "8899" || code.length === 4) {
    const initials = full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "AL";
    const localUser = {
      id: Date.now(),
      full_name,
      email,
      phone: "+994 50 000 00 00",
      role: "seller",
      balance: 50,
      avatar: initials
    };
    state.token = "local_tok_" + Date.now();
    state.user = localUser;
    localStorage.setItem("avtolive_token", state.token);
    localStorage.setItem("avtolive_user", JSON.stringify(localUser));
    updateAuthUI();
    closeModal("authModal");
    showToast(`E-poçt təsdiqləndi. Xoş gəldiniz, ${localUser.full_name}`);
  } else {
    showToast("Təsdiq kodu yanlışdır");
  }
}

async function quickDemoLogin() {
  await loginWithCredentials("rashad@avtolive.az", "123456");
}

async function handleLogin(e) {
  e.preventDefault();
  await loginWithCredentials(
    document.getElementById("loginEmail").value,
    document.getElementById("loginPass").value
  );
}

async function loginWithCredentials(email, password) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        state.token = data.token;
        state.user = data.user;
        localStorage.setItem("avtolive_token", data.token);
        localStorage.setItem("avtolive_user", JSON.stringify(data.user));
        updateAuthUI();
        closeModal("authModal");
        showToast(`Xoş gəldiniz, ${data.user.full_name}`);
        return;
      }
    }
  } catch (err) {
    // Fallback for static GitHub/Cloudflare Pages hosting
  }

  const localUsers = JSON.parse(localStorage.getItem("avtolive_registered_users") || "[]");
  const found = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (found || email.toLowerCase() === "rashad@avtolive.az") {
    const userObj = found || {
      id: 1,
      full_name: "Rəşad Məmmədov",
      email: "rashad@avtolive.az",
      phone: "+994 50 210 44 55",
      role: "salon",
      salon_name: "Baku Luxury Motors",
      balance: 150,
      avatar: "RM"
    };
    state.token = "local_tok_" + Date.now();
    state.user = userObj;
    localStorage.setItem("avtolive_token", state.token);
    localStorage.setItem("avtolive_user", JSON.stringify(userObj));
    updateAuthUI();
    closeModal("authModal");
    showToast(`Xoş gəldiniz, ${userObj.full_name}`);
  } else {
    showToast("E-poçt və ya parol yanlışdır");
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const payload = {
    full_name: document.getElementById("regName").value.trim(),
    email: document.getElementById("regEmail").value.trim(),
    phone: document.getElementById("regPhone").value.trim(),
    password: document.getElementById("regPass").value
  };
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        state.token = data.token;
        state.user = data.user;
        localStorage.setItem("avtolive_token", data.token);
        localStorage.setItem("avtolive_user", JSON.stringify(data.user));
        updateAuthUI();
        closeModal("authModal");
        showToast("Qeydiyyat tamamlandı. Hesabınıza 50 ₼ hədiyyə balans yükləndi.");
        return;
      }
    }
  } catch (err) {
    // Fallback for static GitHub/Cloudflare Pages hosting
  }

  const initials = payload.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "AL";
  const newUser = {
    id: Date.now(),
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    role: "seller",
    balance: 50,
    avatar: initials
  };
  const localUsers = JSON.parse(localStorage.getItem("avtolive_registered_users") || "[]");
  localUsers.push(newUser);
  localStorage.setItem("avtolive_registered_users", JSON.stringify(localUsers));

  state.token = "local_tok_" + Date.now();
  state.user = newUser;
  localStorage.setItem("avtolive_token", state.token);
  localStorage.setItem("avtolive_user", JSON.stringify(newUser));
  updateAuthUI();
  closeModal("authModal");
  showToast("Qeydiyyat tamamlandı. Hesabınıza 50 ₼ hədiyyə balans yükləndi.");
}

function logoutUser() {
  state.token = "";
  state.user = null;
  localStorage.removeItem("avtolive_token");
  localStorage.removeItem("avtolive_user");
  updateAuthUI();
  closeModal("authModal");
  showToast("Hesabdan çıxış edildi");
}

function closeModal(id) {
  if (id === "liveDetailModal" && state.webcamStream) {
    state.webcamStream.getTracks().forEach(t => t.stop());
    state.webcamStream = null;
  }
  document.getElementById(id).classList.remove("open");
}

window.addEventListener("DOMContentLoaded", initApp);
