# FIZIKA FLASHCARDS — PREMIUM LEARNING WEB APP ⚡

> **270 sahifalik «FIZIKA — TO‘LIQ YODLASH QO‘LLANMASI» kitobi asosida yaratilgan professional interaktiv yodlash platformasi.**

---

## 🌟 Loyiha Haqida

Ushbu loyiha fizikani chuqur va tizimli yodlash, DTM/attestatsiya/olimpiada imtihonlariga tayyorlanish uchun ishlab chiqilgan zamonaviy Flashcard Web App hisoblanadi.

Kitobdagi 270 sahifadan **877 ta** eng muhim ta'riflar, 420+ ta formulalar (KaTeX matematik rendering bilan), fizik qonunlar, SI birliklari, o‘nli prefikslar, doimiylar, taqqoslash jadvallari (Farqlar) va xatolardan ogohlantirishlar kartalarga aylantirildi.

---

## 🚀 Asosiy Imkoniyatlar

1. **3D Flip Animatsiya**:
   - CSS `perspective: 1000px` va `transform-style: preserve-3d` asosida silliq (smooth) 3D karta aylanishi.
   - Touch va klaviatura orqali boshqarish (`Space` — aylantirish, `ArrowRight` — keyingi/bilaman, `ArrowLeft` — oldingi).

2. **A, B, C Yodlash Darajalari**:
   - **A — Mutlaqo yodlash shart** (535 ta karta — asosiy poydevor)
   - **B — Chuqur bilish shart** (275 ta karta — murakkabroq qonun va formulalar)
   - **C — Qo‘shimcha bilim** (67 ta karta — chuqurlashtirilgan bilimlar)

3. **12 ta Tizimli Bo‘lim**:
   - 1. Fizikaga kirish
   - 2. Mexanika
   - 3. Molekulyar fizika va termodinamika
   - 4. Elektr va magnetizm
   - 5. Tebranishlar va to‘lqinlar
   - 6. Optika
   - 7. Atom va yadro fizikasi
   - 8. Astronomiya va zamonaviy fizika
   - 9. Formulalar
   - 10. SI birliklari va prefikslar
   - 11. Fizik qonunlar
   - 12. Yakuniy nazorat va takrorlash savollari

4. **Spaced Repetition System (SRS)**:
   - Ebbingauz unutish egri chizig‘iga asoslangan: 1 kun, 3 kun, 7 kun, 14 kun va 30 kunlik intervallar.
   - Takrorlash vaqti kelgan kartalar avtomatik navbatga chiqadi.

5. **Formulalar Laboratoriyasi (Formula Explorer)**:
   - 420+ formulalar KaTeX bilan chiroyli matematik render qilingan.
   - Belgilar izohi, shartlari va SI birliklari aniq ko‘rsatilgan.

6. **Qo‘shimcha Rejimlar**:
   - **Xatolar ustida ishlash (Mistake Mode)**
   - **Sevimli kartalar (Favorites)**
   - **Tasodifiy test (Random Mode)**
   - **Kunlik maqsad (Daily Goal)** va **Streak (ketma-ket kunlar)**
   - **Ovozli eshitish (TTS - Text-to-Speech)**
   - **Dark Mode va Light Mode**

7. **Telegram Mini App (TMA) & 100% Bepul ($0 Server)**:
   - GitHub Pages orqali 24/7 ishlaydi.
   - Kompyuterni o‘chirib qo‘ysangiz ham Telegram botingizda va istalgan brauzerda doimiy ishlayveradi.

---

## 🛠 Texnologiyalar

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **KaTeX** (LaTeX matematik formulalar uchun)
- **Lucide Icons**
- **Canvas Confetti**
- **Telegram Mini App WebApp SDK**

---

## 💻 Mahalliy Ishga Tushirish

```bash
# Loyihani klonlash
git clone https://github.com/yomayo745-gif/fizika-flashcards.git
cd fizika-flashcards

# Kutubxonalarni o‘rnatish
npm install

# Dasturni ishga tushirish
npm run dev

# Production build
npm run build
```

---

## 🤖 Telegram Bot Bilan Ulash

Bot: `@usmonovtest_bot`

Telegram Bot Menu Button orqali Web App sifatida ulash uchun Telegram Bot API'ga `setChatMenuButton` buyrug‘i yuborilgan. Shunda bot chatining chap pastki qismida "Fizika Flashcards ⚡" tugmasi paydo bo‘ladi va uni bosganda web app to‘liq ekranda ochiladi.
