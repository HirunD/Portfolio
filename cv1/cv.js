document.addEventListener('DOMContentLoaded', () => {

    // 1. Live Galle clock in the top bar
    const clock = document.getElementById('clock');
    const tick = () => {
        clock.textContent = new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Colombo'
        });
    };
    tick();
    setInterval(tick, 10000);

    // 2. Save as PDF (uses the print stylesheet)
    document.getElementById('print-btn').addEventListener('click', () => window.print());

    // 3. Point the printed footer at wherever this page is hosted
    if (location.protocol.startsWith('http')) {
        document.getElementById('site-url').textContent =
            location.host + location.pathname.replace(/cv\d\/(index\.html)?$/, '');
    }

    // 4. Reveal sections on scroll
    const items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        items.forEach((el) => io.observe(el));
    } else {
        items.forEach((el) => el.classList.add('in'));
    }

    // Printing before scrolling would otherwise hide unrevealed sections
    window.addEventListener('beforeprint', () => items.forEach((el) => el.classList.add('in')));
});
