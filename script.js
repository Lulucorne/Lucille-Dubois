const BASE = document.body.dataset.base || '';
const MUSIC = `${BASE}/music`;
const COVER = `${MUSIC}/cover`;

const audio = document.getElementById('audio');
const playlistContainer = document.getElementById('playlist');
const coverArt = document.getElementById('cover-art');
const trackInfo = document.getElementById('track-info');
const timeStamp = document.getElementById('time-stamp');
const volumeSlider = document.getElementById('volume-slider');
const playPauseBtn = document.getElementById('play-pause');
const shuffleBtn = document.getElementById('shuffle-btn');
const muteBtn = document.getElementById('mute-btn');

let currentIndex = 0;
let isShuffled = false;

const songs = [
  {
    title: 'About Sophie',
    artist: 'Keaton Henson',
    src: 'assets/characters/alicia-ming/music/About Sophie - Keaton Henson.mp3',
    cover: 'assets/characters/alicia-ming/music/cover/About Sophie - Keaton Henson.jpeg',
  },
  {
    title: 'Asleep Among Endives',
    artist: 'Ichiko Aoba',
    src: 'assets/characters/alicia-ming/music/Asleep Among Endives - Ichiko Aoba.mp3',
    cover: 'assets/characters/alicia-ming/music/cover/Asleep Among Endives - Ichiko Aoba.jpeg',
  },
  {
    title: 'Her Joy Was Complete',
    artist: 'Sleeping At Last',
    src: 'assets/characters/alicia-ming/music/Her Joy Was Complete - Sleeping At Last.mp3',
    cover: 'assets/characters/alicia-ming/music/cover/Her Joy Was Complete - Sleeping At Last.jpeg',
  },
  {
    title: 'Humming (Isolated Vocals)',
    artist: 'Ichiko Aoba',
    src: 'assets/characters/alicia-ming/music/Humming (Isolated Vocals) - Ichiko Aoba.mp3',
    cover: 'assets/characters/alicia-ming/music/cover/Humming (Isolated Vocals) - Ichiko Aoba.jpeg',
  },
  {
    title: 'Je te laisserai des mots',
    artist: 'Patrick Watson',
    src: 'assets/characters/alicia-ming/music/Je te laisserai des mots - Patrick Watson.mp3',
    cover:
      'assets/characters/alicia-ming/music/cover/Je te laisserai des mots - Patrick Watson.jpeg',
  },
  {
    title: 'Wild Life In The Forest Sounds',
    artist: 'Natural Sounds Selections',
    src: 'assets/characters/alicia-ming/music/Wild Life In The Forest Sounds - Natural Sounds Selections.mp3',
    cover:
      'assets/characters/alicia-ming/music/cover/Wild Life In The Forest Sounds - Natural Sounds Selections.jpeg',
  },
  {
    title: 'ゆめうつつ',
    artist: 'Lamp',
    src: 'assets/characters/alicia-ming/music/ゆめうつつ - Lamp.mp3',
    cover: 'assets/characters/alicia-ming/music/cover/ゆめうつつ - Lamp.jpeg',
  },
];

// Sort songs alphabetically
songs.sort((a, b) => a.title.localeCompare(b.title));

// Build playlist
songs.forEach((song, index) => {
  const div = document.createElement('div');
  div.classList.add('track');
  if (index === 0) div.classList.add('active');
  div.dataset.index = index;
  div.textContent = `❄  ${song.title}`;
  playlistContainer.appendChild(div);
  div.addEventListener('click', () => playTrack(index));
});

// Init volume safely
audio.volume = 0.1;
if (volumeSlider) volumeSlider.value = String(audio.volume);

