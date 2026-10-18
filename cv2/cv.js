document.addEventListener('DOMContentLoaded', () => {

    // 1. Running timecode since page load (HH:MM:SS:FF @ 25fps)
    const tc = document.getElementById('timecode');
    const start = performance.now();
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
        const t = (performance.now() - start) / 1000;
        tc.textContent = `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(Math.floor(t) % 60)}:${pad(Math.floor(t * 25) % 25)}`;
        requestAnimationFrame(tick);
    };
    tick();

    // 2. Export PDF via the print stylesheet
    document.getElementById('print-btn').addEventListener('click', () => window.print());

    // 3. Printed footer points at wherever this page is hosted
    if (location.protocol.startsWith('http')) {
        document.getElementById('site-url').textContent =
            location.host + location.pathname.replace(/cv\d\/(index\.html)?$/, '');
    }

    // 4. Glitch-in sections as they enter (faders slide up via .in)
    const items = document.querySelectorAll('.fx');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });
        items.forEach((el) => io.observe(el));
    } else {
        items.forEach((el) => el.classList.add('in'));
    }
    window.addEventListener('beforeprint', () => items.forEach((el) => el.classList.add('in')));

    // 5. Random glitch bursts on the name
    const glitches = document.querySelectorAll('.now .glitch');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
        setInterval(() => {
            glitches.forEach((g) => g.classList.add('burst'));
            setTimeout(() => glitches.forEach((g) => g.classList.remove('burst')), 350);
        }, 3200);
    }
});
