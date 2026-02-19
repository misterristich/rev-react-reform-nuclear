// Museum slider: animated transitions, dots, keyboard, and swipe.
const slides = Array.from(document.querySelectorAll(".slide"));
const counter = document.getElementById("counter");
const dotsWrap = document.getElementById("dots");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const stage = document.getElementById("stage");

let idx = 0;
let isAnimating = false;

function buildDots(){
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot" + (i === idx ? " active" : "");
    b.setAttribute("aria-label", `Go to slide ${i+1}`);
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });
}

function setCounter(){
  counter.textContent = `${idx+1} / ${slides.length}`;
}

function animateOut(el, direction){
  el.classList.add("animating");
  el.style.opacity = "0";
  el.style.transform = `translateX(${direction === "next" ? "-24px" : "24px"})`;
}

function animateIn(el, direction){
  el.classList.add("animating");
  el.style.opacity = "1";
  el.style.transform = "translateX(0)";
}

function cleanup(el){
  el.classList.remove("animating");
  el.style.opacity = "";
  el.style.transform = "";
}

function goTo(newIdx){
  if (isAnimating || newIdx === idx) return;
  isAnimating = true;

  const current = slides[idx];
  const next = slides[newIdx];
  const direction = newIdx > idx ? "next" : "prev";

  // Prepare next
  slides.forEach(s => s.classList.remove("active"));
  current.classList.add("active"); // keep current visible for out animation
  next.classList.add("active");    // stack next for in animation

  // Start states
  next.style.opacity = "0";
  next.style.transform = `translateX(${direction === "next" ? "24px" : "-24px"})`;
  next.classList.add("animating");
  current.classList.add("animating");

  // Trigger animations (next tick)
  requestAnimationFrame(() => {
    animateOut(current, direction);
    animateIn(next, direction);
  });

  // End
  setTimeout(() => {
    // ensure only next remains visible
    slides.forEach(s => s.classList.remove("active"));
    next.classList.add("active");

    cleanup(current);
    cleanup(next);

    idx = newIdx;
    setCounter();
    buildDots();
    isAnimating = false;
  }, 460);
}

function prev(){
  const newIdx = (idx - 1 + slides.length) % slides.length;
  goTo(newIdx);
}

function next(){
  const newIdx = (idx + 1) % slides.length;
  goTo(newIdx);
}

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);

// Keyboard
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
});

// Swipe on stage (mobile)
let startX = null;
let startY = null;
stage.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
}, {passive:true});

stage.addEventListener("touchend", (e) => {
  if (startX === null) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;

  // Only horizontal swipes
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)){
    if (dx < 0) next();
    else prev();
  }
  startX = null;
  startY = null;
}, {passive:true});

// Init
setCounter();
buildDots();
