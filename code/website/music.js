const range = document.getElementById('musicRange');

const playButton = document.getElementById("play_button")
const playButtonImg = document.getElementById("play_buttonImg")

const player_songname = document.getElementById('song-player-name');
const player_songimg = document.getElementById('song-player-img');

const timestamp_max = document.getElementById('timestamp-max');
const timestamp_current = document.getElementById('timestamp-current');

const volumeImg = document.getElementById("musicImg")
const volumeRange = document.getElementById("volumeRange")

const loopButton = document.getElementById("buttonLoop")
const deleteButton = document.getElementById("buttonDelete")

function updateBackground(){
  range.style.setProperty('--percent', ((range.value / range.max) * 100) + '%');
}
updateBackground();


// Function
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

function changePlayerStatus(type) {
  if (type == "play") { // when paused
    playButton.setAttribute("onClick", "try {audio.play()} catch(err) {}; changePlayerStatus('stop')")
    playButtonImg.src = "/website/img/play.png"
  }
  else if (type == "stop") { // when playing
    playButton.setAttribute("onClick", "try {audio.pause()} catch(err) {}; changePlayerStatus('play')")
    playButtonImg.src = "/website/img/stop.png"
  }

  else if (type == "volume_norm") {
    volumeImg.setAttribute("onClick", "changePlayerStatus('volume_mute'); audio.muted = true; volumeRange.value = 0")
    
    volumeImg.src = "/website/img/volume.png"
  }
  else if (type == "volume_mute") {
    volumeImg.setAttribute("onClick", "changePlayerStatus('volume_norm'); audio.muted = false; volumeRange.value = 50; audio.volume = 0.5")
    volumeImg.src = "/website/img/mute.png"
  }

  else if (type == "loop") {
    audio.loop = !audio.loop
    if (loopButton.style.border != "none") { loopButton.style.border = "none" }
    else { loopButton.style.border = "solid 1.5px black" }
  }

  else if (type == "delete") {
    if (deleteButton.style.border != "none") { deleteButton.style.border = "none" }
    else { deleteButton.style.border = "solid 1.5px black" }
  }
}

// Events

let audio = new Audio();


audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    range.value = audio.currentTime;
    timestamp_current.innerHTML = formatTime(audio.currentTime)
    updateBackground()
  }
});


// Main code


async function downloadNew(element) {
  let url = element.value
  element.value = ""
  let req = await fetch(`/music_api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({type: 'add', url: url}),
  });
  
  if (req.status == 200) {
    var req_json = JSON.parse(await req.text());
    createCard(req_json.name, req_json.ico)
  }
}

async function deleteSong() {
  (Array.from(document.querySelectorAll("p"))
  .find(p => p.textContent.includes(player_songname.innerHTML)))
  .parentElement.style.display = "none";

  await fetch(`/music_api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({type: 'remove', song_name: player_songname.innerHTML}),
  });
}

const musicCardContainer = document.getElementById("music-container")

function createCard(song_name, song_ico) {
  let divcard = document.createElement("div");
  musicCardContainer.appendChild(divcard);
  divcard.className = "music-card"
  divcard.setAttribute("onClick", `playSong("${song_name}", "${song_ico}")`)
  let imgcard = document.createElement("img");
  divcard.appendChild(imgcard)
  imgcard.className = "music-ico"
  imgcard.src = song_ico
  let pcard = document.createElement("p");
  divcard.appendChild(pcard)
  pcard.className = "music-card-text"
  pcard.innerHTML = song_name 
}


function changeVolume(element) {
  audio.volume = element.value / 100
}

async function rangeSong(new_value) {
  if (audio.currentTime > 0) {
    audio.currentTime = new_value
    timestamp_current.innerHTML = formatTime(audio.currentTime)
  }
}

async function playSong(title, img) {
  let req = await fetch(`/music_api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({type: 'get', song_name: title}),
  });
  if (req.status == 200) {
    
    let blob = await req.blob();
    
    audio.src = URL.createObjectURL(blob);
    audio.preload = "auto";

    if (range.disabled) {
      range.disabled = false
    }
    if (playButton.disabled) {
      playButton.disabled = false
    }
    if (deleteButton.disabled) {
      deleteButton.disabled = false
    }
    await audio.play();
    // Riproduzione si avvia
    range.max = audio.duration

    timestamp_max.innerHTML = formatTime(audio.duration)
    player_songname.innerHTML = title
    player_songimg.src = img

    setPWA(title, audio, img)
    changePlayerStatus("stop")
  }
}

audio.addEventListener('ended', () => {
  nextRandom()
});

async function nextRandom() {
  let req = await fetch(`/music_api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({type: 'random'}),
  });
  if (req.status == 200) {
    let req_json = JSON.parse(await req.text());
    playSong(req_json.song_name, req_json.ico)
  }
}


async function setPWA(title, audio, img) {
  if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ 
          title: title,
          artist: "Music Player By Coso.Man",
          album: "Music Player",
          artwork: [
            { src: img, sizes: "512x512", type: "image/png" }
          ],
      });

      navigator.mediaSession.setActionHandler('play', () => {audio.play(); changePlayerStatus("stop")});  
      navigator.mediaSession.setActionHandler('pause', () => {audio.pause(); changePlayerStatus("play")});

      navigator.mediaSession.setActionHandler('nexttrack', () => {nextRandom()});
  } 
}
