const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgres://test:test@127.0.0.1:5432/test';
const { endOfLisbonDay } = require('../src/utils/dates');
const { Event } = require('../src/models');

test('endOfLisbonDay devolve 23:59:59 de Lisboa no inverno e no verão', () => {
  // Inverno: Lisboa = UTC.
  assert.equal(endOfLisbonDay('2026-12-07T21:00:00Z').toISOString(), '2026-12-07T23:59:59.000Z');
  // Verão: Lisboa = UTC+1, por isso 23:59:59 local são 22:59:59 UTC.
  assert.equal(endOfLisbonDay('2026-07-10T20:00:00Z').toISOString(), '2026-07-10T22:59:59.000Z');
  // 23:30 UTC no verão já é dia seguinte em Lisboa (00:30).
  assert.equal(endOfLisbonDay('2026-07-10T23:30:00Z').toISOString(), '2026-07-11T22:59:59.000Z');
  assert.equal(endOfLisbonDay('não é data'), null);
});

test('eventos sem data de fim terminam no fim do dia em que começam', async () => {
  const concert = Event.build({ title: 'Concerto', slug: 'concerto', description: 'x', categoryId: 1, city: 'Lisboa', startsAt: new Date('2026-12-11T21:30:00Z') });
  await concert.validate();
  assert.equal(concert.endsAt.toISOString(), '2026-12-11T23:59:59.000Z');

  const exhibition = Event.build({ title: 'Expo', slug: 'expo', description: 'x', categoryId: 4, city: 'Lisboa', startsAt: new Date('2026-12-03T10:00:00Z'), endsAt: new Date('2027-05-09T18:30:00Z') });
  await exhibition.validate();
  assert.equal(exhibition.endsAt.toISOString(), '2027-05-09T18:30:00.000Z');
});
