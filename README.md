# Şifre Kutusu

Fiziksel ipucu kartlarıyla mobil uygulamayı birleştiren, sınıf içi oynanmak üzere tasarlanmış hibrit bir eğitsel challenge oyunu. İki oyuncu kartlardan 4 haneli şifreyi çözer, telefondaki mekanik kilidi ayarlar, doğru şifre final sorusunu açar.

> MVP durumu: tek cihazda, internetsiz, iki oyunculu, öğretmen kontrollü.

## Oynanış

1. Öğretmen oyuncu adlarını, 4 haneli doğru şifreyi, kategori, zorluk ve süreyi seçer.
2. Oyuncular fiziksel kartlardan şifreyi çözer.
3. Çözen oyuncu telefondaki 4 haneli valiz tipi kilidi parmağıyla ayarlar.
4. Doğru şifre final sorusunu açar ve süre başlar.
5. Oyuncu sözlü cevap verir; öğretmen sonucu işaretler.
6. İlk oyuncu bilemezse aynı soru ikinci oyuncuya geçer.

## Kurulum

```bash
npm install
npm start
```

Expo Go ile QR kodu okut. Bağlantı sorunu olursa:

```bash
npx expo start --tunnel
```

## Build Alma

Web build almak için:

```bash
npm run build:web
```

Çıktı `dist/` klasörüne yazılır.

Android APK almak için önce Expo hesabına giriş yap:

```bash
npx eas login
npm run build:android
```

Bu komut `eas.json` içindeki `preview` profilini kullanır ve dahili dağıtım için APK üretir. Mağaza/production build için:

```bash
npm run build:android:production
npm run build:ios
```

Android ve iOS production build'i birlikte almak için:

```bash
npm run build:all
```

## Öğretmen Kontrolleri

- Ana ekrandaki kurulum girişi basılı tutma ile açılır.
- Şifre ekranından kuruluma dönüş yine basılı tutma ister.
- Setup ekranına doğrudan URL/deep-link ile girilirse ana ekrana dönülür.
- Final soru ekranındaki cevap anahtarı basılı tutma ile açılır.
- Yanlış şifrede mekanik kilit 3 saniye kilitlenir.

## Teknoloji

- Expo SDK 54 + React Native + TypeScript strict
- Expo Router
- Context + `useReducer`
- Local JSON soru havuzu
- `expo-haptics`, React Native `Animated`, `PanResponder`
- Backend, hesap sistemi ve internet gereksinimi yok

## Proje Yapısı

```text
app/
  index.tsx           Ana ekran
  setup.tsx           Öğretmen kurulum
  player-select.tsx   Oyuncu seçim ekranı
  code-entry.tsx      4 haneli mekanik kilit
  reveal.tsx          Şifre doğru geçişi
  question.tsx        Final soru + timer
  result.tsx          Sonuç ekranı
components/
  CombinationLock.tsx Mekanik kilit gövdesi
  LockWheel.tsx       Tek haneli kaydırmalı tambur
  Timer.tsx
  QuestionCard.tsx
  PlayerBadge.tsx
context/
data/
hooks/
utils/
types/
constants/
```

## Kontroller

```bash
npm run lint
npm run typecheck
npm run build:web
```

## Yol Haritası

- Birim testler
- Özel ikon ve splash görselleri
- Yaş seviyesi filtresi
- Birden fazla tur için skor takibi
- Öğretmen soru editörü
