# Oğuzhan Kul — Kişisel Site / Portfolyo

İş analisti başvuruları için hazırlanmış kişisel portfolyo sitesi.
Saf HTML + CSS + JavaScript; framework, build adımı veya bağımlılık yok.
GitHub'a atıp Vercel'e bağladığınız anda yayına girer.

Dil: **İngilizce** (uluslararası başvurulara da uygun olsun diye).

---

## Hızlı başlangıç

Node.js kurulu olmadığı için Python'un yerleşik sunucusu kullanılıyor:

```bash
python -m http.server 4323 --directory production/projects/portfolio
```

Ardından `http://localhost:4323` adresini açın.

> **`index.html`'e çift tıklayarak açmayın.** Sayfa ES modülleriyle
> (`<script type="module">`) çalışır ve tarayıcılar `file://` üzerinden
> modül yüklemeyi güvenlik nedeniyle engeller. Sayfa boş görünür.
> Yukarıdaki sunucuyu kullanın.

Claude Code içinden çalıştırmak isterseniz `.claude/launch.json` içinde
`portfolio` adlı hazır bir yapılandırma var.

---

## İçeriği nereden değiştiririm

Tasarım koduna hiç dokunmadan tüm içerik `js/data/` altındaki dört
dosyadan yönetilir:

| Dosya | Ne var içinde |
| --- | --- |
| `js/data/profile.js` | Ad, unvan, hero metinleri, iletişim bağlantıları, CV dosyası yolu, "About" paragrafları, spec kartı satırları |
| `js/data/skills.js` | Yetkinlik kategorileri ve içlerindeki maddeler |
| `js/data/projects.js` | Projeler (şu an **boş** — aşağıya bakın) |
| `js/data/websites.js` | Yapılan web siteleri |
| `js/data/resume.js` | CV: özet, eğitim, deneyim, diller, sertifikalar, başarılar |

Her dosyanın başında ne yapacağını anlatan bir yorum ve kopyalayıp
doldurabileceğiniz bir şablon var.

**Genel kural:** bir alan `null` veya boş dizi ise, ona ait düğme/bölüm
hiç basılmaz. Böylece kırık link veya çalışmayan buton oluşmaz.

---

## ⚠️ Yayına almadan önce yapılacaklar

### 1. Alan adı — ✅ tamam

Site yayında: **https://koestudio.vercel.app**

Adres 4 dosyada, 8 yerde geçiyor. İleride değişirse hepsini birden
güncelleyin:

- `index.html` — `canonical`, `og:url`, `og:image`, `twitter:image`, JSON-LD `url`
- `js/data/profile.js` — `siteUrl`
- `robots.txt` — `Sitemap:` satırı
- `sitemap.xml` — `<loc>` (ve `<lastmod>`)

Toplu bulmak için: `grep -rn "koestudio.vercel.app" .`

Neden göreli yol kullanılamıyor: sosyal medya botları (LinkedIn,
WhatsApp, X) `og:image` için **mutlak URL** ister. Göreli yol verilirse
paylaşımda görsel hiç çıkmaz.

### 2. CV PDF'i — ✅ tamam

`assets/cv/oguzhan-kul-cv.pdf` yerinde (tek sayfa, ~70 KB) ve
`profile.cvFile` ona işaret ediyor. "Download CV" düğmesi üç yerde
birden görünüyor: üst bar, hero ve CV bölümü.

**CV'yi güncellemek istediğinizde:**

1. `assets/cv/oguzhan-kul-cv.html` dosyasını düzenleyin (kaynak budur).
2. PDF'i yeniden üretin — iki yol var:

   **Komutla (hızlı):**
   ```bash
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="assets/cv/oguzhan-kul-cv.pdf" "assets/cv/oguzhan-kul-cv.html"
   ```

   **Elle:** HTML'i tarayıcıda açın → `Ctrl+P` → Hedef: PDF olarak
   kaydet → "Üstbilgi ve altbilgi" işaretini kaldırın → aynı klasöre
   aynı adla kaydedin.

3. Sitedeki CV bölümü ayrı bir kaynaktan basılıyor: `js/data/resume.js`.
   İçerik değiştiyse **ikisini birden** güncelleyin.

> `vercel.json` içinde `/assets/cv/` için ayrı bir önbellek kuralı var
> (1 saat). Diğer `assets/` dosyaları bir yıl `immutable` önbelleklenir;
> CV aynı dosya adıyla değiştirildiği için o kuralın dışında tutuldu,
> yoksa ziyaretçiler bir yıl boyunca eski CV'yi indirirdi.

### 3. Sosyal medya önizleme görseli — ✅ tamam

