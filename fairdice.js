'use strict';
// Dürüst Tavla -- doğrulanabilir zar (commit-reveal).
//
// Bu dosya herkese açık "durust-tavla-zar" deposundaki fairdice.js ile AYNIDIR;
// birinde yapılan değişiklik ötekine de işlenmeli (istemci: Online/FairDice.cs).
//
// 1. Maç başında sunucu gizli bir tohum (serverSeed, 64 onaltılık harf) seçer ve
//    yalnız parmak izini (commit = SHA-256(serverSeed metni)) iki oyuncuya yollar.
// 2. Her oyuncu kendi tohumunu (clientSeed) yollar. Sunucu kendi tohumunu çoktan
//    kilitlediği için oyuncu tohumlarına göre seçemez; oyuncular da sunucu
//    tohumunu bilmediği için zarları önceden kestiremez.
// 3. n. zar atışı (0'dan sayılır):
//      HMAC-SHA256(anahtar = serverSeed, mesaj = "<tohum1>:<tohum2>:<n>:<c>")
//    c = 0'dan başlar. Çıkan 32 bayt sırayla okunur; 252'den küçük her bayt
//    (bayt % 6) + 1 olarak bir zar verir (252 ve üstü atlanır, böylece her yüz
//    eşit olasılıklıdır). İlk iki zar d1, d2'dir; 32 bayt yetmezse c bir artar.
// 4. Maç bitince sunucu serverSeed'i açıklar; herkes parmak izini ve bütün
//    zarları kendisi hesaplayıp maçta görülenlerle karşılaştırabilir.

const crypto = require('crypto');

const SEED_RE = /^[0-9A-Za-z]{1,64}$/;

/** Yeni sunucu tohumu: 32 rastgele bayt, onaltılık metin. */
function newServerSeed() {
  return crypto.randomBytes(32).toString('hex');
}

/** Parmak izi: tohum METNİNİN SHA-256'sı, onaltılık. */
function commitOf(serverSeed) {
  return crypto.createHash('sha256').update(serverSeed, 'utf8').digest('hex');
}

/** Oyuncu tohumu yalnız harf/rakam ve en çok 64 karakter; uymuyorsa null. */
function cleanClientSeed(seed) {
  return typeof seed === 'string' && SEED_RE.test(seed) ? seed : null;
}

/** n. atışın iki zarı. */
function rollAt(serverSeed, seed1, seed2, n) {
  const dice = [];
  for (let c = 0; dice.length < 2; c++) {
    const h = crypto.createHmac('sha256', Buffer.from(serverSeed, 'utf8'))
      .update(`${seed1}:${seed2}:${n}:${c}`, 'utf8')
      .digest();
    for (const b of h) {
      if (b < 252) dice.push((b % 6) + 1);
      if (dice.length === 2) break;
    }
  }
  return dice;
}

module.exports = { newServerSeed, commitOf, cleanClientSeed, rollAt };