// ====== CORE ======
function playTrack(index) {
  currentIndex = index;
  const song = songs[index];

  const srcPath = song.src.replace(/^assets\/characters\/alicia-ming\//, '');
  const coverPath = song.cover.replace(/^assets\/characters\/alicia-ming\//, '');

  audio.src = `${BASE}/${srcPath}`;
  coverArt.src = `${BASE}/${coverPath}`;
  trackInfo.textContent = `❆ ${song.title} – ${song.artist} ❆`;

  document.querySelectorAll('.track').forEach((t) => t.classList.remove('active'));
  const active = document.querySelector(`.track[data-index="${index}"]`);
  if (active) active.classList.add('active');

  audio.play().catch(() => {
    updatePlayPauseBtn();
  });
  updatePlayPauseBtn();
}

function updatePlayPauseBtn() {
  playPauseBtn.textContent = audio.paused ? '▶' : '⏸';
}

function nextTrack() {
  if (isShuffled) {
    let next;
    do {
      next = Math.floor(Math.random() * songs.length);
    } while (next === currentIndex && songs.length > 1);
    playTrack(next);
  } else {
    playTrack((currentIndex + 1) % songs.length);
  }
}

function prevTrack() {
  playTrack((currentIndex - 1 + songs.length) % songs.length);
}

// ====== UI EVENTS ======

// Play/pause
playPauseBtn.addEventListener('click', () => {
  if (audio.paused) audio.play();
  else audio.pause();
  updatePlayPauseBtn();
});

// Shuffle
shuffleBtn.addEventListener('click', () => {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle('active', isShuffled);
});

// Next/Prev buttons injected next to playPause
const controlsContainer = document.createElement('div');
controlsContainer.style.display = 'flex';
controlsContainer.style.justifyContent = 'center';
controlsContainer.style.marginTop = '5px';

const prevBtn = document.createElement('button');
prevBtn.textContent = '⏮';
prevBtn.style.marginRight = '5px';
prevBtn.addEventListener('click', prevTrack);

const nextBtn = document.createElement('button');
nextBtn.textContent = '⏭';
nextBtn.style.marginLeft = '5px';
nextBtn.addEventListener('click', nextTrack);

playPauseBtn.parentNode.insertBefore(prevBtn, playPauseBtn);
playPauseBtn.parentNode.insertBefore(nextBtn, playPauseBtn.nextSibling);

// Time display
audio.addEventListener('timeupdate', () => {
  const fmt = (t) => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
  timeStamp.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration || 0)}`;
});

// Go to next track
audio.addEventListener('ended', () => {
  nextTrack();
});

// Reset displayed duration when metadata loads
audio.addEventListener('loadedmetadata', () => {
  const fmt = (t) => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
  timeStamp.textContent = `0:00 / ${fmt(audio.duration || 0)}`;
});

// Volume slider
volumeSlider.addEventListener('input', () => {
  const v = parseFloat(volumeSlider.value);
  audio.volume = Number.isFinite(v) ? v : 0.1;

  if (audio.volume === 0) {
    audio.muted = true;
    muteBtn.textContent = '🕨';
    muteBtn.classList.add('muted');
  } else {
    audio.muted = false;
    muteBtn.textContent = '🕪';
    muteBtn.classList.remove('muted');
  }
});

if (volumeSlider) {
  volumeSlider.addEventListener('input', () => {
    const v = parseFloat(volumeSlider.value);
    audio.volume = Number.isFinite(v) ? v : 0.1;

    if (audio.volume === 0) {
      audio.muted = true;
      muteBtn.textContent = '🕨';
      muteBtn.classList.add('muted');
    } else {
      audio.muted = false;
      muteBtn.textContent = '🕪';
      muteBtn.classList.remove('muted');
    }
  });
}
// Mute button
muteBtn.addEventListener('click', () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? '🕨' : '🕪';
  muteBtn.classList.toggle('muted', audio.muted);
  if (!audio.muted && parseFloat(volumeSlider.value) === 0) {
    audio.volume = 0.1;
    volumeSlider.value = '0.1';
  }
});

// ====== BOOT ======
window.addEventListener('DOMContentLoaded', () => {
  playTrack(0);
});
