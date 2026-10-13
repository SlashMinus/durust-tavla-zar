# Dürüst Tavla — Zar Doğrulama / Dice Verification

**Türkçe** · [English](#english)

Dürüst Tavla'nın çevrim içi maçlarındaki zarlar bu depodaki `fairdice.js` ile üretilir.
Bu dosya oyunun sunucusundakiyle **birebir aynıdır**. Her maçın zarlarını kendin doğrulayabilirsin.

## Nasıl doğrularım?

1. Maç bitince sonuç ekranında **Zarları Doğrula**'ya bas. Telefonun bütün zarları kendisi yeniden hesaplar.
2. Telefona da güvenmek istemiyorsan **Bilgileri Kopyala**'ya bas ve kopyalananı
   [tarayıcıdaki doğrulayıcıya](https://slashminus.github.io/durust-tavla-zar/) yapıştır
   (hesap senin cihazında yapılır, hiçbir yere veri gitmez), ya da bilgisayarda:

   ```
   node verify.js '<kopyalanan metin>'
   ```

## Nasıl çalışıyor? (commit-reveal)

1. Maç başlamadan sunucu gizli bir tohum (`serverSeed`, 64 onaltılık karakter) seçer ve iki oyuncuya
   yalnız **parmak izini** yollar: `commit = SHA-256(serverSeed)`.
2. İki oyuncunun telefonu da kendi tohumunu (`seed1`, `seed2`) yollar. Sunucu kendi tohumunu çoktan
   kilitlediği için oyuncu tohumlarına göre seçemez; oyuncular da sunucu tohumunu bilmediği için zarları
   önceden kestiremez.
3. `n`. atışın zarları (0'dan sayılır):
   `HMAC-SHA256(anahtar = serverSeed, mesaj = "seed1:seed2:n:c")`, `c = 0, 1, ...`.
   Çıkan baytlar sırayla okunur; 252'den küçük her bayt `(bayt % 6) + 1` olarak bir zardır
   (252 ve üstü atlanır, böylece her yüz tam olarak eşit olasılıklıdır). İlk iki zar o atışın zarlarıdır.
4. Maç bitince sunucu `serverSeed`'i açıklar. Parmak izi tutuyor ve bütün zarlar bu formülden aynı
   çıkıyorsa, zarlar maç sırasında değiştirilmemiştir.

Bilgisayara karşı (çevrim dışı) maçlarda zarlar telefonda atılır; bu doğrulama çevrim içi maçlar içindir.

## Dosyalar

| dosya | ne işe yarar |
|---|---|
| `fairdice.js` | Zar üretimi — sunucudaki dosyanın aynısı |
| `verify.js` | Komut satırı doğrulayıcı |
| `index.html` | Tarayıcıda çalışan doğrulayıcı (dış bağlantı yok) |
| `test.js` | Sabit örnek değerler ve eşit dağılım testi: `node test.js` |

Sabit örnek: `serverSeed = "0123456789abcdef" × 4`, `seed1 = "abc"`, `seed2 = "def"` →
`commit = a8ae6e6ee929abea3afcfc5258c8ccd6f85273e0d4626d26c7279f3250f77c8e`,
ilk beş atış `4-5, 6-6, 5-6, 3-6, 4-1`.

---

## English

The dice in Dürüst Tavla's online matches are produced by `fairdice.js` in this repository.
The file is **identical** to the one running on the game's server. You can verify the dice of every match yourself.

### How do I verify?

1. When the match ends, tap **Verify Dice** on the results screen. Your phone recalculates every roll itself.
2. If you don't want to trust the phone either, tap **Copy Data** and paste it into the
   [browser verifier](https://slashminus.github.io/durust-tavla-zar/)
   (everything runs on your device, nothing is sent anywhere), or on a computer:

   ```
   node verify.js '<copied text>'
   ```

### How it works (commit-reveal)

1. Before the match starts the server picks a secret seed (`serverSeed`, 64 hex characters) and sends both
   players only its **fingerprint**: `commit = SHA-256(serverSeed)`.
2. Both players' phones send their own seed (`seed1`, `seed2`). The server has already locked its seed, so
   it cannot pick it to suit the players' seeds; the players don't know the server seed, so they cannot
   predict the dice.
3. The dice of roll `n` (counted from 0):
   `HMAC-SHA256(key = serverSeed, message = "seed1:seed2:n:c")`, `c = 0, 1, ...`.
   The bytes are read in order; every byte below 252 gives one die as `(byte % 6) + 1`
   (252 and above are skipped, so every face is exactly equally likely). The first two dice are that roll.
4. When the match ends the server reveals `serverSeed`. If the fingerprint matches and every roll comes out
   the same from this formula, the dice were not changed during the match.

Matches against the computer (offline) roll the dice on the phone; this verification is for online matches.

Test vector: `serverSeed = "0123456789abcdef" × 4`, `seed1 = "abc"`, `seed2 = "def"` →
`commit = a8ae6e6ee929abea3afcfc5258c8ccd6f85273e0d4626d26c7279f3250f77c8e`,
first five rolls `4-5, 6-6, 5-6, 3-6, 4-1`.

License: MIT (see `LICENSE`).
