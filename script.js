// Selecting elements
const display = document.getElementById('display');
const lapList = document.getElementById('lapList');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const themeBtn = document.getElementById('themeToggleBtn');
const beepSound = document.getElementById('beepSound');

let interval = null;
let startTime = 0, elapsed = 0;
let laps = [];
let running = false;

// Load saved state (optional)
const saved = JSON.parse(localStorage.getItem('stopwatchData') || '{}');
if(saved && saved.lastElapsed) {
  elapsed = saved.lastElapsed;
  running = saved.running;
  laps = saved.laps || [];
  updateDisplay();
  renderLaps();
}
if(saved.theme === 'light') document.body.classList.add('light');

// Timer logic
function updateDisplay() {
  let time = running ? Date.now() - startTime + elapsed : elapsed;
  let ms = time % 1000;
  let s = Math.floor(time/1000)%60;
  let m = Math.floor(time/60000)%60;
  let h = Math.floor(time/3600000);
  display.textContent = `${pad(h)}:${pad(m)}:${pad(s)}.${pad100(ms)}`;
}
function pad(n){ return String(n).padStart(2,'0'); }
function pad100(n){ return String(n).padStart(3,'0'); }

function setControls() {
  startBtn.disabled = running;
  pauseBtn.disabled = !running;
  resetBtn.disabled = !(elapsed || running);
  lapBtn.disabled = !running;
  startBtn.textContent = running ? "Start" : (elapsed > 0 ? "Resume" : "Start");
}

function tick() {
  updateDisplay();
  saveState();
}

function saveState() {
  localStorage.setItem('stopwatchData', JSON.stringify({
    lastElapsed: running ? Date.now() - startTime + elapsed : elapsed,
    running, laps, theme: document.body.classList.contains('light')?'light':'dark'
  }));
}

function renderLaps() {
  lapList.innerHTML = '';
  laps.forEach((lap, i) => {
    let li = document.createElement('li');
    li.innerHTML = `<span>Lap ${i+1}</span><span>${lap}</span>`;
    lapList.prepend(li);
  });
}

// Controls
startBtn.onclick = () => {
  if(!running) {
    startTime = Date.now();
    interval = setInterval(tick, 25);
    running = true;
    setControls();
    tick();
  }
};
pauseBtn.onclick = () => {
  if(running) {
    beepSound.currentTime = 0; beepSound.play();
    clearInterval(interval);
    elapsed += Date.now() - startTime;
    running = false;
    setControls();
    saveState();
  }
};
resetBtn.onclick = () => {
  if(!running) {
    elapsed = 0;
    laps = [];
    updateDisplay();
    renderLaps();
    setControls();
    saveState();
  }
};
lapBtn.onclick = () => {
  if(running) {
    beepSound.currentTime = 0; beepSound.play();
    let time = Date.now() - startTime + elapsed;
    let ms = time % 1000;
    let s = Math.floor(time/1000)%60;
    let m = Math.floor(time/60000)%60;
    let h = Math.floor(time/3600000);
    let formatted = `${pad(h)}:${pad(m)}:${pad(s)}.${pad100(ms)}`;
    laps.push(formatted);
    renderLaps();
    saveState();
  }
};
themeBtn.onclick = () => {
  document.body.classList.toggle('light');
  themeBtn.textContent = document.body.classList.contains('light') ? "🌤️" : "🌙";
  saveState();
};

setControls();
updateDisplay();
renderLaps();

// Keyboard shortcuts
window.addEventListener('keydown',(e)=>{
  if(e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT')return;
  if(e.code==="Space") {
    running ? pauseBtn.click() : startBtn.click();
    e.preventDefault();
  } else if(e.key==='l' || e.key==='L') {
    if(running) lapBtn.click();
  } else if(e.key==='r' || e.key==='R') {
    if(!running) resetBtn.click();
  }
});