`assets/img/og-cover.jpg` hazır (1200×630, 52 KB) ve `index.html` içinde
`og:image` + `twitter:image` etiketleri aktif.

Kaynağı **`assets/img/og-cover.html`** — sitenin kendi tasarımıyla aynı
(koyu zemin, ızgara, pirinç parıltı, logo). Değiştirmek isterseniz o
dosyayı düzenleyip yeniden render edin; komut dosyanın içindeki yorumda.

> `og:image` **mutlak URL** ister; göreli yol çalışmaz. Yani alan adı
> değişince burası da güncellenmeli (aşağıdaki 1. maddeye dahil).

### 4. Ekran görüntüleri — ✅ tamam

Üç sitenin de gerçek ekran görüntüsü `assets/img/websites/` içinde
(1400px genişlik, JPEG %82, 78–89 KB). Kart oranı `16/9` — masaüstü
tarayıcı ekran görüntüsünün doğal oranına yakın, böylece kırpma az.

Yeni bir site eklerken ekran görüntüsünü komutla da alabilirsiniz:

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=1400,730 --screenshot="shot.png" "https://SITE-ADRESI"
```

Ardından ~150 KB altına inecek şekilde JPEG'e çevirip
`assets/img/websites/` içine koyun ve `websites.js` içinde `image:`
alanına yolu yazın. `null` bırakırsanız kart, site adının baş
harfleriyle tasarlanmış bir yer tutucu çizer — bozuk görsel çıkmaz.

### 5. Projeler bölümü

`js/data/projects.js` içindeki dizi **boş**. Uydurma proje eklenmedi;
bölüm şu an "Projects are being written up." şeklinde bir boş durum
gösteriyor.

CV'nize göre buraya girebilecek gerçek adaylar:
- Python ile yazdığınız otomasyonlar
- Ders kapsamında yaptığınız SQL / Power BI analizleri

Dosyadaki şablonu kopyalayıp doldurmanız yeterli. İlk proje eklendiği
anda kartlar ve (birden fazla kategori olursa) filtre çipleri otomatik
belirir.

### 6. E-posta adresi — ✅ tamam

Hem sitede (`js/data/profile.js`, JSON-LD, `index.html`) hem CV'de
(`assets/cv/oguzhan-kul-cv.html`) `oguzhankul01@hotmail.com`
kullanılıyor. Eski CV'deki `Oguzhankul1290@gmail.com` artık hiçbir
yerde geçmiyor.

---

## Vercel'e yayınlama

1. Bu klasörü kendi GitHub deposuna gönderin:

```bash
git init && git add . && git commit -m "Kişisel portfolyo sitesi" && git branch -M main
```

2. Depoyu GitHub'a ekleyip gönderin:

```bash
git remote add origin https://github.com/Oguzhan-35/portfolio.git && git push -u origin main
```

3. [vercel.com/new](https://vercel.com/new) adresinden depoyu içe aktarın.
   - **Framework Preset:** Other
   - **Build Command:** boş bırakın
   - **Output Directory:** boş bırakın (kök dizin)

Derleme adımı yoktur; Vercel dosyaları olduğu gibi yayınlar.
`vercel.json` güvenlik başlıklarını ve önbellek kurallarını uygular.

---

## Dosya yapısı

```
portfolio/
├── index.html              Tek sayfa — tüm bölümler
├── 404.html                Bulunamadı sayfası
├── css/
│   ├── fonts.css           @font-face tanımları
│   └── style.css           Tüm tasarım — 17 bölüm hâlinde yorumlanmış
├── js/
│   ├── theme.js            Tema seçimini ilk boyamadan önce uygular
│   ├── render.js           Veriyi DOM'a çevirir
│   ├── main.js             Davranışlar (menü, tema, modal, reveal, filtre)
│   └── data/
│       ├── profile.js      ┐
│       ├── skills.js       │ İÇERİK BURADA
│       ├── projects.js     │
│       ├── websites.js     │
│       └── resume.js       ┘
├── assets/
│   ├── fonts/              Manrope (woff2, latin & latin-ext)
│   ├── img/logo.png        Koe Design logosu — açık tema (siyah/beyaz zemin)
│   ├── img/logo-dark.png   Koe Design logosu — koyu tema + favicon (beyaz/siyah zemin)
│   ├── img/websites/       Site ekran görüntüleri (JPEG, ~1400px)
│   └── cv/                 CV PDF'i buraya (şu an boş)
├── vercel.json             Güvenlik başlıkları ve önbellek kuralları
├── robots.txt
├── sitemap.xml
├── site.webmanifest
└── README.md               Bu dosya
```

---

## Teknik notlar

**Yaklaşım:** Mobile-first. `style.css` içindeki temel kurallar telefon
için yazılmıştır; büyük ekranlar `min-width` medya sorgularıyla üzerine
eklenir. Kırılma noktaları: 640px, 700px, 720px, 880px, 900px
(masaüstü navigasyonu), 980px, 1040px, 1060px.

**Renk paleti:** Koyu tema varsayılan. Vurgu rengi pirinç sarısı
(`#E0A93F`) — developer portfolyolarının çoğunun kullandığı neon
camgöbeği/yeşil yerine bilinçli olarak seçildi. Açık tema aynı rolleri
daha koyu bir pirinçle (`#9A6A14`) karşılıyor; tercih `localStorage`'da
saklanıyor ve ilk boyamadan önce uygulanıyor (tema atlaması olmaz).

