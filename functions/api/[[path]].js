// Cloudflare Pages Function + Cloudflare D1 SQL Database Backend for avtolive.az
// Handles: /api/init, /api/auth/register, /api/auth/login, /api/auth/verify-email-otp,
//          /api/listings, /api/live/:id/messages, /api/live/:id/toggle, /api/listings/:id/promote

async function sha256(str) {
  const buf = new TextEncoder().encode("avtolive_salt_" + str);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function randomHex(len = 24) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

async function ensureSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'seller',
      salon_name TEXT DEFAULT '',
      balance REAL DEFAULT 50.0,
      verified INTEGER DEFAULT 1,
      avatar TEXT DEFAULT 'AL',
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      salon_id INTEGER DEFAULT 0,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      body_type TEXT NOT NULL,
      fuel_type TEXT NOT NULL,
      transmission TEXT NOT NULL,
      drivetrain TEXT DEFAULT 'Tam (AWD)',
      engine_volume REAL NOT NULL,
      horsepower INTEGER NOT NULL,
      mileage INTEGER NOT NULL,
      color TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT DEFAULT 'AZN',
      city TEXT NOT NULL,
      is_new INTEGER DEFAULT 0,
      credit INTEGER DEFAULT 0,
      barter INTEGER DEFAULT 0,
      vin_code TEXT DEFAULT '',
      tier TEXT DEFAULT 'standard',
      is_live INTEGER DEFAULT 0,
      live_title TEXT DEFAULT '',
      live_viewers INTEGER DEFAULT 0,
      live_stream_url TEXT DEFAULT '',
      images TEXT NOT NULL,
      features TEXT NOT NULL,
      description_az TEXT NOT NULL,
      description_tr TEXT NOT NULL,
      description_ru TEXT NOT NULL,
      seller_name TEXT NOT NULL,
      seller_phone TEXT NOT NULL,
      views INTEGER DEFAULT 120,
      likes INTEGER DEFAULT 14,
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS live_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      message TEXT NOT NULL,
      is_seller INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `).run();

  // Clean up test users if still present
  await db.prepare("DELETE FROM users WHERE email IN ('rashad@avtolive.az', 'testcheck@gmail.com')").run();
}

function parseListingRow(r) {
  const copy = { ...r };
  try { copy.images = typeof r.images === "string" ? JSON.parse(r.images) : (r.images || []); } catch (e) { copy.images = []; }
  try { copy.features = typeof r.features === "string" ? JSON.parse(r.features) : (r.features || []); } catch (e) { copy.features = []; }
  return copy;
}

async function getCurrentUser(db, request) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  const user = await db.prepare(`
    SELECT u.id, u.full_name, u.email, u.phone, u.role, u.salon_name, u.balance, u.verified, u.avatar
    FROM sessions s JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `).bind(token).first();
  return user || null;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  const db = env.DB;
  if (!db) {
    return jsonResp({ error: "D1 Database binding (DB) not configured yet" }, 503);
  }

  await ensureSchema(db);
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "GET") {
    if (path === "/api/init") {
      const { results } = await db.prepare("SELECT * FROM listings ORDER BY is_live DESC, id DESC").all();
      const dbListings = (results || []).map(parseListingRow);
      const user = await getCurrentUser(db, request);
      return jsonResp({ db_listings: dbListings, user });
    }

    if (path === "/api/users") {
      const { results } = await db.prepare("SELECT id, full_name, email, phone, role, salon_name, balance, created_at FROM users ORDER BY id DESC").all();
      return jsonResp({ users: results || [] });
    }

    if (path.startsWith("/api/live/") && path.endsWith("/toggle")) {
      const listingId = parseInt(path.split("/")[3]) || 0;
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Canlı yayım açmaq üçün hesabınıza daxil olun" }, 401);
      const existing = await db.prepare("SELECT * FROM listings WHERE id = ?").bind(listingId).first();
      if (!existing) return jsonResp({ error: "Elan tapılmadı" }, 404);
      if (existing.user_id !== user.id) {
        return jsonResp({ error: "Yalnız öz elanınızda canlı yayım aça bilərsiniz" }, 403);
      }
      const newLive = data.is_live ? 1 : 0;
      const newViewers = newLive ? Math.max(1, existing.live_viewers || 1) : 0;
      const newTitle = newLive ? (existing.live_title || `CANLI: ${existing.brand} ${existing.model} (${existing.year})`) : existing.live_title;
      await db.prepare("UPDATE listings SET is_live = ?, live_viewers = ?, live_title = ? WHERE id = ?")
        .bind(newLive, newViewers, newTitle, listingId).run();
      const updated = await db.prepare("SELECT * FROM listings WHERE id = ?").bind(listingId).first();
      return jsonResp({ listing: parseListingRow(updated) });
    }

    if (path.startsWith("/api/live/") && path.endsWith("/messages")) {
      const listingId = parseInt(path.split("/")[3]) || 0;
      const { results } = await db.prepare("SELECT * FROM live_messages WHERE listing_id = ? ORDER BY id ASC").bind(listingId).all();
      return jsonResp({ messages: results || [] });
    }
  }

  if (request.method === "POST") {
    let data = {};
    try { data = await request.json(); } catch (e) {}

    if (path === "/api/auth/check-email" || path === "/api/auth/check-availability") {
      const email = (data.email || "").trim().toLowerCase();
      const phoneDigits = String(data.phone || "").replace(/\D/g, "");
      let emailTaken = false;
      let phoneTaken = false;
      if (email) {
        const e = await db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").bind(email).first();
        emailTaken = Boolean(e);
      }
      if (phoneDigits.length >= 9) {
        const { results } = await db.prepare("SELECT phone FROM users").all();
        phoneTaken = (results || []).some(r => String(r.phone || "").replace(/\D/g, "") === phoneDigits);
      }
      return jsonResp({ exists: emailTaken, email_taken: emailTaken, phone_taken: phoneTaken });
    }

    if (path === "/api/auth/register") {
      const full_name = (data.full_name || "").trim();
      const email = (data.email || "").trim().toLowerCase();
      const phone = (data.phone || "+994 50 000 00 00").trim();
      const password = data.password || "";
      if (!full_name || !email || !password) {
        return jsonResp({ error: "Bütün xanaları doldurun" }, 400);
      }

      const initials = full_name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "AL";
      const passHash = await sha256(password);
      const now = new Date().toISOString();

      const existing = await db.prepare("SELECT id, verified FROM users WHERE LOWER(email) = ?").bind(email).first();
      if (existing) {
        // Only allow finishing step 2 verification if step === 'verify_code' AND existing.verified === 0
        if (data.step === "verify_code" && existing.verified === 0) {
          await db.prepare("UPDATE users SET verified = 1 WHERE id = ?").bind(existing.id).run();
          const token = randomHex(24);
          await db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").bind(token, existing.id, now).run();
          const user = await db.prepare("SELECT id, full_name, email, phone, role, salon_name, balance, verified, avatar FROM users WHERE id = ?").bind(existing.id).first();
          return jsonResp({ token, user }, 200);
        }
        return jsonResp({
          error: "Bu e-poçt ünvanı artıq qeydiyyatdan keçib! Bir e-poçt ilə yalnız bir dəfə qeydiyyat olmaq mümkündür.",
          already_exists: true
        }, 409);
      }

      const newPhoneDigits = phone.replace(/\D/g, "");
      if (newPhoneDigits.length >= 9) {
        const { results: phoneRows } = await db.prepare("SELECT phone FROM users").all();
        if ((phoneRows || []).some(r => String(r.phone || "").replace(/\D/g, "") === newPhoneDigits)) {
          return jsonResp({
            error: "Bu telefon nömrəsi artıq qeydiyyatdan keçib! Bir nömrə ilə yalnız bir dəfə qeydiyyat olmaq mümkündür.",
            phone_taken: true,
            already_exists: true
          }, 409);
        }
      }

      const verifiedFlag = data.verified === 0 ? 0 : 1;
      const res = await db.prepare(`
        INSERT INTO users (full_name, email, phone, password_hash, role, salon_name, balance, verified, avatar, created_at)
        VALUES (?, ?, ?, ?, 'seller', '', 50.0, ?, ?, ?)
      `).bind(full_name, email, phone, passHash, verifiedFlag, initials, now).run();
      const userId = res.meta.last_row_id;

      const token = randomHex(24);
      await db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").bind(token, userId, now).run();
      const user = await db.prepare("SELECT id, full_name, email, phone, role, salon_name, balance, verified, avatar FROM users WHERE id = ?").bind(userId).first();
      return jsonResp({ token, user }, 201);
    }

    if (path === "/api/auth/login") {
      const identifier = (data.identifier || data.email || data.phone || "").trim();
      const password = data.password || "";
      const passHash = await sha256(password);

      let user = null;
      if (identifier.includes("@")) {
        user = await db.prepare(`
          SELECT id, full_name, email, phone, role, salon_name, balance, verified, avatar
          FROM users WHERE LOWER(email) = ? AND password_hash = ?
        `).bind(identifier.toLowerCase(), passHash).first();
      } else {
        const digits = identifier.replace(/\D/g, "");
        if (digits.length >= 9) {
          const { results } = await db.prepare(`
            SELECT id, full_name, email, phone, role, salon_name, balance, verified, avatar
            FROM users WHERE password_hash = ?
          `).bind(passHash).all();
          const last9 = digits.slice(-9);
          user = (results || []).find(u => {
            const uDigits = String(u.phone || "").replace(/\D/g, "");
            return uDigits === digits || (uDigits.length >= 9 && uDigits.slice(-9) === last9);
          }) || null;
        }
      }

      if (!user) {
        return jsonResp({ error: "E-poçt / nömrə və ya parol yanlışdır" }, 401);
      }

      const token = randomHex(24);
      const now = new Date().toISOString();
      await db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").bind(token, user.id, now).run();
      return jsonResp({ token, user });
    }

    if (path === "/api/auth/reset-password") {
      const email = (data.email || "").trim().toLowerCase();
      const newPassword = data.new_password || "";
      if (!email || newPassword.length < 6) {
        return jsonResp({ error: "E-poçt və minimum 6 simvollu yeni parol daxil edin" }, 400);
      }
      const user = await db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").bind(email).first();
      if (!user) {
        return jsonResp({ error: "Bu e-poçt ünvanı ilə istifadəçi tapılmadı" }, 404);
      }
      const newHash = await sha256(newPassword);
      await db.prepare("UPDATE users SET password_hash = ?, verified = 1 WHERE id = ?").bind(newHash, user.id).run();
      return jsonResp({ success: true });
    }

    if (path === "/api/auth/send-email-otp" || path === "/api/auth/verify-email-otp") {
      const email = (data.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return jsonResp({ error: "Düzgün e-poçt daxil edin" }, 400);
      }
      const full_name = (data.name || data.full_name || email.split("@")[0] || "İstifadəçi").trim();
      const now = new Date().toISOString();

      let user = await db.prepare("SELECT id, full_name, email, phone, role, salon_name, balance, verified, avatar FROM users WHERE LOWER(email) = ?").bind(email).first();
      if (!user) {
        const initials = full_name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "AL";
        const passHash = await sha256(data.code || "otp");
        const res = await db.prepare(`
          INSERT INTO users (full_name, email, phone, password_hash, role, salon_name, balance, verified, avatar, created_at)
          VALUES (?, ?, '+994 50 000 00 00', ?, 'seller', '', 50.0, 1, ?, ?)
        `).bind(full_name, email, passHash, initials, now).run();
        user = await db.prepare("SELECT id, full_name, email, phone, role, salon_name, balance, verified, avatar FROM users WHERE id = ?").bind(res.meta.last_row_id).first();
      }

      if (path === "/api/auth/send-email-otp") {
        return jsonResp({ sent: true, user });
      }

      const token = randomHex(24);
      await db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").bind(token, user.id, now).run();
      return jsonResp({ token, user });
    }

    if (path === "/api/listings") {
      const user = await getCurrentUser(db, request);
      if (!user) {
        return jsonResp({ error: "Elan paylaşmaq üçün əvvəlcə hesabınıza daxil olun" }, 401);
      }
      const userId = user.id;
      const seller_name = user.full_name || data.seller_name || "AvtoLive İstifadəçi";
      const seller_phone = user.phone || data.seller_phone || "+994 50 000 00 00";
      const brand = data.brand || "BMW";
      const model = data.model || "530e";
      const year = parseInt(data.year) || 2024;
      const body_type = data.body_type || "Sedan";
      const fuel_type = data.fuel_type || "Benzin";
      const transmission = data.transmission || "Avtomat";
      const engine_volume = parseFloat(data.engine_volume) || 2.0;
      const horsepower = parseInt(data.horsepower) || 250;
      const mileage = parseInt(data.mileage) || 0;
      const color = data.color || "Qara (Metolik)";
      const price = parseFloat(data.price) || 45000;
      const city = data.city || "Bakı";
      const is_new = mileage === 0 ? 1 : 0;
      const credit = data.credit ? 1 : 0;
      const barter = data.barter ? 1 : 0;
      const tier = data.tier || "standard";
      const is_live = data.start_live ? 1 : 0;
      const live_title = is_live ? (data.live_title || `CANLI: ${brand} ${model} (${year})`) : "";
      const live_viewers = is_live ? 28 : 0;
      const imagesArr = Array.isArray(data.images) && data.images.length > 0
        ? data.images
        : [data.image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80"];
      const images = JSON.stringify(imagesArr);
      const features = JSON.stringify(data.features || ["360° Kamera", "Dəri Salon", "Lyuk", "Apple CarPlay", "LED Faralar"]);
      const desc = data.description || "Avtomobil ideal vəziyyətdədir.";
      const now = new Date().toISOString();

      const res = await db.prepare(`
        INSERT INTO listings (
          user_id, salon_id, brand, model, year, body_type, fuel_type, transmission, drivetrain,
          engine_volume, horsepower, mileage, color, price, currency, city, is_new, credit, barter,
          vin_code, tier, is_live, live_title, live_viewers, live_stream_url, images, features,
          description_az, description_tr, description_ru, seller_name, seller_phone, views, likes, created_at
        ) VALUES (?, 0, ?, ?, ?, ?, ?, ?, 'Tam (AWD)', ?, ?, ?, ?, ?, 'AZN', ?, ?, ?, ?, 'AVTOLIVE2026', ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
      `).bind(
        userId, brand, model, year, body_type, fuel_type, transmission,
        engine_volume, horsepower, mileage, color, price, city, is_new, credit, barter,
        tier, is_live, live_title, live_viewers, images, features,
        desc, desc, desc, seller_name, seller_phone, now
      ).run();

      const row = await db.prepare("SELECT * FROM listings WHERE id = ?").bind(res.meta.last_row_id).first();
      return jsonResp({ listing: parseListingRow(row) }, 201);
    }

    if (path.startsWith("/api/live/") && path.endsWith("/toggle")) {
      const listingId = parseInt(path.split("/")[3]) || 0;
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Canlı yayım açmaq üçün hesabınıza daxil olun" }, 401);
      const existing = await db.prepare("SELECT * FROM listings WHERE id = ?").bind(listingId).first();
      if (!existing) return jsonResp({ error: "Elan tapılmadı" }, 404);
      if (existing.user_id !== user.id) {
        return jsonResp({ error: "Yalnız öz elanınızda canlı yayım aça bilərsiniz" }, 403);
      }
      const newLive = data.is_live ? 1 : 0;
      const newViewers = newLive ? Math.max(1, existing.live_viewers || 1) : 0;
      const newTitle = newLive ? (existing.live_title || `CANLI: ${existing.brand} ${existing.model} (${existing.year})`) : existing.live_title;
      await db.prepare("UPDATE listings SET is_live = ?, live_viewers = ?, live_title = ? WHERE id = ?")
        .bind(newLive, newViewers, newTitle, listingId).run();
      const updated = await db.prepare("SELECT * FROM listings WHERE id = ?").bind(listingId).first();
      return jsonResp({ listing: parseListingRow(updated) });
    }

    if (path.startsWith("/api/live/") && path.endsWith("/messages")) {
      const listingId = parseInt(path.split("/")[3]) || 0;
      const user_name = data.user_name || "Alıcı";
      const message = (data.message || "").trim();
      if (!message) return jsonResp({ error: "Boş mesaj" }, 400);
      const nowTime = new Date().toTimeString().slice(0, 5);
      const res = await db.prepare(`
        INSERT INTO live_messages (listing_id, user_name, message, is_seller, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(listingId, user_name, message, data.is_seller ? 1 : 0, nowTime).run();
      const msg = await db.prepare("SELECT * FROM live_messages WHERE id = ?").bind(res.meta.last_row_id).first();
      return jsonResp({ message: msg }, 201);
    }
  }

  if (request.method === "PUT") {
    let data = {};
    try { data = await request.json(); } catch (e) {}

    if (path === "/api/auth/profile") {
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Giriş tələb olunur" }, 401);
      const full_name = (data.full_name || user.full_name).trim();
      const phone = (data.phone || user.phone).trim();
      const phoneDigits = phone.replace(/\D/g, "");
      if (phoneDigits.length >= 9) {
        const { results: others } = await db.prepare("SELECT id, phone FROM users WHERE id != ?").bind(user.id).all();
        if ((others || []).some(u => (u.phone || "").replace(/\D/g, "") === phoneDigits)) {
          return jsonResp({ error: "Bu telefon nömrəsi başqa hesabda istifadə olunur" }, 409);
        }
      }
      const initials = full_name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || user.avatar;
      await db.prepare("UPDATE users SET full_name = ?, phone = ?, avatar = ? WHERE id = ?").bind(full_name, phone, initials, user.id).run();
      const updated = await db.prepare("SELECT id, full_name, email, phone, role, salon_name, balance, verified, avatar FROM users WHERE id = ?").bind(user.id).first();
      return jsonResp({ user: updated });
    }

    if (path.startsWith("/api/listings/")) {
      const listingId = parseInt(path.split("/")[3]) || 0;
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Giriş tələb olunur" }, 401);
      const existing = await db.prepare("SELECT * FROM listings WHERE id = ?").bind(listingId).first();
      if (!existing) return jsonResp({ error: "Elan tapılmadı" }, 404);
      if (existing.user_id !== user.id) return jsonResp({ error: "Bu elanı redaktə etmək icazəniz yoxdur" }, 403);

      const price = parseFloat(data.price) || existing.price;
      const city = (data.city || existing.city).trim();
      const mileage = data.mileage !== undefined ? (parseInt(data.mileage) || 0) : existing.mileage;
      const desc = (data.description !== undefined ? data.description : existing.description_az).trim();
      const credit = data.credit !== undefined ? (data.credit ? 1 : 0) : existing.credit;
      const barter = data.barter !== undefined ? (data.barter ? 1 : 0) : existing.barter;

      await db.prepare(`
        UPDATE listings SET price = ?, city = ?, mileage = ?, description_az = ?, description_tr = ?, description_ru = ?, credit = ?, barter = ?
        WHERE id = ?
      `).bind(price, city, mileage, desc, desc, desc, credit, barter, listingId).run();

      const updated = await db.prepare("SELECT * FROM listings WHERE id = ?").bind(listingId).first();
      return jsonResp({ listing: parseListingRow(updated) });
    }
  }

  if (request.method === "DELETE") {
    if (path.startsWith("/api/listings/")) {
      const listingId = parseInt(path.split("/")[3]) || 0;
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Giriş tələb olunur" }, 401);
      const existing = await db.prepare("SELECT id, user_id FROM listings WHERE id = ?").bind(listingId).first();
      if (!existing) return jsonResp({ error: "Elan tapılmadı" }, 404);
      if (existing.user_id !== user.id) return jsonResp({ error: "Bu elanı silmək icazəniz yoxdur" }, 403);
      await db.prepare("DELETE FROM listings WHERE id = ?").bind(listingId).run();
      await db.prepare("DELETE FROM live_messages WHERE listing_id = ?").bind(listingId).run();
      return jsonResp({ deleted: true, id: listingId });
    }
  }

  return jsonResp({ status: "ok" });
    }
