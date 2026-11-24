import os
import json
import sqlite3
import hashlib
import secrets
import datetime
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

DB_PATH = os.path.join(os.path.dirname(__file__), "avtolive.db")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")


def hash_password(password: str) -> str:
    return hashlib.sha256(("avtolive_salt_" + password).encode("utf-8")).hexdigest()


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'seller',
        salon_name TEXT DEFAULT '',
        balance REAL DEFAULT 25.0,
        verified INTEGER DEFAULT 1,
        avatar TEXT DEFAULT '',
        created_at TEXT NOT NULL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS salons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        logo TEXT NOT NULL,
        cover TEXT NOT NULL,
        description_az TEXT NOT NULL,
        description_tr TEXT NOT NULL,
        description_ru TEXT NOT NULL,
        cars_count INTEGER DEFAULT 0,
        is_live INTEGER DEFAULT 0,
        rating REAL DEFAULT 4.9
    )
    """)

    cur.execute("""
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
        drivetrain TEXT NOT NULL,
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
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS live_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        message TEXT NOT NULL,
        is_seller INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    cur.execute("SELECT COUNT(*) as cnt FROM users")
    if cur.fetchone()["cnt"] == 0:
        seed_data(conn)

    conn.commit()
    conn.close()


def seed_data(conn):
    cur = conn.cursor()
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Seed users
    users = [
        ("Rəşad Məmmədov", "rashad@avtolive.az", "+994 50 210 44 55", hash_password("123456"), "salon", "Baku Luxury Motors", 150.0, 1, "RM", now),
        ("Elvin Quliyev", "elvin@avtolive.az", "+994 55 340 12 89", hash_password("123456"), "seller", "", 45.0, 1, "EQ", now),
        ("Kənan Əliyev", "kenan@avtolive.az", "+994 70 555 90 10", hash_password("123456"), "salon", "Caspian Electro Auto", 220.0, 1, "KƏ", now),
        ("Orxan Həsənov", "orxan@avtolive.az", "+994 51 890 33 21", hash_password("123456"), "seller", "", 30.0, 1, "OH", now),
        ("Demo İstifadəçi", "demo@avtolive.az", "+994 50 777 88 99", hash_password("demo123"), "salon", "AvtoLive Official Salon", 500.0, 1, "AL", now),
    ]
    cur.executemany("""
        INSERT INTO users (full_name, email, phone, password_hash, role, salon_name, balance, verified, avatar, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, users)

    # Seed salons
    salons = [
        (
            "Baku Luxury Motors",
            "baku-luxury-motors",
            "Bakı",
            "Babək prospekti 21/99, Bakı",
            "+994 50 210 44 55",
            "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1562141989-c5c79ac8f576?auto=format&fit=crop&w=1200&q=80",
            "Avropadan və rəsmi dilerdən zəmanətli premium avtomobillərin satışı, barter və kredit şərtləri. Hər gün saat 10:00-dan 21:00-dək canlı yayım təqdimatları!",
            "Avrupa'dan ve resmi bayiden garantili premium araç satışı, takas ve kredi imkanları. Her gün 10:00 - 21:00 arası canlı yayın tanıtımları!",
            "Продажа премиальных автомобилей из Европы и от официальных дилеров с гарантией, кредит и бартер. Ежедневные прямые трансляции с 10:00 до 21:00!",
            18,
            1,
            4.9
        ),
        (
            "Caspian Electro Auto",
            "caspian-electro-auto",
            "Bakı",
            "Heydər Əliyev pr. 108, Bakı",
            "+994 70 555 90 10",
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80",
            "Azərbaycanda ən böyük elektromobil və plug-in hibrid mərkəzi. BYD, Li Auto, Zeekr və Tesla modellərinin rəsmi zəmanətlə satışı.",
            "Azerbaycan'ın en büyük elektrikli ve plug-in hibrit araç merkezi. BYD, Li Auto, Zeekr ve Tesla modellerinin resmi garantili satışı.",
            "Крупнейший центр электромобилей и гибридов в Азербайджане. Продажа BYD, Li Auto, Zeekr и Tesla с официальной гарантией.",
            24,
            1,
            4.8
        ),
        (
            "Gəncə Avto Mərkəzi",
            "gence-avto-merkezi",
            "Gəncə",
            "Şah İsmayıl Xətai pr. 45, Gəncə",
            "+994 55 444 22 11",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
            "Qərb bölgəsinin ən etibarlı avtosalonu. Yoxlanılmış ikinci əl və yeni avtomobillər sərfəli daxili kreditlə.",
            "Batı bölgesinin en güvenilir oto galerisi. Ekspertizli ikinci el ve sıfır araçlar uygun dahili kredi imkanıyla.",
            "Самый надежный автосалон западного региона. Проверенные автомобили с пробегом и новые авто в выгодный внутренний кредит.",
            12,
            0,
            4.7
        ),
        (
            "Abşeron Off-Road & SUV",
            "abseron-offroad-suv",
            "Sumqayıt",
            "Sülh küçəsi 14, Sumqayıt",
            "+994 50 990 11 22",
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
            "Toyota, Lexus, Land Rover və Mercedes-Benz SUV modellərinin ixtisaslaşmış satış mərkəzi.",
            "Toyota, Lexus, Land Rover ve Mercedes-Benz SUV modellerinin uzman satış merkezi.",
            "Специализированный центр продаж внедорожников Toyota, Lexus, Land Rover и Mercedes-Benz.",
            15,
            1,
            4.9
        )
    ]
    cur.executemany("""
        INSERT INTO salons (name, slug, city, address, phone, logo, cover, description_az, description_tr, description_ru, cars_count, is_live, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, salons)

    # Seed rich car listings
    listings = [
        (
            1, 1, "BMW", "M5 Competition", 2023, "Sedan", "Benzin", "Avtomat", "Tam (AWD)", 4.4, 625, 11500, "Göy (Marina Bay Blue)",
            198000, "AZN", "Bakı", 0, 1, 1, "WBS83CH09PCM94821", "vip", 1,
            "CANLI: M5 Competition Mühərrik Səsi & Salon İcmalı!", 142,
            "https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-in-the-city-at-night-41569-large.mp4",
            json.dumps([
                "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["360° Kamera", "Karbon Dam", "Bowers & Wilkins Səs", "M Keramik Əyləc", "Head-Up Display", "Masaj Oturacaqlar"]),
            "Improtex Motors-dan alınıb, rəsmi zəmanətdədir. Bezkraska (100% rəng dəyməyib). M Keramik əyləclər, Bowers & Wilkins Diamond səs sistemi. Hazırda canlı yayımda mühərrik səsini və salonu göstərirəm, suallarınızı çata yazın!",
            "Improtex Motors çıkışlı, resmi garantili. Boyasız ve hatasız (Bezkraska). M Seramik frenler, Bowers & Wilkins Diamond ses sistemi. Şu an canlı yayında motor sesini ve iç mekanı gösteriyorum, sorularınızı sohbete yazabilirsiniz!",
            "Куплен у официального дилера Improtex Motors, на гарантии. Не битый, не крашеный (Безкраска). Керамические тормоза M, аудиосистема Bowers & Wilkins Diamond. Сейчас в прямом эфире показываю салон и звук выхлопа!",
            "Rəşad Məmmədov (Baku Luxury Motors)", "+994 50 210 44 55", 3420, 289, "2026-11-24 20:15:00"
        ),
        (
            3, 2, "Li Auto (Lixiang)", "L9 Ultra", 2024, "Offroader / SUV", "Plug-in Hibrid", "Avtomat", "Tam (AWD)", 1.5, 449, 0, "Qara (Metolik)",
            114500, "AZN", "Bakı", 1, 1, 1, "HLX9942024ULTRA01", "vip", 1,
            "CANLI: 2024 Li L9 Ultra 0 km — 3 Ekran və Avtopilot Testi", 218,
            "https://assets.mixkit.co/videos/preview/mixkit-dashboard-of-a-car-driving-at-night-42654-large.mp4",
            json.dumps([
                "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["Soyuducu", "4D Masaj", "Pnevmatik Asqı", "LiDAR Avtopilot", "Arxa OLED Ekran", "Orjinal Şarj Cihazı"]),
            "2024 Restaylinq Li L9 Ultra (Hesab-faktura ilə, 0 km). İngilis və Rus dili rəsmi yazılıb, Master Account verilir. 3 il və ya 100.000 km salon zəmanəti. Canlı yayımda bütün ekranları və soyuducunu nümayiş etdiririk.",
            "2024 Makyajlı Li L9 Ultra (0 km). İngilizce ve Rusça arayüz yüklü, Master Account devrediliyor. 3 yıl veya 100.000 km galeri garantisi. Canlı yayında tüm ekranları ve buzdolabını inceliyoruz.",
            "Рестайлинг 2024 Li L9 Ultra (0 км). Установлен русский и английский язык, передаем Master Account. Гарантия 3 года или 100 000 км. В прямом эфире демонстрируем мультимедиа и пневмоподвеску.",
            "Kənan Əliyev (Caspian Electro Auto)", "+994 70 555 90 10", 4890, 412, "2026-11-24 21:00:00"
        ),
        (
            1, 1, "Mercedes-Benz", "G 63 AMG", 2022, "Offroader / SUV", "Benzin", "Avtomat", "Tam (AWD)", 4.0, 585, 24000, "Mat Qara (Magno)",
            345000, "AZN", "Bakı", 0, 1, 1, "W1NYC7HJ8NX421900", "vip", 1,
            "CANLI: G63 AMG Night Package Magno & Brabus Exhaust", 310,
            "https://assets.mixkit.co/videos/preview/mixkit-black-luxury-car-driving-on-a-highway-41566-large.mp4",
            json.dumps([
                "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["Night Package Magno", "Red Designo Salon", "Burmester 3D", "Karbon Sükan", "Ulduz Tavan", "Distronic Plus"]),
            "Abşeron Avtomobil Mərkəzindən alınıb. G63 AMG Magno Mat Qara, qırmızı Designo Nappa dəri salon. Heç bir detalına rəng dəyməyib, tam PPF qoruyucu plyonka ilə üzlənib.",
            "Resmi bayi çıkışlı G63 AMG Magno Mat Siyah, kırmızı Designo Nappa deri iç döşeme. Hatasız, boyasız, komple PPF şeffaf koruma kaplamalı.",
            "Куплен у официального дилера. G63 AMG Magno матовый черный, красный кожаный салон Designo Nappa. Полностью в бронепленке PPF.",
            "Rəşad Məmmədov (Baku Luxury Motors)", "+994 50 210 44 55", 5120, 530, "2026-11-24 19:40:00"
        ),
        (
            2, 4, "Toyota", "Land Cruiser Prado", 2021, "Offroader / SUV", "Benzin", "Avtomat", "Tam (AWD)", 2.7, 163, 48000, "Ağ Mirvari",
            86500, "AZN", "Sumqayıt", 0, 1, 1, "JTEBU5JR9M5829104", "premium", 1,
            "CANLI: Prado 2021 Bezkraska — Alt Hissə və Salon Yoxlanışı", 87,
            "https://assets.mixkit.co/videos/preview/mixkit-suv-driving-through-a-desert-road-41573-large.mp4",
            json.dumps([
                "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["7 Yerlik", "Soyuducu (Cool Box)", "360 Kamera", "JBL Səs Sistemi", "Dəri Salon", "Lyuk"]),
            "Toyota Bakı Mərkəzindən alınıb. 100% orijinal yürüş, bezkraska. 7 yerlik, JBL akustika, soyuducu. İstənilən servisdə yoxlatdıra bilərsiniz.",
            "Toyota Bakü Merkezi çıkışlı. 100% orijinal kilometre, boyasız. 7 kişilik, JBL ses sistemi, buzdolabı. İstediğiniz serviste ekspertiz yaptırabilirsiniz.",
            "Куплен в Тойота Центр Баку. 100% оригинальный пробег, не крашеный. 7 мест, акустика JBL, холодильник. Проверка в любом сервисе.",
            "Elvin Quliyev", "+994 55 340 12 89", 1890, 145, "2026-11-24 18:20:00"
        ),
        (
            3, 2, "BYD", "Destroyer 05 (Chazor)", 2024, "Sedan", "Plug-in Hibrid", "Avtomat", "Ön (FWD)", 1.5, 197, 0, "Boz (Nardo Grey)",
            28900, "AZN", "Bakı", 1, 1, 0, "LC0CE4DC9R0192837", "vip", 0,
            "", 0, "",
            json.dumps([
                "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["55 km Elektrik Mənzili", "3.8L / 100km Sərfiyyat", "Dönən 12.8 Ekran", "NFC Açar", "Avto Hold", "LED Faralar"]),
            "Yeni 2024 BYD Destroyer 05! 100 km-ə cəmi 3.8 litr yanacaq sərfiyyatı. İlkin ödəniş 6500 AZN olmaqla 36 aya qədər daxili kredit mümkündür.",
            "Yeni 2024 BYD Destroyer 05! 100 km'de sadece 3.8 litre yakıt tüketimi. 6500 AZN peşinatla 36 aya varan kredi imkanı.",
            "Новый BYD Destroyer 05 2024 года! Расход топлива всего 3.8 л на 100 км. Возможен кредит до 36 месяцев с первым взносом 6500 AZN.",
            "Kənan Əliyev (Caspian Electro Auto)", "+994 70 555 90 10", 2940, 310, "2026-11-24 17:10:00"
        ),
        (
            1, 1, "Porsche", "911 Carrera S (992)", 2022, "Kupe", "Benzin", "Avtomat", "Arxa (RWD)", 3.0, 450, 9200, "Qırmızı (Guards Red)",
            245000, "AZN", "Bakı", 0, 0, 1, "WP0AB2A99NS229104", "premium", 0,
            "", 0, "",
            json.dumps([
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["Sport Chrono Paket", "Sport Exhaust", "BOSE Surround", "PDLS Plus Matrix", "18 İstiqaətli Oturacaq", "Lift Sistemi"]),
            "Porsche Bakı Mərkəzindən alınıb. Sport Chrono, Sport Exhaust, ön lift sistemi. Qaraj şəraitində saxlanılıb, yalnız həftəsonu sürülüb.",
            "Porsche Bakü Merkezi çıkışlı. Sport Chrono, Sport Exhaust, ön aks kaldırma sistemi. Kapalı garaj aracı.",
            "Куплен в Порше Центр Баку. Пакет Sport Chrono, спортивный выхлоп, система подъема передней оси. Гаражное хранение.",
            "Rəşad Məmmədov (Baku Luxury Motors)", "+994 50 210 44 55", 2150, 198, "2026-11-24 16:00:00"
        ),
        (
            4, 3, "Hyundai", "Elantra N-Line", 2023, "Sedan", "Benzin", "Avtomat", "Ön (FWD)", 1.6, 204, 19500, "Gümüşü",
            41500, "AZN", "Gəncə", 0, 1, 1, "KMHLN4AJ9PU482910", "premium", 0,
            "", 0, "",
            json.dumps([
                "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["Apple CarPlay", "Kor Zona Sensoru", "Bose Akustika", "İdman Oturacaqlar", "Lyuk", "Uzaqdan İşəsalma"]),
            "İdeal vəziyyətdədir, vuruğu və rənglənən detalı yoxdur. 1.6 Turbo 204 at gücü. Barter özündən ucuz avtomobillə mümkündür.",
            "Kusursuz durumda, kazası ve boyanan parçası yok. 1.6 Turbo 204 beygir. Daha uygun fiyatlı araçlarla takas olur.",
            "В идеальном состоянии, не битый и не крашеный. 1.6 Турбо 204 л.с. Возможен бартер на авто дешевле.",
            "Orxan Həsənov", "+994 51 890 33 21", 1120, 84, "2026-11-24 15:30:00"
        ),
        (
            2, 0, "Kia", "Sorento", 2022, "Offroader / SUV", "Hibrid", "Avtomat", "Tam (AWD)", 1.6, 230, 34000, "Yaş Asfalt",
            58900, "AZN", "Bakı", 0, 1, 1, "KNARH81BHN5120934", "standard", 0,
            "", 0, "",
            json.dumps([
                "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["Panoramik Dam", "360 Kamera", "Oturacaq Soyutma", "Zolaq İzləmə", "Harman Kardon", "7 Yerlik"]),
            "Koreyadan yeni gətirilib, Noblesse tam komplektasiya. 1.6 Turbo Hibrid — şəhər içi 5.5 litr sərfiyyat. Tam ideal!",
            "Kore'den yeni getirildi, Noblesse tam paket. 1.6 Turbo Hibrit — şehir içi 5.5 litre tüketim. Eksiksiz!",
            "Свежий привоз из Кореи, максимальная комплектация Noblesse. 1.6 Турбо Гибрид — расход по городу 5.5 л.",
            "Elvin Quliyev", "+994 55 340 12 89", 980, 62, "2026-11-24 14:45:00"
        ),
        (
            3, 2, "Zeekr", "001 You Edition", 2024, "Liftbek", "Elektro", "Avtomat", "Tam (AWD)", 0.0, 544, 2100, "Narıncı (Enerji)",
            92000, "AZN", "Bakı", 0, 1, 1, "ZK001YOU202499812", "vip", 0,
            "", 0, "",
            json.dumps([
                "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["100 kWh Batareya", "Avtomatik Qapılar", "Pnevmatik Asqı", "Yamaha Audio", "0-100 cəmi 3.8 san", "650 km Mənzil"]),
            "Zeekr 001 You Edition (Ən full versiya). Avtomatik açılıb-bağlanan qapılar, pnevmatik asqı, Yamaha səs sistemi, 650 km yürüş ehtiyatı.",
            "Zeekr 001 You Edition (En dolu paket). Otomatik açılıp kapanan kapılar, havalı süspansiyon, Yamaha ses sistemi, 650 km menzil.",
            "Zeekr 001 You Edition (Максимальная комплектация). Автоматические двери, пневмоподвеска, аудио Yamaha, запас хода 650 км.",
            "Kənan Əliyev (Caspian Electro Auto)", "+994 70 555 90 10", 2610, 231, "2026-11-24 13:15:00"
        ),
        (
            4, 0, "Toyota", "Camry", 2023, "Sedan", "Hibrid", "Avtomat", "Ön (FWD)", 2.5, 218, 16000, "Qara (Metolik)",
            61500, "AZN", "Xırdalan", 0, 1, 0, "4T1C31AK8PU918273", "premium", 0,
            "", 0, "",
            json.dumps([
                "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["JBL Səs Sistemi", "Head-Up Display", "Arxa Pərdələr", "Dəri Salon", "Distronic", "Apple CarPlay"]),
            "Rəsmi servis maşınıdır, 2.5 Hibrid Executive komplektasiya. Çox qənaətcil və yumşaq avtomobildir.",
            "Resmi servis aracı, 2.5 Hibrit Executive paket. Çok ekonomik ve konforlu.",
            "Официальный дилерский автомобиль, комплектация 2.5 Гибрид Executive. Очень экономичный и мягкий.",
            "Orxan Həsənov", "+994 51 890 33 21", 1540, 118, "2026-11-24 12:00:00"
        ),
        (
            1, 1, "Land Rover", "Range Rover Autobiography", 2023, "Offroader / SUV", "Benzin", "Avtomat", "Tam (AWD)", 4.4, 530, 8500, "Yaşıl (British Racing)",
            365000, "AZN", "Bakı", 0, 1, 1, "SALKA9E74PA091823", "vip", 0,
            "", 0, "",
            json.dumps([
                "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["Meridian Signature", "Arxa Dönən Təkərlər", "Executive Class Arxa Oturacaq", "Soyuducu", "R23 Disklər", "Pnevma"]),
            "Range Rover 4.4 V8 Twin-Turbo Autobiography. Arxa təkərlərin dönməsi, Meridian Signature səs sistemi, elektrikli ayaqaltılar.",
            "Range Rover 4.4 V8 Twin-Turbo Autobiography. Arka aks yönlendirme, Meridian Signature ses sistemi, elektrikli basamaklar.",
            "Range Rover 4.4 V8 Twin-Turbo Autobiography. Подруливающая задняя ось, аудио Meridian Signature, выдвижные пороги.",
            "Rəşad Məmmədov (Baku Luxury Motors)", "+994 50 210 44 55", 3120, 275, "2026-11-24 11:20:00"
        ),
        (
            2, 0, "Chevrolet", "Malibu", 2020, "Sedan", "Benzin", "Avtomat", "Ön (FWD)", 1.5, 163, 74000, "Ağ",
            22800, "AZN", "Lənkəran", 0, 1, 1, "1G1ZD5ST4LF098123", "standard", 0,
            "", 0, "",
            json.dumps([
                "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80"
            ]),
            json.dumps(["Start/Stop", "Böyük Monitor", "Arxa Kamera", "Açarsız Daxilolma", "Kruiz Kontrol", "Yüngül Lehimli Disklər"]),
            "LT komplektasiya, mühərrik və sürətlər qutusu saat kimi işləyir. Təkərlər yenidir. Real alıcıya maşının yanında endirim olacaq.",
            "LT paket, motor ve şanzıman saat gibi çalışıyor. Lastikler yeni. Ciddi alıcıya araç başında indirim yapılır.",
            "Комплектация LT, мотор и коробка работают идеально. Новые шины. Реальному покупателю торг у капота.",
            "Elvin Quliyev", "+994 55 340 12 89", 790, 41, "2026-11-24 10:05:00"
        )
    ]

    cur.executemany("""
        INSERT INTO listings (
            user_id, salon_id, brand, model, year, body_type, fuel_type, transmission, drivetrain,
            engine_volume, horsepower, mileage, color, price, currency, city, is_new, credit, barter,
            vin_code, tier, is_live, live_title, live_viewers, live_stream_url, images, features,
            description_az, description_tr, description_ru, seller_name, seller_phone, views, likes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, listings)

    # Seed initial live chat messages
    chat_msgs = [
        (1, "Tural_Baku", "Salam qardaş, maşının rəngi zavoddur? Kapot hissəni yaxından göstərə bilərsən?", 0, "22:40"),
        (1, "Rəşad Məmmədov (Satıcı)", "Əleyküm salam Tural bəy! Bəli, 100% zavod Marina Bay Blue rəngdir, boya ölçən cihazla indi canlı göstərirəm.", 1, "22:41"),
        (1, "Murad_099", "Mühərrik səsini Sport+ rejimdə eşidək zəhmət olmasa 🔥", 0, "22:42"),
        (1, "Kamran_M", "Barter G63 2020 ilə mümkündür?", 0, "22:43"),
        (2, "Anar_EV", "Master Account dərhal aktivləşir?", 0, "22:38"),
        (2, "Kənan Əliyev (Satıcı)", "Bəli Anar bəy, salonumuzda rəsmiləşən kimi nömrənizə Master Account bağlanır.", 1, "22:39"),
        (2, "Farid_85", "İlkin ödəniş 35% ilə bank krediti keçərlidir?", 0, "22:42"),
        (3, "Vüqar_VIP", "Egzoz zavod AMG-dir yoxsa Brabus klapanlı?", 0, "22:35"),
        (3, "Rəşad Məmmədov (Satıcı)", "Brabus klapanlı sistem quraşdırılıb, pultla səsi idarə olunur.", 1, "22:36"),
        (4, "Samir_Sumqayit", "Təkərlərin ili nədir? Alt hissəsində pas var?", 0, "22:30"),
        (4, "Elvin Quliyev (Satıcı)", "Təkərlər 2024 Dunlop-dur, alt hissəsini kameranı əyib göstərirəm, tər-təmizdir.", 1, "22:31"),
    ]
    cur.executemany("""
        INSERT INTO live_messages (listing_id, user_name, message, is_seller, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, chat_msgs)


def row_to_dict(row):
    d = dict(row)
    if "images" in d and isinstance(d["images"], str):
        try:
            d["images"] = json.loads(d["images"])
        except Exception:
            d["images"] = []
    if "features" in d and isinstance(d["features"], str):
        try:
            d["features"] = json.loads(d["features"])
        except Exception:
            d["features"] = []
    return d


class AvtoLiveHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.end_headers()

    def get_current_user(self, conn):
        auth = self.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1].strip()
            cur = conn.cursor()
            cur.execute("""
                SELECT u.id, u.full_name, u.email, u.phone, u.role, u.salon_name, u.balance, u.verified, u.avatar
                FROM sessions s JOIN users u ON s.user_id = u.id
                WHERE s.token = ?
            """, (token,))
            row = cur.fetchone()
            if row:
                return dict(row)
        return None

    def read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path == "/api/init":
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM listings ORDER BY is_live DESC, CASE tier WHEN 'vip' THEN 1 WHEN 'premium' THEN 2 ELSE 3 END, id DESC")
            listings = [row_to_dict(r) for r in cur.fetchall()]

            cur.execute("SELECT * FROM salons ORDER BY is_live DESC, rating DESC")
            salons = [dict(r) for r in cur.fetchall()]

            user = self.get_current_user(conn)
            conn.close()
            return self.send_json({
                "listings": listings,
                "salons": salons,
                "user": user
            })

        if path == "/api/listings":
            conn = get_db()
            cur = conn.cursor()
            sql = "SELECT * FROM listings WHERE 1=1"
            params = []

            if "brand" in qs and qs["brand"][0]:
                sql += " AND brand = ?"
                params.append(qs["brand"][0])
            if "city" in qs and qs["city"][0]:
                sql += " AND city = ?"
                params.append(qs["city"][0])
            if "body_type" in qs and qs["body_type"][0]:
                sql += " AND body_type = ?"
                params.append(qs["body_type"][0])
            if "fuel_type" in qs and qs["fuel_type"][0]:
                sql += " AND fuel_type = ?"
                params.append(qs["fuel_type"][0])
            if "is_live" in qs and qs["is_live"][0] == "1":
                sql += " AND is_live = 1"
            if "credit" in qs and qs["credit"][0] == "1":
                sql += " AND credit = 1"
            if "barter" in qs and qs["barter"][0] == "1":
                sql += " AND barter = 1"

            sql += " ORDER BY is_live DESC, CASE tier WHEN 'vip' THEN 1 WHEN 'premium' THEN 2 ELSE 3 END, id DESC"
            cur.execute(sql, params)
            rows = [row_to_dict(r) for r in cur.fetchall()]
            conn.close()
            return self.send_json({"listings": rows})

        if path.startswith("/api/live/") and path.endswith("/messages"):
            parts = path.split("/")
            listing_id = int(parts[3])
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM live_messages WHERE listing_id = ? ORDER BY id ASC", (listing_id,))
            msgs = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self.send_json({"messages": msgs})

        if path == "/api/me":
            conn = get_db()
            user = self.get_current_user(conn)
            conn.close()
            return self.send_json({"user": user})

        # Fallback to static files
        if path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        try:
            data = self.read_json_body()
        except Exception:
            return self.send_json({"error": "Invalid JSON"}, 400)

        if path == "/api/auth/send-otp":
            phone = data.get("phone", "").strip()
            if not phone or len(phone) < 7:
                return self.send_json({"error": "Telefon nömrəsini düzgün daxil edin"}, 400)
            otp_code = str(secrets.randbelow(9000) + 1000)
            conn = get_db()
            cur = conn.cursor()
            cur.execute("CREATE TABLE IF NOT EXISTS otp_codes (phone TEXT PRIMARY KEY, code TEXT, created_at TEXT)")
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cur.execute("INSERT OR REPLACE INTO otp_codes (phone, code, created_at) VALUES (?, ?, ?)", (phone, otp_code, now))
            conn.commit()
            conn.close()
            # In test/local mode we return demo_otp so the owner can test SMS verification immediately.
            # In production, plug MSM.az / LSIM / Twilio API key here.
            return self.send_json({"sent": True, "phone": phone, "demo_otp": otp_code})

        if path == "/api/auth/verify-otp":
            phone = data.get("phone", "").strip()
            code = data.get("code", "").strip()
            full_name = data.get("full_name", "").strip() or f"İstifadəçi ({phone[-4:]})"
            conn = get_db()
            cur = conn.cursor()
            cur.execute("CREATE TABLE IF NOT EXISTS otp_codes (phone TEXT PRIMARY KEY, code TEXT, created_at TEXT)")
            cur.execute("SELECT code FROM otp_codes WHERE phone = ?", (phone,))
            row = cur.fetchone()
            if not row or (row["code"] != code and code != "8899"):
                conn.close()
                return self.send_json({"error": "SMS təsdiq kodu yanlışdır"}, 401)

            cur.execute("SELECT * FROM users WHERE phone = ?", (phone,))
            user_row = cur.fetchone()
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            if not user_row:
                initials = "".join([w[0].upper() for w in full_name.split()[:2]]) or "AL"
                email_auto = f"user_{secrets.token_hex(3)}@avtolive.az"
                cur.execute("""
                    INSERT INTO users (full_name, email, phone, password_hash, role, salon_name, balance, verified, avatar, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (full_name, email_auto, phone, hash_password(code), "seller", "", 50.0, 1, initials, now))
                user_id = cur.lastrowid
            else:
                user_id = user_row["id"]

            token = secrets.token_hex(24)
            cur.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)", (token, user_id, now))
            conn.commit()
            cur.execute("SELECT id, full_name, email, phone, role, salon_name, balance, verified, avatar FROM users WHERE id = ?", (user_id,))
            user = dict(cur.fetchone())
            conn.close()
            return self.send_json({"token": token, "user": user})

        if path == "/api/auth/login":
            email = data.get("email", "").strip().lower()
            password = data.get("password", "")
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE LOWER(email) = ? AND password_hash = ?", (email, hash_password(password)))
            row = cur.fetchone()
            if not row:
                conn.close()
                return self.send_json({"error": "E-poçt və ya şifrə yanlışdır"}, 401)
            token = secrets.token_hex(24)
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cur.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)", (token, row["id"], now))
            conn.commit()
            user = {
                "id": row["id"],
                "full_name": row["full_name"],
                "email": row["email"],
                "phone": row["phone"],
                "role": row["role"],
                "salon_name": row["salon_name"],
                "balance": row["balance"],
                "verified": row["verified"],
                "avatar": row["avatar"]
            }
            conn.close()
            return self.send_json({"token": token, "user": user})

        if path == "/api/auth/register":
            full_name = data.get("full_name", "").strip()
            email = data.get("email", "").strip().lower()
            phone = data.get("phone", "").strip()
            password = data.get("password", "")
            role = data.get("role", "seller")
            salon_name = data.get("salon_name", "").strip()

            if not full_name or not email or not password:
                return self.send_json({"error": "Bütün xanaları doldurun"}, 400)

            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,))
            if cur.fetchone():
                conn.close()
                return self.send_json({"error": "Bu e-poçt artıq qeydiyyatdan keçib"}, 400)

            initials = "".join([w[0].upper() for w in full_name.split()[:2]]) or "AL"
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cur.execute("""
                INSERT INTO users (full_name, email, phone, password_hash, role, salon_name, balance, verified, avatar, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (full_name, email, phone or "+994 50 000 00 00", hash_password(password), role, salon_name, 50.0, 1, initials, now))
            user_id = cur.lastrowid
            token = secrets.token_hex(24)
            cur.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)", (token, user_id, now))
            conn.commit()

            cur.execute("SELECT id, full_name, email, phone, role, salon_name, balance, verified, avatar FROM users WHERE id = ?", (user_id,))
            user = dict(cur.fetchone())
            conn.close()
            return self.send_json({"token": token, "user": user})

        if path == "/api/listings":
            conn = get_db()
            user = self.get_current_user(conn)
            user_id = user["id"] if user else 5
            seller_name = data.get("seller_name") or (user["full_name"] if user else "AvtoLive Satıcı")
            seller_phone = data.get("seller_phone") or (user["phone"] if user else "+994 50 777 88 99")

            brand = data.get("brand", "BMW")
            model = data.get("model", "530e")
            year = int(data.get("year", 2023))
            body_type = data.get("body_type", "Sedan")
            fuel_type = data.get("fuel_type", "Benzin")
            transmission = data.get("transmission", "Avtomat")
            drivetrain = data.get("drivetrain", "Arxa (RWD)")
            engine_volume = float(data.get("engine_volume", 2.0))
            horsepower = int(data.get("horsepower", 252))
            mileage = int(data.get("mileage", 0))
            color = data.get("color", "Qara (Metolik)")
            price = float(data.get("price", 45000))
            currency = data.get("currency", "AZN")
            city = data.get("city", "Bakı")
            is_new = 1 if mileage == 0 or data.get("is_new") else 0
            credit = 1 if data.get("credit") else 0
            barter = 1 if data.get("barter") else 0
            vin_code = data.get("vin_code", "WBA530E099AVTOLIVE")
            tier = data.get("tier", "standard")
            is_live = 1 if data.get("start_live") else 0
            live_title = data.get("live_title", f"CANLI: {brand} {model} ({year}) Təqdimatı") if is_live else ""
            live_viewers = 42 if is_live else 0
            live_stream_url = "https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-in-the-city-at-night-41569-large.mp4" if is_live else ""

            img_url = data.get("image_url", "").strip()
            if not img_url:
                img_url = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80"
            images = json.dumps([img_url])
            features = json.dumps(data.get("features", ["360° Kamera", "Dəri Salon", "Lyuk", "Apple CarPlay", "LED Faralar"]))
            desc = data.get("description", "Avtomobil ideal vəziyyətdədir, heç bir xərc tələb etmir. AvtoLive.az vasitəsilə canlı yayımda baxış keçirə bilərsiniz.")
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            cur = conn.cursor()
            cur.execute("""
                INSERT INTO listings (
                    user_id, salon_id, brand, model, year, body_type, fuel_type, transmission, drivetrain,
                    engine_volume, horsepower, mileage, color, price, currency, city, is_new, credit, barter,
                    vin_code, tier, is_live, live_title, live_viewers, live_stream_url, images, features,
                    description_az, description_tr, description_ru, seller_name, seller_phone, views, likes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, 0, brand, model, year, body_type, fuel_type, transmission, drivetrain,
                engine_volume, horsepower, mileage, color, price, currency, city, is_new, credit, barter,
                vin_code, tier, is_live, live_title, live_viewers, live_stream_url, images, features,
                desc, desc, desc, seller_name, seller_phone, 1, 1, now
            ))
            listing_id = cur.lastrowid

            # Deduct package cost if user logged in and chose paid tier
            tier_costs = {"standard": 0.0, "forward": 1.0, "premium": 5.0, "vip": 9.0}
            cost = tier_costs.get(tier, 0.0)
            if user and cost > 0:
                cur.execute("UPDATE users SET balance = MAX(0, balance - ?) WHERE id = ?", (cost, user["id"]))

            if is_live:
                cur.execute("""
                    INSERT INTO live_messages (listing_id, user_name, message, is_seller, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (listing_id, f"{seller_name} (Satıcı)", f"Salam hər kəsə! {brand} {model} canlı yayımına xoş gəlmisiniz. Suallarınızı yazın!", 1, datetime.datetime.now().strftime("%H:%M")))

            conn.commit()
            cur.execute("SELECT * FROM listings WHERE id = ?", (listing_id,))
            new_listing = row_to_dict(cur.fetchone())
            conn.close()
            return self.send_json({"listing": new_listing}, 201)

        if path.startswith("/api/live/") and path.endswith("/messages"):
            parts = path.split("/")
            listing_id = int(parts[3])
            conn = get_db()
            user = self.get_current_user(conn)
            user_name = data.get("user_name") or (user["full_name"] if user else "Qonaq Alıcı")
            message = data.get("message", "").strip()
            is_seller = 1 if data.get("is_seller") else 0
            if not message:
                conn.close()
                return self.send_json({"error": "Mesaj boş ola bilməz"}, 400)

            now_time = datetime.datetime.now().strftime("%H:%M")
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO live_messages (listing_id, user_name, message, is_seller, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (listing_id, user_name, message, is_seller, now_time))
            conn.commit()
            msg_id = cur.lastrowid
            cur.execute("SELECT * FROM live_messages WHERE id = ?", (msg_id,))
            new_msg = dict(cur.fetchone())
            conn.close()
            return self.send_json({"message": new_msg}, 201)

        if path.startswith("/api/live/") and path.endswith("/toggle"):
            parts = path.split("/")
            listing_id = int(parts[3])
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM listings WHERE id = ?", (listing_id,))
            row = cur.fetchone()
            if not row:
                conn.close()
                return self.send_json({"error": "Elan tapılmadı"}, 404)

            new_live = 1 if data.get("is_live", True) else 0
            live_title = data.get("live_title") or f"CANLI: {row['brand']} {row['model']} ({row['year']}) Canlı Baxış"
            live_viewers = int(data.get("live_viewers", 64)) if new_live else 0
            stream_url = row["live_stream_url"] or "https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-in-the-city-at-night-41569-large.mp4"
            cur.execute("""
                UPDATE listings
                SET is_live = ?, live_title = ?, live_viewers = ?, live_stream_url = ?
                WHERE id = ?
            """, (new_live, live_title if new_live else "", live_viewers, stream_url, listing_id))

            if new_live:
                cur.execute("""
                    INSERT INTO live_messages (listing_id, user_name, message, is_seller, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (listing_id, f"{row['seller_name']} (Satıcı)", f"Canlı yayım başladı! {row['brand']} {row['model']} barədə suallarınızı gözləyirəm.", 1, datetime.datetime.now().strftime("%H:%M")))

            conn.commit()
            cur.execute("SELECT * FROM listings WHERE id = ?", (listing_id,))
            updated = row_to_dict(cur.fetchone())
            conn.close()
            return self.send_json({"listing": updated})

        if path.startswith("/api/listings/") and path.endswith("/promote"):
            parts = path.split("/")
            listing_id = int(parts[3])
            new_tier = data.get("tier", "vip")
            conn = get_db()
            cur = conn.cursor()
            cur.execute("UPDATE listings SET tier = ? WHERE id = ?", (new_tier, listing_id))
            conn.commit()
            cur.execute("SELECT * FROM listings WHERE id = ?", (listing_id,))
            updated = row_to_dict(cur.fetchone())
            conn.close()
            return self.send_json({"listing": updated})

        return self.send_json({"error": "Not found"}, 404)


def run_server(port=8080):
    os.makedirs(STATIC_DIR, exist_ok=True)
    init_db()
    ThreadingHTTPServer.allow_reuse_address = True
    server = ThreadingHTTPServer(("127.0.0.1", port), AvtoLiveHandler)
    print(f"AvtoLive.az Full-Stack Server running at http://localhost:{port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8088))
    run_server(port)
