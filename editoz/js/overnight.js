// CLIP: how part-time works. Two clocks + a dual timezone track, computed from
// real IANA timezones so daylight saving is always right.

const two = (n) => String(n).padStart(2, '0');
const hm = (min) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${two(Math.floor(m / 60))}:${two(m % 60)}`;
};
const parseHm = (s) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

// minutes east of UTC for a timezone at a given moment
function tzOffset(timeZone, date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
  }).formatToParts(date);
  const g = (t) => Number(parts.find((p) => p.type === t).value);
  const asUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'));
  return Math.round((asUtc - Math.floor(date.getTime() / 60000) * 60000) / 60000);
}

export function initOvernight({ gsap, content, reduced }) {
  const root = document.querySelector('[data-overnight]');
  if (!root) return;
  const o = content.partTime.overnight;
  const R = content.recipient;
  const S = content.sender;

  const diff = tzOffset(R.timezone, new Date()) - tzOffset(S.timezone, new Date()); // recipient ahead by, minutes
  const start = o.briefAt * 60; // recipient local
  const span = ((o.readyBy * 60 - start + 1440) % 1440) || 1440;
  const pos = (rMin) => (((rMin - start) % 1440) + 1440) % 1440 / span * 100; // recipient minutes → % of lane
  const fromSender = (sMin) => sMin + diff;
  const workStart = fromSender(parseHm(o.workWindow[0]));
  const workEnd = fromSender(parseHm(o.workWindow[1]));
  const jobEnd = fromSender(parseHm(o.dayJobUntil));

  // ── lanes ──
  const seg = (cls, a, b, text) =>
    `<span class="seg ${cls}" style="left:${a}%;width:${Math.max(0, b - a)}%">${text}</span>`;
  const pin = (p, text, cls = '') => `<span class="pin ${cls}" style="left:${p}%"><span>${text}</span></span>`;
  const ticks = (toLocal) =>
    [0, 1, 2, 3, 4]
      .map((k) => {
        const r = start + (k * span) / 4;
        return `<span class="tick" style="left:${(k / 4) * 100}%">${hm(toLocal(r))}</span>`;
      })
      .join('');

  root.querySelector('[data-row="recipient"] .ntrack__lane').innerHTML =
    seg('seg--sleep', pos(22 * 60), pos(7 * 60), 'asleep') +
    pin(0, 'BRIEF', 'pin--start') +
    pin(100, 'READY', 'pin--end') +
    ticks((r) => r);
  root.querySelector('[data-row="sender"] .ntrack__lane').innerHTML =
    seg('seg--job', 0, Math.min(100, pos(jobEnd)), 'day job') +
    seg('seg--work', pos(workStart), Math.min(100, pos(workEnd)), 'yours') +
    pin(Math.min(100, pos(workEnd)), 'DONE') +
    ticks((r) => r - diff);

  // ── clocks ──
  const clocks = {
    recipient: root.querySelector('[data-clock="recipient"]'),
    sender: root.querySelector('[data-clock="sender"]'),
  };
  const status = root.querySelector('[data-status]');
  const setClock = (el, min) => {
    const m = ((min % 1440) + 1440) % 1440;
    el.querySelector('.clock__h').setAttribute('transform', `rotate(${((m / 60) % 12) * 30} 50 50)`);
    el.querySelector('.clock__m').setAttribute('transform', `rotate(${(m % 60) * 6} 50 50)`);
    el.querySelector('.clock__time').textContent = hm(m);
  };
  const workStartAt = pos(workStart) / 100 * span;
  const workEndAt = pos(workEnd) / 100 * span;
  const render = (t) => {
    setClock(clocks.recipient, start + t);
    setClock(clocks.sender, start + t - diff);
    status.textContent =
      t >= span ? `READY BY ${hm(start + span)}` : t >= workEndAt ? 'DONE, WHILE YOU SLEEP' : t >= workStartAt ? 'IN PROGRESS' : 'BRIEF SENT';
  };

  // ── now line ──
  const now = root.querySelector('[data-now]');
  const hrs = diff / 60;
  const tickNow = () => {
    const d = new Date();
    const f = (tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(d);
    now.textContent = `Right now: ${f(S.timezone)} in ${S.city}, ${f(R.timezone)} in ${R.city}. ${R.city} is ${hrs} hour${hrs === 1 ? '' : 's'} ahead.`;
  };
  tickNow();
  setInterval(tickNow, 30_000);

  if (reduced) {
    render(span);
    return;
  }
  render(0);
  const proxy = { t: 0 };
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      gsap.to(proxy, { t: span, duration: 2.6, ease: 'power1.inOut', delay: 0.2, onUpdate: () => render(proxy.t) });
    },
    { threshold: 0.45 }
  );
  io.observe(root.querySelector('.clocks'));
}
