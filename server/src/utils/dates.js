// Datas na hora de Portugal continental (Europe/Lisbon), com mudança de hora incluída.
const ZONE = 'Europe/Lisbon';

// Diferença em minutos entre a hora de Lisboa e UTC num dado instante (0 no inverno, 60 no verão).
function lisbonOffsetMinutes(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: ZONE, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(date).map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

// Último segundo (23:59:59) do dia em que `date` calha, na hora de Lisboa.
function endOfLisbonDay(date) {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return null;
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(start).split('-').map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
  return new Date(guess.getTime() - lisbonOffsetMinutes(guess) * 60000);
}

module.exports = { endOfLisbonDay };
