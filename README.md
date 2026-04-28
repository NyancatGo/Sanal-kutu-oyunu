# Şifre Kutusu

Fiziksel not alma/ipuçlarıyla mobil uygulamayı birleştiren, sınıf içi oynanmak üzere tasarlanmış hibrit bir eğitsel challenge oyunu. İki grup sırayla şifre bulma sorularını cevaplar; her doğru cevap, grubun gizli şifresindeki sıradaki haneyi kazandırır. 4 haneyi tamamlayan grup kilidi açıp final sorusuna geçer.

> MVP durumu: tek cihazda, internetsiz, iki gruplu, öğretmen kontrollü.

## Oynanış

1. Öğretmen grup adlarını; şifre bulma soruları ve final sorusu için ayrı kategori, zorluk ve süreleri seçer.
2. Sistem her grup için arka planda birbirinden farklı gizli 4 haneli şifre üretir.
3. Her hane sorusu başlamadan önce aktif grup için hazır ekranı açılır.
4. Gruplar sırayla seçilen şifre bulma havuzundan gelen soruları cevaplar.
5. Doğru cevapta hane kazanılır; yanlış cevapta hane verilmez ve sıra diğer gruba geçer.
6. Dört haneyi tamamlayan grup telefondaki mekanik kilide kendi kağıdındaki şifreyi girer.
7. Doğru şifre final hazır ekranını ve ardından final sorusunu açar. Finali bilen grup oyunu kazanır; bilemezse aynı final diğer gruba geçer.

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
- Kilit ekranından kuruluma dönüş yine basılı tutma ister.
- Setup ekranına doğrudan URL/deep-link ile girilirse ana ekrana dönülür.
- Hane ve final soru ekranındaki cevap anahtarı basılı tutma ile açılır.
- Soru süresi hazır ekranındaki başlatma onayından sonra başlar.
- Gizli şifreler sistem tarafından üretilir; tam şifre uygulamada topluca gösterilmez.

## Teknoloji

- Expo SDK 54 + React Native + TypeScript strict
- Expo Router
- Context + `useReducer`
- Local JSON şifre bulma ve final soru havuzu
- `expo-haptics`, React Native `Animated`, `PanResponder`
- Backend, hesap sistemi ve internet gereksinimi yok

## Proje Yapısı

```text
app/
  index.tsx           Ana ekran
  setup.tsx           Öğretmen kurulum
  player-select.tsx   Eski rota için yönlendirme ekranı
  question.tsx        Hazır ekranı + hane/final soru + timer
  reveal.tsx          Hane kazanıldı ekranı
  code-entry.tsx      4 haneli mekanik kilit
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
- Çoklu oyun/oturum skor takibi
- Öğretmen soru editörü