**İçerik neden JavaScript ile basılıyor:** "İçeriği tek bir dosyadan
yönetebileyim" isteğini build adımı olmadan karşılamanın yolu bu. Buna
karşılık, JavaScript çalıştırmayan tarayıcılara/botlara bakan her şey
statik HTML içinde duruyor: `<title>`, meta açıklama, Open Graph,
Twitter Card ve `schema.org/Person` JSON-LD. Sosyal medya önizleme
botları zaten sadece bu etiketleri okur, JS çalıştırmaz — yani paylaşım
önizlemeleri etkilenmez. Google ise JS çalıştırır.

**Erişilebilirlik:** İçeriğe atlama bağlantısı, `aria-expanded` /
`aria-controls` ile hamburger, `role="tab"` + `aria-selected` ile filtre
çipleri, `<dialog>` ile yerel odak tuzağı ve ESC, tüm ikonlarda
`aria-hidden` + erişilebilir etiket, görünür klavye odağı,
`prefers-reduced-motion` desteği.

**Performans:** Sıfır harici istek — font, ikon, CSS, JS hepsi kendi
alan adından. İkonlar tek bir satır içi SVG sprite. Hero arka planı
görsel veya canvas değil, saf CSS (grid + radial gradient). Scroll
dinleyicisi `requestAnimationFrame` ile sınırlandırılmış ve `passive`.
Görsellerde `loading="lazy"` + `width`/`height` (CLS önlenir).

**Gizlilik:** Çerez yok, analiz aracı yok, üçüncü taraf isteği yok.
Bu yüzden çerez onay çubuğu da gerekmiyor. `localStorage`'da sadece
tema tercihi tutuluyor — kişisel veri değil.

**Güvenlik:** `vercel.json` içinde CSP `script-src 'self'` ve
`style-src 'self'` — `unsafe-inline` yok. Bu yüzden sayfada satır içi
`<script>` veya `style="..."` özniteliği kullanılmıyor; tema betiği
ayrı bir dosyada (`js/theme.js`).

**Tarayıcı desteği:** Chrome, Edge, Firefox, Safari'nin güncel
sürümleri. ES modülleri, `<dialog>`, `color-mix()`, `clamp()`,
`:where()`, `dvh` birimi ve CSS özel değişkenleri kullanılmıştır.
Internet Explorer desteklenmez.

---

## Sık yapılacak değişiklikler

**Vurgu rengini değiştirmek:** `css/style.css` en üstteki `:root` bloğu
(`--accent`, `--accent-2`, `--accent-dim`, `--accent-line`) ve açık tema
için `[data-theme='light']` bloğundaki aynı dört değişken.

**Zemin rengini (`--bg`) değiştirmek — logoya dikkat:** Logo PNG'lerinin
kendi zemini, sayfa zeminiyle **birebir aynı renge** pişirilmiş durumda
(`logo-dark.png` → `#0A0B0D`, `logo.png` → `#FBFAF8`). Marka işaretinin
header'da kare bir çip gibi durmaması, tamamen zemine karışması bunun
sayesinde. `--bg` değerini değiştirirseniz bu iki dosyayı da yeni renge
göre yeniden üretmeniz gerekir, yoksa logonun arkasında hafif farklı
tonda bir kare belirir.

**Hero'daki spec kartına satır eklemek:** `profile.js` içindeki `spec`
dizisine `{ key: '...', value: '...' }` ekleyin. `accent: true` eklerseniz
değer pirinç renginde çıkar.

**Bölüm sırasını değiştirmek:** `index.html` içindeki `<section>`
bloklarını taşıyın; navigasyondaki `href`'ler ve mobil menüdeki
numaraları da güncelleyin.

**Yeni bölüm eklemek:** `index.html`'e bir `<section id="...">` ekleyin,
navigasyona ve mobil menüye link koyun. Bölüm başlığı için `.shead`
kalıbını kopyalayın.
