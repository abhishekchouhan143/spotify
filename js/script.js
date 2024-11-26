// Global variables
let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Helper: Convert seconds to minutes:seconds format
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Fetch songs from `songs.json` in the specified folder
async function getSongs(folder) {
  currFolder = folder;

  try {
    const response = await fetch(`https://abhishekchouhan143.github.io/spotify/${folder}/songs.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid songs.json format");
    }

    songs = data;
    console.log("Fetched songs:", songs);

    // Populate the playlist
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
      songUL.innerHTML += `
        <li>
          <img class="invert" src="svg/music.svg" alt="music" />
          <div class="info">
            <div>${decodeURIComponent(song)}</div>
            <div></div>
          </div>
          <span class="span">Play Now</span>
          <img class="invert play-btn" src="svg/play.svg" alt="play">
        </li>`;
    }

    // Attach event listeners for each song
    document.querySelectorAll(".songList li").forEach((element, index) => {
      element.addEventListener("click", () => playMusic(songs[index]));
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
    songs = []; // Reset songs in case of an error
  }
}

// Play a specific song
function playMusic(track, pause = false) {
  if (!track) return;

  currentSong.src = `https://abhishekchouhan143.github.io/spotify/${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    document.querySelector("#play").src = "svg/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Display album folders (dummy implementation for now)
async function displayAlbums() {
  // Add your logic to fetch album folders here
}

// Main function
async function main() {
  // Initialize with the first folder
  await getSongs("songs/ncs");
  if (songs.length > 0) playMusic(songs[0], true);

  // Add event listeners
  document.querySelector("#play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      document.querySelector("#play").src = "svg/pause.svg";
    } else {
      currentSong.pause();
      document.querySelector("#play").src = "svg/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  currentSong.addEventListener("ended", () => {
    let currentIndex = songs.indexOf(currentSong.src.split("/").pop());
    let nextIndex = (currentIndex + 1) % songs.length;
    playMusic(songs[nextIndex]);
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    const percent = e.offsetX / e.target.offsetWidth;
    currentSong.currentTime = percent * currentSong.duration;
  });

  document.querySelector("#next").addEventListener("click", () => {
    let currentIndex = songs.indexOf(currentSong.src.split("/").pop());
    let nextIndex = (currentIndex + 1) % songs.length;
    playMusic(songs[nextIndex]);
  });

  document.querySelector("#previous").addEventListener("click", () => {
    let currentIndex = songs.indexOf(currentSong.src.split("/").pop());
    let prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playMusic(songs[prevIndex]);
  });

  // Volume control
  const volumeSlider = document.querySelector(".range input");
  volumeSlider.addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
    document.querySelector(".volume-icon").src =
      e.target.value == 0 ? "svg/mute.svg" : "svg/volume.svg";
  });
}

main();
