'use strict';
// Sabit örnek değerler: oyunun sunucusu ve telefon kodu da aynı sonucu bulmalı.
// Fixed test vector: the game's server and phone code must produce the same values.
//   node test.js

const assert = require('assert');
const { commitOf, rollAt } = require('./fairdice');
const { verify } = require('./verify');

const serverSeed = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const commit = 'a8ae6e6ee929abea3afcfc5258c8ccd6f85273e0d4626d26c7279f3250f77c8e';
const rolls = [4, 5, 6, 6, 5, 6, 3, 6, 4, 1];

assert.strictEqual(commitOf(serverSeed), commit);
const got = [];
for (let n = 0; n < 5; n++) got.push(...rollAt(serverSeed, 'abc', 'def', n));
assert.deepStrictEqual(got, rolls);

assert.strictEqual(verify({ serverSeed, commit, seed1: 'abc', seed2: 'def', rolls }).ok, true);
assert.strictEqual(verify({ serverSeed, commit, seed1: 'abc', seed2: 'def', rolls: [...rolls.slice(0, 9), 2] }).ok, false);
assert.strictEqual(verify({ serverSeed, commit: '00', seed1: 'abc', seed2: 'def', rolls }).ok, false);

// Her yüz eşit sıklıkta (ki-kare, 5 serbestlik derecesi, p≈0,001 sınırı 20,5).
const faces = [0, 0, 0, 0, 0, 0];
const N = 60000;
for (let n = 0; n < N; n++) for (const d of rollAt('f'.repeat(64), 'a', 'b', n)) faces[d - 1]++;
const exp = (2 * N) / 6;
assert.ok(faces.reduce((t, o) => t + (o - exp) ** 2 / exp, 0) < 20.5, `${faces}`);

console.log('Tüm testler geçti / all tests passed');
