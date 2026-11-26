document.addEventListener('DOMContentLoaded', () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];

    /* ---------- Local clock (Galle) ---------- */
    const clock = $('#clock');
    const tick = () => {
        clock.textContent = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Colombo'
        }).format(new Date());
    };
    tick(); setInterval(tick, 30000);
    $('#year').textContent = new Date().getFullYear();

    /* ---------- Reveal on scroll ---------- */
    const revealer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            revealer.unobserve(e.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    $$('.reveal').forEach(el => revealer.observe(el));

    /* ---------- Prologue: words light up as you read ---------- */
    const statement = $('#statement');
    const wrapWords = (node) => {
        [...node.childNodes].forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach(part => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.append(part); return; }
                    const s = document.createElement('span');
                    s.className = 'w'; s.textContent = part;
                    frag.append(s);
                });
                child.replaceWith(frag);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                wrapWords(child);
            }
        });
    };
    wrapWords(statement);
    const words = $$('.w', statement);

    /* ---------- Chapters, timecode & progress ---------- */
    const chapters = $$('[data-chapter]');
    const nowNum = $('#now-num'), nowTitle = $('#now-title');
    const tc = $('#tc'), fill = $('#hud-fill'), track = $('#hud-track');
    const RUNTIME = 4 * 60 + 32; // the page "runs" 4:32 at 25fps
    const pad = n => String(n).padStart(2, '0');

    // chapter tick marks on the HUD track
    const placeTicks = () => {
        $$('.tick', track).forEach(t => t.remove());
        const max = document.documentElement.scrollHeight - innerHeight;
        $$('.chapter, .contact').forEach(sec => {
            const t = document.createElement('i');
            t.className = 'tick';
            t.style.left = `${Math.min(100, (sec.offsetTop / max) * 100)}%`;
            track.append(t);
        });
    };

    let current = null;
    const onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
        fill.style.width = `${p * 100}%`;

        const totalFrames = Math.round(p * RUNTIME * 25);
        const f = totalFrames % 25, s = Math.floor(totalFrames / 25);
        tc.textContent = `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(f)}`;

        // which chapter is under the middle of the screen
        const mid = innerHeight * 0.45;
        let active = chapters[0];
        chapters.forEach(c => { if (c.getBoundingClientRect().top <= mid) active = c; });
        if (active !== current) {
            current = active;
            nowNum.textContent = active.dataset.chapter;
            nowTitle.textContent = active.dataset.title;
        }

        // prologue word highlight
        if (!reduced) {
            const r = statement.getBoundingClientRect();
            const prog = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
            const lit = Math.round(prog * words.length);
            words.forEach((w, i) => w.classList.toggle('lit', i < lit));
        }
    };
    let ticking = false;
    addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { onScroll(); ticking = false; });
    }, { passive: true });
    addEventListener('resize', () => { placeTicks(); onScroll(); });
    addEventListener('load', () => { placeTicks(); onScroll(); });
    placeTicks(); onScroll();

    /* ---------- Index menu ---------- */
    const indexBtn = $('#index-btn'), menu = $('#index-menu');
    const setMenu = (open) => {
        menu.hidden = !open;
        indexBtn.setAttribute('aria-expanded', open);
        indexBtn.querySelector('span').textContent = open ? 'Close' : 'Index';
        document.body.classList.toggle('menu-open', open);
        if (open) menu.querySelector('a').focus();
    };
    indexBtn.addEventListener('click', () => setMenu(menu.hidden));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); indexBtn.focus(); } });

    /* ---------- YouTube thumbnails (best quality available) ---------- */
    $$('img[data-thumb]').forEach(img => {
        const id = img.dataset.thumb;
        img.src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
        img.addEventListener('load', () => {
            // YouTube serves a 120px placeholder when maxres doesn't exist
            if (img.naturalWidth <= 120) img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        }, { once: true });
    });

    /* ---------- Local video loops: load & play only when visible ---------- */
    const loops = $$('video.loop');
    const looper = new IntersectionObserver(entries => {
        entries.forEach(({ target: v, isIntersecting }) => {
            if (isIntersecting) {
                if (!v.src) { v.src = v.dataset.src; v.preload = 'auto'; }
                if (!reduced) v.play().catch(() => {});
            } else if (v.src) {
                v.pause();
            }
        });
    }, { rootMargin: '200px' });
    loops.forEach(v => looper.observe(v));

    /* ---------- Video player (dialog) ---------- */
    const player = $('#player'), playerFrame = $('#player-frame');
    const closePlayer = () => { player.close(); };
    player.addEventListener('close', () => { playerFrame.innerHTML = ''; });
    $('#player-close').addEventListener('click', closePlayer);
    player.addEventListener('click', e => { if (e.target === player) closePlayer(); });
    $$('.play[data-yt]').forEach(btn => btn.addEventListener('click', () => {
        playerFrame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0&modestbranding=1" title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
        player.showModal();
    }));

    /* ---------- Short-form reels: load the embed on demand ---------- */
    $$('.reel').forEach(reel => {
        $('.reel-face', reel).addEventListener('click', () => {
            const f = document.createElement('iframe');
            f.src = reel.dataset.embed;
            f.title = 'Short-form video';
            f.allow = 'autoplay; encrypted-media; fullscreen';
            f.allowFullscreen = true;
            reel.innerHTML = '';
            reel.append(f);
        });
    });

    /* ---------- Live website viewer ---------- */
    const screen = $('#site-screen'), frame = $('#site-frame');
    const urlLabel = $('#site-url'), openLink = $('#site-open');
    const tabs = $$('.site-list [role="tab"]');

    // render the site at a real device width, then scale it to fit
    const fit = () => {
        const virtual = screen.clientWidth < 520 ? 390 : 1440;
        const scale = screen.clientWidth / virtual;
        frame.style.width = `${virtual}px`;
        frame.style.transform = `scale(${scale})`;
        frame.style.height = `${screen.clientHeight / scale}px`;
    };
    new ResizeObserver(fit).observe(screen);

    const lock = () => { screen.classList.remove('active'); frame.setAttribute('tabindex', '-1'); };
    const loadSite = (tab) => {
        tabs.forEach(t => t.setAttribute('aria-selected', t === tab));
        urlLabel.textContent = tab.dataset.label;
        openLink.href = tab.dataset.url;
        lock();
        screen.classList.add('loading');
        frame.src = tab.dataset.url;
    };
    frame.addEventListener('load', () => screen.classList.remove('loading'));
    tabs.forEach(t => t.addEventListener('click', () => loadSite(t)));

    // only load the first site once the chapter is close
    new IntersectionObserver((entries, obs) => {
        if (!entries[0].isIntersecting) return;
        loadSite(tabs.find(t => t.getAttribute('aria-selected') === 'true'));
        obs.disconnect();
    }, { rootMargin: '400px' }).observe(screen);

    // click to interact; leaving the frame locks it so page scroll isn't hijacked
    $('.screen-overlay', screen).addEventListener('click', () => {
        screen.classList.add('active');
        frame.removeAttribute('tabindex');
    });
    screen.addEventListener('mouseleave', lock);

    /* ---------- VJ engine sketch ---------- */
    const canvas = $('#engine');
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, t = 0, running = false;
    const size = () => {
        const dpr = Math.min(2, devicePixelRatio || 1);
        W = canvas.clientWidth; H = canvas.clientHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    new ResizeObserver(size).observe(canvas);
    const draw = () => {
        ctx.fillStyle = 'rgba(5,4,4,0.22)';
        ctx.fillRect(0, 0, W, H);
        const lines = 26;
        for (let i = 0; i < lines; i++) {
            const k = i / lines;
            ctx.beginPath();
            for (let x = 0; x <= W; x += 6) {
                const y = H / 2
                    + Math.sin(x * 0.012 + t * 1.3 + k * 6) * H * 0.18 * Math.sin(t * 0.4 + k * 3)
                    + Math.sin(x * 0.031 - t * 0.9 + k * 2) * H * 0.07
                    + (k - 0.5) * H * 0.5;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            const a = 0.15 + 0.6 * Math.abs(Math.sin(t * 0.7 + k * 4));
            ctx.strokeStyle = i % 5 === 0 ? `rgba(255,148,64,${a})` : `rgba(239,233,223,${a * 0.35})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        t += 0.012;
        if (running) requestAnimationFrame(draw);
    };
    new IntersectionObserver(entries => {
        const vis = entries[0].isIntersecting;
        if (vis && !running) {
            running = true;
            if (reduced) { running = false; for (let i = 0; i < 40; i++) draw(); }
            else requestAnimationFrame(draw);
        } else if (!vis) running = false;
    }).observe(canvas);
});
