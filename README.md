# Şifre Kutusu 🔐

Fiziksel ipucu kartlarıyla mobil uygulamayı birleştiren, sınıf içi oynanmak üzere tasarlanmış hibrit bir eğitsel challenge oyunu. İki oyuncu kartlardan şifreyi çözer, telefona girer, doğru şifre rastgele bir final sorusu açar — öğretmen sözlü cevabı değerlendirir.

> **MVP durumu:** tek cihazda, internetsiz, iki oyuncu karşılıklı.

---

## Oynanış

1. **Kurulum:** Öğretmen oyuncu adları, doğru şifre, kategori, zorluk ve süre seçer.
2. **Şifre:** Oyuncular fiziksel kartlardan şifreyi çözer. Çözen oyuncu telefona girer.
3. **Final sorusu:** Doğru şifre rastgele bir soru açar, süre başlar.
4. **Değerlendirme:** Oyuncu sözlü cevap verir. Öğretmen ekrandan `Doğru` / `Yanlış` / `Süre Doldu` işaretler.
5. **Hak geçişi:** İlk oyuncu bilemezse aynı soru ikinci oyuncuya geçer, süre yeniden başlar.
6. **Sonuç:** Doğru cevaplayan kazanır. İkisi de bilemezse "Kazanan Yok".

---

## Kurulum

```bash
npm install
npm start           # QR kodu Expo Go ile okut
# veya
npm run android
npm run ios         # macOS gerekir
npm run web
```

Test için fiziksel kart gerekmez — şifreyi setup ekranında görebilirsin.

---

## Öğretmen kontrolleri

- **Ana ekrandaki "Oyunu Kur" butonu basılı tutmayla açılır.** Çocuk kazara ayarlara giremesin.
- **Şifre ekranındaki "Kuruluma Dön" da basılı tut gerektirir.** Çocuk şifreyi değiştiremesin.
- **Final soru ekranında "Öğretmen cevabı görür" kutusu.** Dokununca doğru cevap ve öğretmen notu (varsa) açılır — çocuk görmeyecek açıdan tutulur.
- **Şifre yanlışsa 3 saniye kilit.** Rastgele denemeyi azaltır.

---

## Teknoloji

- Expo (SDK 54) + React Native + TypeScript (strict)
- expo-router (dosya tabanlı routing)
- Context + `useReducer` (merkezi oyun state'i, phase guardlı)
- Local JSON soru havuzu (46 soru, 5 kategori × 3 zorluk)
- expo-haptics — oyuncaksı dokunma geri bildirimi

Backend yok, internet gerekmez, kullanıcı hesabı yok.

---

## Proje yapısı

```
app/                  # Ekranlar (expo-router)
  _layout.tsx         # Kök layout + GameProvider
  index.tsx           # Ana ekran (hold-to-open)
  setup.tsx           # Öğretmen kurulum
  code-entry.tsx      # Şifre girişi + keypad
  reveal.tsx          # "Şifre Doğru!" geçiş ekranı
  question.tsx        # Final soru + timer + öğretmen kararı
  handoff.tsx         # Hak geçiş ekranı
  result.tsx          # Sonuç + kutlama animasyonu
components/           # UI parçaları (Keypad, Timer, QuestionCard, ...)
context/              # GameContext + reducer
hooks/                # useGame, useTimer
utils/                # validateCode, getRandomQuestion, resetGame
data/questions.json   # Soru havuzu
types/                # TypeScript tipleri
constants/theme.ts    # Renk / spacing / radius / font
```

---

## Oyun durumu akışı

```
setup → code → reveal → question ─┬─ (doğru) ─→ result
                                  └─ (yanlış/süre) ─→ handoff → question ─→ result
```

Her ekran phase'i doğrular; geçersiz phase'de uygun ekrana yönlendirir. Reducer'daki her action da phase guard ile korunur — süre bitimi ile öğretmen butonu çakışırsa çift işlem yapılmaz.

---

## Bilinen sınırlar / yol haritası

- [ ] Birim testler (reducer, validateCode, getRandomQuestion, useTimer)
- [ ] Özel ikon / splash / proje kimliği görselleri
- [ ] Yaş seviyesi ayarı (sorularda `ageGroup` alanı)
- [ ] Skor/tur takibi (birden fazla tur)
- [ ] Soru havuzunda editörden soru ekleme
- [ ] Online çok oyunculu (ileride)

---

## Lisans

Eğitim amaçlı — özgür kullan.
