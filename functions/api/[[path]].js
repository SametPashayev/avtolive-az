// Cloudflare Pages Function + Cloudflare D1 SQL Database Backend for TəklifAl.az
// Reverse Marketplace for Home Repair, Appliance, Plumbing, Electrical & Auto Services in Azerbaijan

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
      role TEXT DEFAULT 'customer',
      salon_name TEXT DEFAULT '',
      balance REAL DEFAULT 50.0,
      verified INTEGER DEFAULT 1,
      avatar TEXT DEFAULT 'TA',
      created_at TEXT NOT NULL
    )
  `).run();

  // Safely add master columns to users table if upgrading from previous schema
  const alterCols = [
    "ALTER TABLE users ADD COLUMN specialty TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN rating REAL DEFAULT 5.0",
    "ALTER TABLE users ADD COLUMN jobs_done INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN is_pro INTEGER DEFAULT 0"
  ];
  for (const sql of alterCols) {
    try { await db.prepare(sql).run(); } catch (e) {}
  }

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();

  // Drop old car marketplace tables cleanly
  const dropOld = [
    "DROP TABLE IF EXISTS listings",
    "DROP TABLE IF EXISTS live_messages",
    "DROP TABLE IF EXISTS live_streams",
    "DROP TABLE IF EXISTS showroom_messages"
  ];
  for (const sql of dropOld) {
    try { await db.prepare(sql).run(); } catch (e) {}
  }

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT DEFAULT '',
      urgency TEXT DEFAULT 'Təcili — Bu gün',
      budget REAL DEFAULT 0,
      images TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      accepted_bid_id INTEGER DEFAULT 0,
      offers_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS service_bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      master_id INTEGER NOT NULL,
      master_name TEXT NOT NULL,
      master_phone TEXT NOT NULL,
      master_specialty TEXT DEFAULT 'Usta',
      master_rating REAL DEFAULT 5.0,
      price REAL NOT NULL,
      eta TEXT NOT NULL,
      warranty TEXT DEFAULT 'Zəmanət verilir',
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS master_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      master_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();

  // Delete existing initial test request (id <= 1) & any completed requests
  await db.prepare("DELETE FROM service_requests WHERE id <= 1 OR status = 'completed'").run();
  await db.prepare("DELETE FROM service_bids WHERE request_id <= 1").run();
}

function parseRequestRow(r, currentUserId = 0, acceptedMasterId = 0) {
  if (!r) return null;
  const copy = { ...r };
  try { copy.images = typeof r.images === "string" ? JSON.parse(r.images) : (r.images || []); } catch (e) { copy.images = []; }
  const canSeeCustomerPhone = (currentUserId && r.user_id === currentUserId) ||
    (r.status !== "open" && currentUserId && acceptedMasterId && currentUserId === acceptedMasterId);
  if (!canSeeCustomerPhone) {
    copy.customer_phone = "+994 •• ••• •• ••";
  }
  return copy;
}

function formatBidRow(b, currentUserId = 0) {
  if (!b) return null;
  const copy = { ...b };
  const canSeeMasterPhone = b.status === "accepted" || (currentUserId && b.master_id === currentUserId);
  if (!canSeeMasterPhone) {
    copy.master_phone = "+994 •• ••• •• ••";
  }
  return copy;
}

const USER_COLS = "id, full_name, email, phone, role, salon_name, specialty, rating, jobs_done, is_pro, balance, verified, avatar, created_at";

async function getCurrentUser(db, request) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  const user = await db.prepare(`
    SELECT u.id, u.full_name, u.email, u.phone, u.role, u.salon_name, u.specialty, u.rating, u.jobs_done, u.is_pro, u.balance, u.verified, u.avatar
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
    return jsonResp({ error: "D1 Database binding (DB) not configured" }, 503);
  }

  await ensureSchema(db);
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "GET") {
    if (path === "/api/init") {
      const user = await getCurrentUser(db, request);
      const uid = user ? user.id : 0;
      const { results: bidRows } = await db.prepare("SELECT * FROM service_bids ORDER BY price ASC, id ASC").all();
      const acceptedByReq = {};
      (bidRows || []).forEach(b => {
        if (b.status === "accepted") acceptedByReq[b.request_id] = b.master_id;
      });
      const { results: reqRows } = await db.prepare("SELECT * FROM service_requests ORDER BY id DESC").all();
      // Visibility rule:
      // - 'open' requests are visible to everyone
      // - 'assigned' requests are ONLY visible to the customer (r.user_id === uid) and the accepted master (acceptedByReq[r.id] === uid)
      const visibleReqRows = (reqRows || []).filter(r => {
        if (r.status === "open") return true;
        if (r.status === "assigned" && uid && (r.user_id === uid || acceptedByReq[r.id] === uid)) return true;
        return false;
      });
      const visibleReqIds = new Set(visibleReqRows.map(r => r.id));
      const requests = visibleReqRows.map(r => {
        const parsed = parseRequestRow(r, uid, acceptedByReq[r.id] || 0);
        parsed.accepted_master_id = acceptedByReq[r.id] || 0;
        return parsed;
      });
      const bids = (bidRows || []).filter(b => visibleReqIds.has(b.request_id)).map(b => formatBidRow(b, uid));
      const { results: masterRows } = await db.prepare(`
        SELECT ${USER_COLS} FROM users
        WHERE role = 'master' OR (specialty IS NOT NULL AND specialty != '') OR (salon_name IS NOT NULL AND salon_name != '')
        ORDER BY is_pro DESC, rating DESC, jobs_done DESC, id DESC
      `).all();
      return jsonResp({ requests, bids, masters: masterRows || [], user });
    }

    if (path === "/api/users") {
      const { results } = await db.prepare(`SELECT ${USER_COLS} FROM users ORDER BY id DESC`).all();
      return jsonResp({ users: results || [] });
    }

    if (path.startsWith("/api/requests/")) {
      const reqId = parseInt(path.split("/")[3]) || 0;
      const user = await getCurrentUser(db, request);
      const uid = user ? user.id : 0;
      const row = await db.prepare("SELECT * FROM service_requests WHERE id = ?").bind(reqId).first();
      if (!row) return jsonResp({ error: "Sorğu tapılmadı" }, 404);
      const { results: rawBids } = await db.prepare("SELECT * FROM service_bids WHERE request_id = ? ORDER BY price ASC, id ASC").bind(reqId).all();
      const acceptedBid = (rawBids || []).find(b => b.status === "accepted");
      const acceptedMasterId = acceptedBid ? acceptedBid.master_id : 0;
      if (row.status !== "open" && (!uid || (row.user_id !== uid && acceptedMasterId !== uid))) {
        return jsonResp({ error: "Bu sorğu üçün artıq usta seçilib və yalnız sifarişçi ilə seçilmiş ustaya görünür." }, 403);
      }
      const bids = (rawBids || []).map(b => formatBidRow(b, uid));
      const parsed = parseRequestRow(row, uid, acceptedMasterId);
      parsed.accepted_master_id = acceptedMasterId;
      return jsonResp({ request: parsed, bids });
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
        const last9 = phoneDigits.slice(-9);
        phoneTaken = (results || []).some(r => {
          const d = String(r.phone || "").replace(/\D/g, "");
          return d === phoneDigits || (d.length >= 9 && d.slice(-9) === last9);
        });
      }
      return jsonResp({ exists: emailTaken, email_taken: emailTaken, phone_taken: phoneTaken });
    }

    if (path === "/api/auth/register") {
      const full_name = (data.full_name || "").trim();
      const email = (data.email || "").trim().toLowerCase();
      const phone = (data.phone || "+994").trim();
      const password = data.password || "";
      const role = data.role === "master" ? "master" : "customer";
      const specialty = (data.specialty || "").trim();
      if (!full_name || !email || !password) {
        return jsonResp({ error: "Bütün məcburi xanaları doldurun" }, 400);
      }

      const initials = full_name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "TA";
      const passHash = await sha256(password);
      const now = new Date().toISOString();

      const existing = await db.prepare("SELECT id, verified FROM users WHERE LOWER(email) = ?").bind(email).first();
      if (existing) {
        if (data.step === "verify_code" && existing.verified === 0) {
          await db.prepare("UPDATE users SET verified = 1 WHERE id = ?").bind(existing.id).run();
          const token = randomHex(24);
          await db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").bind(token, existing.id, now).run();
          const user = await db.prepare(`SELECT ${USER_COLS} FROM users WHERE id = ?`).bind(existing.id).first();
          return jsonResp({ token, user }, 200);
        }
        return jsonResp({ error: "Bu e-poçt artıq qeydiyyatdan keçib." }, 409);
      }

      const phoneDigits = phone.replace(/\D/g, "");
      if (phoneDigits.length >= 9) {
        const { results: allUsers } = await db.prepare("SELECT phone FROM users").all();
        const last9 = phoneDigits.slice(-9);
        const phoneExists = (allUsers || []).some(u => {
          const d = (u.phone || "").replace(/\D/g, "");
          return d === phoneDigits || (d.length >= 9 && d.slice(-9) === last9);
        });
        if (phoneExists) {
          return jsonResp({ error: "Bu telefon nömrəsi artıq qeydiyyatdan keçib." }, 409);
        }
      }

      const verifiedFlag = data.verified === 0 ? 0 : 1;
      const res = await db.prepare(`
        INSERT INTO users (full_name, email, phone, password_hash, role, salon_name, specialty, rating, jobs_done, is_pro, balance, verified, avatar, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, 0, 0, 10.0, ?, ?, ?)
      `).bind(full_name, email, phone, passHash, role, specialty, specialty, verifiedFlag, initials, now).run();
      const userId = res.meta.last_row_id;

      const token = randomHex(24);
      await db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").bind(token, userId, now).run();
      const user = await db.prepare(`SELECT ${USER_COLS} FROM users WHERE id = ?`).bind(userId).first();
      return jsonResp({ token, user }, 201);
    }

    if (path === "/api/auth/login") {
      const identifier = (data.identifier || data.email || data.phone || "").trim();
      const password = data.password || "";
      const passHash = await sha256(password);

      let user = null;
      if (identifier.includes("@")) {
        user = await db.prepare(`SELECT ${USER_COLS} FROM users WHERE LOWER(email) = ? AND password_hash = ?`)
          .bind(identifier.toLowerCase(), passHash).first();
      } else {
        const digits = identifier.replace(/\D/g, "");
        if (digits.length >= 9) {
          const { results } = await db.prepare(`SELECT ${USER_COLS} FROM users WHERE password_hash = ?`).bind(passHash).all();
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
      if (!user) return jsonResp({ error: "Bu e-poçt ünvanı ilə istifadəçi tapılmadı" }, 404);
      const newHash = await sha256(newPassword);
      await db.prepare("UPDATE users SET password_hash = ?, verified = 1 WHERE id = ?").bind(newHash, user.id).run();
      return jsonResp({ success: true });
    }

    if (path === "/api/requests") {
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Sorğu yaratmaq üçün əvvəlcə hesabınıza daxil olun" }, 401);

      const category = (data.category || "Kombi və İsitmə").trim();
      const title = (data.title || "").trim();
      const description = (data.description || "").trim();
      const city = (data.city || "Bakı").trim();
      const district = (data.district || "").trim();
      const urgency = (data.urgency || "Təcili — Bu gün").trim();
      const budget = parseFloat(data.budget) || 0;
      const imagesArr = Array.isArray(data.images) ? data.images : [];
      if (!title || !description) {
        return jsonResp({ error: "Başlıq və problemin təsvirini daxil edin" }, 400);
      }
      const now = new Date().toISOString();
      const res = await db.prepare(`
        INSERT INTO service_requests (
          user_id, customer_name, customer_phone, category, title, description,
          city, district, urgency, budget, images, status, accepted_bid_id, offers_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 0, 0, ?)
      `).bind(
        user.id, user.full_name, user.phone, category, title, description,
        city, district, urgency, budget, JSON.stringify(imagesArr), now
      ).run();
      const created = await db.prepare("SELECT * FROM service_requests WHERE id = ?").bind(res.meta.last_row_id).first();
      return jsonResp({ request: parseRequestRow(created) }, 201);
    }

    if (path.startsWith("/api/requests/") && path.endsWith("/bids")) {
      const reqId = parseInt(path.split("/")[3]) || 0;
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Qiymət təklifi göndərmək üçün hesabınıza daxil olun" }, 401);

      const sReq = await db.prepare("SELECT * FROM service_requests WHERE id = ?").bind(reqId).first();
      if (!sReq) return jsonResp({ error: "Sorğu tapılmadı" }, 404);
      if (sReq.status !== "open") return jsonResp({ error: "Bu sorğu üçün artıq usta seçilib" }, 400);
      if (sReq.user_id === user.id) return jsonResp({ error: "Öz sorğunuza qiymət təklifi göndərə bilməzsiniz" }, 400);

      const existingBid = await db.prepare("SELECT id FROM service_bids WHERE request_id = ? AND master_id = ?").bind(reqId, user.id).first();
      if (existingBid) return jsonResp({ error: "Bu sorğuya artıq qiymət təklifi göndərmisiniz" }, 409);

      const price = parseFloat(data.price) || 0;
      const eta = (data.eta || "1 saata gəlirəm").trim();
      const warranty = (data.warranty || "Zəmanət verilir").trim();
      const rawComment = (data.comment || "Peşəkar xidmət göstərilir.").trim();
      const comment = rawComment.replace(/\+?\d[\d\s\-()]{6,}\d/g, "[nömrə təklif qəbul edildikdə açılır]");
      if (price <= 0) return jsonResp({ error: "Düzgün qiymət (AZN) daxil edin" }, 400);

      // Zero-Risk Rule: 0 AZN deducted when sending a bid! Only check that master has >= 2 AZN (or PRO) ready if selected.
      if (!user.is_pro && (user.balance || 0) < 2.0) {
        return jsonResp({ error: "Təklif göndərmək pulsuzdur (0 ₼), lakin təklifiniz qəbul edilərsə 2 ₼ komissiya üçün balansınızda ən azı 2 ₼ olmalıdır." }, 402);
      }
      await db.prepare("UPDATE users SET role = 'master' WHERE id = ?").bind(user.id).run();

      const now = new Date().toISOString();
      const spec = user.specialty || user.salon_name || "Peşəkar Usta";
      const res = await db.prepare(`
        INSERT INTO service_bids (
          request_id, master_id, master_name, master_phone, master_specialty, master_rating,
          price, eta, warranty, comment, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `).bind(
        reqId, user.id, user.full_name, user.phone, spec, user.rating || 5.0,
        price, eta, warranty, comment, now
      ).run();

      await db.prepare("UPDATE service_requests SET offers_count = offers_count + 1 WHERE id = ?").bind(reqId).run();
      const bid = await db.prepare("SELECT * FROM service_bids WHERE id = ?").bind(res.meta.last_row_id).first();
      const updatedUser = await db.prepare(`SELECT ${USER_COLS} FROM users WHERE id = ?`).bind(user.id).first();
      return jsonResp({ bid: formatBidRow(bid, user.id), user: updatedUser }, 201);
    }

    if (path.startsWith("/api/requests/") && path.endsWith("/accept-bid")) {
      const reqId = parseInt(path.split("/")[3]) || 0;
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Giriş tələb olunur" }, 401);
      const sReq = await db.prepare("SELECT * FROM service_requests WHERE id = ?").bind(reqId).first();
      if (!sReq) return jsonResp({ error: "Sorğu tapılmadı" }, 404);
      if (sReq.user_id !== user.id) return jsonResp({ error: "Yalnız sorğu sahibi təklifi qəbul edə bilər" }, 403);
      if (sReq.status !== "open") return jsonResp({ error: "Bu sorğu üzrə artıq təklif qəbul edilib" }, 400);

      const bidId = parseInt(data.bid_id) || 0;
      const bid = await db.prepare("SELECT * FROM service_bids WHERE id = ? AND request_id = ?").bind(bidId, reqId).first();
      if (!bid) return jsonResp({ error: "Təklif tapılmadı" }, 404);

      // Deduct 2 AZN ONLY from the winning master when the customer accepts their bid!
      const masterUser = await db.prepare("SELECT id, balance, is_pro FROM users WHERE id = ?").bind(bid.master_id).first();
      const fee = (masterUser && masterUser.is_pro) ? 0 : 2.0;

      await db.prepare("UPDATE service_bids SET status = 'accepted' WHERE id = ?").bind(bidId).run();
      await db.prepare("UPDATE service_requests SET status = 'assigned', accepted_bid_id = ? WHERE id = ?").bind(bidId, reqId).run();
      await db.prepare("UPDATE users SET balance = MAX(0, ROUND(COALESCE(balance, 0) - ?, 2)), jobs_done = COALESCE(jobs_done, 0) + 1 WHERE id = ?")
        .bind(fee, bid.master_id).run();

      const updatedReq = await db.prepare("SELECT * FROM service_requests WHERE id = ?").bind(reqId).first();
      const acceptedBid = await db.prepare("SELECT * FROM service_bids WHERE id = ?").bind(bidId).first();
      return jsonResp({ request: parseRequestRow(updatedReq, user.id, bid.master_id), accepted_bid: formatBidRow(acceptedBid, user.id) });
    }

    if (path.startsWith("/api/requests/") && path.endsWith("/complete")) {
      const reqId = parseInt(path.split("/")[3]) || 0;
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Giriş tələb olunur" }, 401);
      const sReq = await db.prepare("SELECT * FROM service_requests WHERE id = ?").bind(reqId).first();
      if (!sReq || sReq.user_id !== user.id) return jsonResp({ error: "İcazəniz yoxdur" }, 403);

      const rating = Math.min(5, Math.max(1, parseInt(data.rating) || 5));
      const comment = (data.comment || "İş yüksək səviyyədə görüldü.").trim();

      if (sReq.accepted_bid_id) {
        const bid = await db.prepare("SELECT master_id FROM service_bids WHERE id = ?").bind(sReq.accepted_bid_id).first();
        if (bid) {
          await db.prepare(`
            INSERT INTO master_reviews (request_id, master_id, customer_name, rating, comment, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(reqId, bid.master_id, user.full_name, rating, comment, new Date().toISOString()).run();
          const avgRow = await db.prepare("SELECT AVG(rating) as avg_r FROM master_reviews WHERE master_id = ?").bind(bid.master_id).first();
          if (avgRow && avgRow.avg_r) {
            await db.prepare("UPDATE users SET rating = ROUND(?, 1) WHERE id = ?").bind(avgRow.avg_r, bid.master_id).run();
          }
        }
      }
      // Permanently delete the completed request and its bids from the database
      await db.prepare("DELETE FROM service_bids WHERE request_id = ?").bind(reqId).run();
      await db.prepare("DELETE FROM service_requests WHERE id = ?").bind(reqId).run();
      return jsonResp({ deleted: true, id: reqId });
    }

    if (path === "/api/masters/upgrade-pro") {
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Giriş tələb olunur" }, 401);
      if ((user.balance || 0) < 29) {
        return jsonResp({ error: "PRO paket (29 ₼) üçün balansınız kifayət deyil" }, 402);
      }
      await db.prepare("UPDATE users SET balance = ROUND(balance - 29, 2), is_pro = 1, role = 'master' WHERE id = ?").bind(user.id).run();
      const updated = await db.prepare(`SELECT ${USER_COLS} FROM users WHERE id = ?`).bind(user.id).first();
      return jsonResp({ user: updated });
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
      const specialty = data.specialty !== undefined ? String(data.specialty || "").trim() : (user.specialty || "");
      const role = data.role === "master" || specialty ? "master" : "customer";
      const phoneDigits = phone.replace(/\D/g, "");
      if (phoneDigits.length >= 9) {
        const { results: others } = await db.prepare("SELECT id, phone FROM users WHERE id != ?").bind(user.id).all();
        const last9 = phoneDigits.slice(-9);
        if ((others || []).some(u => {
          const d = (u.phone || "").replace(/\D/g, "");
          return d === phoneDigits || (d.length >= 9 && d.slice(-9) === last9);
        })) {
          return jsonResp({ error: "Bu telefon nömrəsi başqa hesabda istifadə olunur" }, 409);
        }
      }
      const initials = full_name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || user.avatar;
      await db.prepare("UPDATE users SET full_name = ?, phone = ?, specialty = ?, salon_name = ?, role = ?, avatar = ? WHERE id = ?")
        .bind(full_name, phone, specialty, specialty, role, initials, user.id).run();
      const updated = await db.prepare(`SELECT ${USER_COLS} FROM users WHERE id = ?`).bind(user.id).first();
      return jsonResp({ user: updated });
    }
  }

  if (request.method === "DELETE") {
    if (path.startsWith("/api/requests/")) {
      const reqId = parseInt(path.split("/")[3]) || 0;
      const user = await getCurrentUser(db, request);
      if (!user) return jsonResp({ error: "Giriş tələb olunur" }, 401);
      const existing = await db.prepare("SELECT id, user_id FROM service_requests WHERE id = ?").bind(reqId).first();
      if (!existing) return jsonResp({ error: "Sorğu tapılmadı" }, 404);
      if (existing.user_id !== user.id) return jsonResp({ error: "Bu sorğunu silmək icazəniz yoxdur" }, 403);
      await db.prepare("DELETE FROM service_requests WHERE id = ?").bind(reqId).run();
      await db.prepare("DELETE FROM service_bids WHERE request_id = ?").bind(reqId).run();
      return jsonResp({ deleted: true, id: reqId });
    }
  }

  return jsonResp({ status: "ok" });
    }
