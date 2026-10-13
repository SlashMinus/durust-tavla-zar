#!/usr/bin/env node
'use strict';
// Dürüst Tavla zar doğrulayıcı (komut satırı).
// Kullanım: oyundaki maç sonu ekranında "Zarları Doğrula" > "Bilgileri Kopyala",
// sonra:   node verify.js '<kopyalanan JSON>'
//   ya da: node verify.js dosya.json
//
// Dürüst Tavla dice verifier (command line). In the game's end-of-match screen tap
// "Verify Dice" > "Copy Data", then run: node verify.js '<copied JSON>'

const fs = require('fs');
const { commitOf, rollAt } = require('./fairdice');

function verify(data) {
  const lines = [];
  let ok = true;
  const check = (pass, text) => {
    lines.push(`${pass ? 'TAMAM / OK    ' : 'HATA / FAILED '} ${text}`);
    if (!pass) ok = false;
  };

  check(commitOf(data.serverSeed) === data.commit,
    `SHA-256(serverSeed) = commit  (${data.commit})`);

  const rolls = data.rolls || [];
  let same = rolls.length % 2 === 0;
  let firstBad = -1;
  for (let n = 0; same && n < rolls.length / 2; n++) {
    const [d1, d2] = rollAt(data.serverSeed, data.seed1 || '', data.seed2 || '', n);
    if (d1 !== rolls[2 * n] || d2 !== rolls[2 * n + 1]) {
      same = false;
      firstBad = n + 1;
    }
  }
  check(same, same
    ? `${rolls.length / 2} atışın hepsi tohumlardan aynı çıktı / all ${rolls.length / 2} rolls match the seeds`
    : `${firstBad}. atış uyuşmuyor / roll #${firstBad} does not match`);
  return { ok, lines };
}

if (require.main === module) {
  const arg = process.argv[2];
  if (!arg) {
    console.log("Kullanım / usage: node verify.js '<JSON>'  |  node verify.js file.json");
    process.exit(2);
  }
  const text = arg.trim().startsWith('{') ? arg : fs.readFileSync(arg, 'utf8');
  const { ok, lines } = verify(JSON.parse(text));
  for (const l of lines) console.log(l);
  process.exit(ok ? 0 : 1);
}

module.exports = { verify };
