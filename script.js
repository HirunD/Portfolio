
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
  }else{
typeWriter2();

  }
}


function typeWriter2() {
    // console.log();
    
    if (i2 < txt2.length) {
      document.getElementById("type2").innerHTML += txt2.charAt(i2);
      i2++;
      setTimeout(typeWriter2, 25);
    }else{
      document.getElementById("explore").style.display = "inline-block";
    }
  }


  setTimeout(() => {
typeWriter();
    
  }, 100);


//   function toggleMenu() {
//     document.querySelector('.nav-links').classList.toggle('nav-active');
// }