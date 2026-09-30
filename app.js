const matrixCanvas = document.getElementById('matrix');
const matrixCtx = matrixCanvas.getContext('2d');
const fontSize = 20;
const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
let columns, drops, lastFrame = 0;
const frameMs = 1000 / 24;

function resizeCanvs(){
    const dpr = Math.min(window.devicePixelRatio || 1);
    matrixCanvas.style.width = window.innerWidth + 'px';
    matrixCanvas.style.height = window.innerHeight + 'px';
    matrixCanvas.width = window.innerWidth * dpr;
    matrixCanvas.height = window.innerHeight * dpr;
    matrixCtx.setTransform(1, 0, 0, 1, 0, 0); 
    matrixCtx.scale(dpr, dpr);
    columns = Math.floor(window.innerWidth / fontSize);
    drops = Array(columns).fill(1);
}
resizeCanvs();
window.addEventListener('resize', resizeCanvs);

function drawMatrix(timestamp){
    requestAnimationFrame(drawMatrix);
    if (timestamp - lastFrame < frameMs) return;
    lastFrame = timestamp;

    matrixCtx.globalCompositeOperation = "destination-out";
    matrixCtx.fillStyle = "rgba(0, 0, 0, 0.1)"; 
    matrixCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    matrixCtx.globalCompositeOperation = "source-over";
    matrixCtx.fillStyle = "rgba(15, 255, 80,0.4)";
    matrixCtx.font = fontSize + "px 'White Rabbit Local',sans-serif";

    for (let i = 0; i < drops.length; i++){
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}

const canvas = document.getElementById('dotsCanvas');
const ctx = canvas.getContext('2d');
let width, height;
const dots = [];
const spacing = 35;
const mouse = { x: null, y: null, radius: 100 };

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  dots.length = 0;
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      dots.push({ x, y, baseDx: x, baseDy: y });
    }
  }
}

function drawDots() {
  ctx.clearRect(0, 0, width, height);
  dots.forEach(dot => {
    let dx = mouse.x - dot.x, dy = mouse.y - dot.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let size = 1.5;
    let alpha = 0.2;
    let green = 55;

    if (dist < mouse.radius) {
      let factor = (1 - dist / mouse.radius);
      size = 1.5 + factor * 7.5; 
      alpha = 0.2 + factor * 0.25;
      green = 25 + factor * 230;
    }

    ctx.fillStyle = `rgba(190, ${green}, 255, ${alpha})`;
    ctx.beginPath(); ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2); ctx.fill();
  });
  requestAnimationFrame(drawDots);
}

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
window.addEventListener('resize', resize);
resize(); drawDots();

const textElement = document.getElementById('scramble-text');
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";

function scrambleTo(targetText, duration = 1.2) {
  return new Promise((resolve) => {
    const targetLength = targetText.length;
    const totalSteps = duration * 30;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;
      const revealedCharsCount = Math.floor(progress * targetLength);
      let output = "";
      for (let i = 0; i < targetLength; i++) {
        if (i < revealedCharsCount) output += targetText[i];
        else output += targetText[i] === " " ? " " : chars[Math.floor(Math.random() * chars.length)];
      }
      if (textElement) textElement.textContent = output;
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        if (textElement) textElement.textContent = targetText;
        resolve();
      }
    }, 1000 / 30);
  });
}

function updateCardsVisibility() {
  const cards = document.querySelectorAll('.activity-card');
  if (!cards.length) return;
  const viewportHeight = window.innerHeight;
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const inView = rect.top < viewportHeight * 0.85 && rect.bottom > viewportHeight * 0.1;
    card.classList.toggle('visible', inView);
  });
}
window.addEventListener('scroll', updateCardsVisibility, { passive: true });
window.addEventListener('resize', updateCardsVisibility);

function updateTimeline() {
  const timelinePath = document.getElementById('timeline-path');
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timeline = document.getElementById('timeline');
  if (!timeline || !timelinePath) return;

  const rect = timeline.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const progress = Math.max(0, Math.min(1, (viewportHeight * 0.75 - rect.top) / (rect.height - viewportHeight * 0.25)));
  timelinePath.style.strokeDashoffset = 1 - progress;

  timelineItems.forEach((item) => {
    const itemRect = item.getBoundingClientRect();
    const visible = itemRect.top < viewportHeight * 0.85 && itemRect.bottom > viewportHeight * 0.1;
    item.classList.toggle('visible', visible);
  });
}
window.addEventListener('scroll', updateTimeline, { passive: true });
window.addEventListener('resize', updateTimeline);

window.addEventListener('load', () => {
  const overlay = document.getElementById('preloader-overlay');
  const mainWebsite = document.getElementById('main-website');
  
  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline();
    tl.add(async () => { await scrambleTo("< LOADING >", 1.2); })
      .to({}, { duration: 1.5 })
      .add(async () => { await scrambleTo("< COMPLETE >", 1); })
      .to({}, { duration: 1 })
      .to(overlay, { 
        opacity: 0, 
        duration: 0.6, 
        onComplete: () => {
          if (overlay) overlay.style.display = 'none';
          if (mainWebsite) mainWebsite.style.display = 'block';
          requestAnimationFrame(drawMatrix);
          if (document.querySelector('.activity-card')) {
            requestAnimationFrame(updateCardsVisibility);
          }
          if (document.getElementById('timeline')) {
            requestAnimationFrame(updateTimeline);
          }
        }
      })
      .to(mainWebsite, { opacity: 1, duration: 0.5 });

    if (document.querySelector('.page-title')) {
      tl.from('.page-title', { 
        y: -40, 
        opacity: 0, 
        duration: 0.8, 
        ease: 'power3.out' 
      }, "-=0.2");
    }
  }
});