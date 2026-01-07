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
});