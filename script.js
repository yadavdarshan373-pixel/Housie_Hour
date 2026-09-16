let numbers = [];
let historyOrder = [];
let index = 0;
let timer = null;
let running = false;
let voiceOn = true;
let audioUnlocked = false;
let voices = [];

const numberEl = document.getElementById("number");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
const board = document.getElementById("board");
const historyEl = document.getElementById("history");
const intervalEl = document.getElementById("interval");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const voiceBtn = document.getElementById("voice");

function loadVoices() {
  if ("speechSynthesis" in window) {
    voices = speechSynthesis.getVoices();
  }
}

loadVoices();
if ("speechSynthesis" in window && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}

function unlockAudio() {
  if (!audioUnlocked && "speechSynthesis" in window) {
    speechSynthesis.resume();
    const emptyMessage = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(emptyMessage);
    audioUnlocked = true;
  }
}

function shuffle(values) {
  for (let index = values.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
  }
  return values;
}

function buildBoard() {
  board.innerHTML = "";
  for (let number = 1; number <= 90; number++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.id = "n" + number;
    cell.textContent = number;
    board.appendChild(cell);
  }
}

function updateHistory() {
  historyEl.innerHTML = "";
  historyOrder.slice().reverse().forEach((number, historyIndex) => {
    const badge = document.createElement("span");
    badge.className = "history-badge" + (historyIndex === 0 ? " latest" : "");
    badge.textContent = "(" + (historyOrder.length - historyIndex) + ": " + number + "), ";
    historyEl.appendChild(badge);
  });
}

function speak(number) {
  if (!voiceOn || !("speechSynthesis" in window)) return;

  speechSynthesis.resume();
  speechSynthesis.cancel();

  const message = new SpeechSynthesisUtterance("Number " + number);
  message.rate = 0.9;
  message.lang = "en-US";

  if (voices.length > 0) {
    const englishVoice = voices.find((voice) => voice.lang.startsWith("en")) || voices[0];
    message.voice = englishVoice;
  }

  speechSynthesis.speak(message);
}

function callNext() {
  if (index >= 90) {
    stop();
    statusEl.textContent = "🎉 All 90 numbers have been called!";
    return;
  }

  const number = numbers[index++];
  historyOrder.push(number);
  numberEl.textContent = number;
  document.getElementById("n" + number).classList.add("called");
  countEl.textContent = index;
  statusEl.textContent = "Called number: " + number;
  updateHistory();
  speak(number);
}

function start() {
  unlockAudio();
  if (index >= 90) return;

  running = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  callNext();
  clearInterval(timer);
  timer = setInterval(callNext, Number(intervalEl.value) * 1000);
  statusEl.textContent = "Auto calling every " + intervalEl.value + " seconds";
}

function stop() {
  running = false;
  clearInterval(timer);
  timer = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function reset() {
  stop();
  numbers = shuffle(Array.from({ length: 90 }, (_, numberIndex) => numberIndex + 1));
  historyOrder = [];
  index = 0;
  numberEl.textContent = "--";
  countEl.textContent = "0";
  statusEl.textContent = "Ready — press Start";
  buildBoard();
  updateHistory();

  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
}

startBtn.onclick = start;
pauseBtn.onclick = () => {
  stop();
  statusEl.textContent = "Paused";
};
document.getElementById("next").onclick = () => {
  unlockAudio();
  if (index >= 90) return;

  callNext();
  if (running) {
    clearInterval(timer);
    timer = setInterval(callNext, Number(intervalEl.value) * 1000);
  }
};
document.getElementById("reset").onclick = reset;
voiceBtn.onclick = () => {
  unlockAudio();
  voiceOn = !voiceOn;
  voiceBtn.textContent = voiceOn ? "🔊 Voice: ON" : "🔇 Voice: OFF";
};
intervalEl.onchange = () => {
  if (running) {
    clearInterval(timer);
    timer = setInterval(callNext, Number(intervalEl.value) * 1000);
    statusEl.textContent = "Auto calling every " + intervalEl.value + " seconds";
  }
};

reset();
