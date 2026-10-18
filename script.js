document.addEventListener('DOMContentLoaded', () => {

    // 1. VJ Background Particles
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 100, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#ffffff" },
            "opacity": { "value": 0.3, "random": true },
            "size": { "value": 2, "random": true },
            "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.1, "width": 1 },
            "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "out_mode": "out" }
        },
        "interactivity": {
            "events": { "onhover": { "enable": true, "mode": "bubble" } },
            "modes": { "bubble": { "distance": 200, "size": 4, "duration": 2, "opacity": 0.8 } }
        }
    });

    // 2. Typing Effect
    const type1 = document.getElementById('type');
    const type2 = document.getElementById('type2');
    const txt1 = "Designing Digital Experiences.";
    const txt2 = "Creative Technologist // 3D Previz // Web Developer";

    let i = 0, j = 0;

    function typing() {
        if (i < txt1.length) {
            type1.innerHTML += txt1.charAt(i); i++;
            setTimeout(typing, 60);
        } else if (j < txt2.length) {
            type2.innerHTML += txt2.charAt(j); j++;
            setTimeout(typing, 30);
        }
    }
    typing();

    // 3. Live Website Previews
    const screens = document.querySelectorAll('.browser-screen');

    // Scale the desktop-width iframe down to fit its frame
    const fit = (screen) => {
        const frame = screen.querySelector('iframe');
        const scale = screen.clientWidth / 1440;
        frame.style.transform = `scale(${scale})`;
        frame.style.height = `${screen.clientHeight / scale}px`;
    };
    const resizer = new ResizeObserver(entries => entries.forEach(e => fit(e.target)));

    // Only load a site once it scrolls near the viewport
    const loader = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const frame = entry.target.querySelector('iframe');
            frame.src = frame.dataset.src;
            loader.unobserve(entry.target);
        });
    }, { rootMargin: '300px' });

    screens.forEach(screen => {
        resizer.observe(screen);
        loader.observe(screen);

        // Click to interact; leaving the frame locks it again so page scrolling isn't hijacked
        screen.querySelector('.screen-overlay').addEventListener('click', () => {
            screen.classList.add('active');
            screen.querySelector('iframe').removeAttribute('tabindex');
        });
        screen.addEventListener('mouseleave', () => {
            screen.classList.remove('active');
            screen.querySelector('iframe').setAttribute('tabindex', '-1');
        });
    });
});