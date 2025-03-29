var i = 0;
var i2 = 0;
var txt = `Hi, I'm Hirun Dilshan Wickramasinghe`;
var txt2 = `I'm a passionate developer with experience in web development and coding. Welcome to my portfolio!`;

var speed = 50;

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("type").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  } else {
    typeWriter2();
  }
}

function typeWriter2() {
  if (i2 < txt2.length) {
    document.getElementById("type2").innerHTML += txt2.charAt(i2);
    i2++;
    setTimeout(typeWriter2, 25);
  } else {
    document.getElementById("explore").style.display = "inline-block";
  }
}

setTimeout(() => {
  typeWriter();
}, 100);

// Scroll Reveal Logic (Improved)
function revealOnScroll() {
  const reveals = document.querySelectorAll(".scroll-reveal");

  for (let i = 0; i < reveals.length; i++) {
    const windowHeight = window.innerHeight;
    const revealTop = reveals[i].getBoundingClientRect().top;
    const revealBottom = reveals[i].getBoundingClientRect().bottom;

    if (revealTop < windowHeight - 100 && revealBottom > 100) {
        reveals[i].classList.add("active");
    } else {
        reveals[i].classList.remove("active");
    }
  }
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll(); // Trigger on page load