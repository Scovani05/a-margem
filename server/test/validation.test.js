const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanText, isEmail, isHttpUrl, isSafeAssetRef } = require('../src/middleware/validate');
const slugify = require('../src/utils/slugify');

test('validates email addresses and rejects malformed or oversized values', () => {
  assert.equal(isEmail('reader@example.pt'), true);
  assert.equal(isEmail('missing-at.example.pt'), false);
  assert.equal(isEmail(`a${'x'.repeat(254)}@example.pt`), false);
});

test('accepts only http(s) external links', () => {
  assert.equal(isHttpUrl('https://example.pt/event'), true);
  assert.equal(isHttpUrl('http://localhost:4000'), true);
  assert.equal(isHttpUrl('javascript:alert(1)'), false);
  assert.equal(isHttpUrl('//example.pt/path'), false);
});

test('permits safe local image paths and secure remote images', () => {
  assert.equal(isSafeAssetRef('/images/cover.svg'), true);
  assert.equal(isSafeAssetRef('https://images.example.pt/photo.jpg'), true);
  assert.equal(isSafeAssetRef('//images.example.pt/photo.jpg'), false);
  assert.equal(isSafeAssetRef('/images/../private.txt'), false);
});

test('checks non-empty bounded text and creates readable accented slugs', () => {
  assert.equal(cleanText('  Uma boa pista  ', 40), true);
  assert.equal(cleanText('   ', 40), false);
  assert.equal(cleanText('texto demasiado longo', 5), false);
  assert.equal(slugify('À descoberta do Norte!'), 'a-descoberta-do-norte');
});
