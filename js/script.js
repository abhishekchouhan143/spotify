let currentSong = new Audio();
let songs;
let currFolder;

//start  function to convert seconds into minutes , seconds
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds to always be two digits
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  // Return the formatted string
  return `${formattedMinutes}:${formattedSeconds}`;
}
//End function to convert seconds into minutes , seconds.

//GET SONGS FUNCTION Fetch all songs in the songs folders
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`https://abhishekchouhan143.github.io/spotify/${folder}/`);

  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
         <img class="invert" src="svg/music.svg" alt="music" />
     <div class="info">
       <div>${song.replaceAll("%20", " ")}</div>
       <div></div>
     </div>
     <span class="span">Play Now</span>
     <img class="invert play-btn" src="svg/play.svg" alt="play">
       </li>`;
  }

  //Attach an event listNer to each songs using forEach loops.
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      palyMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

// playMusic function start.
const palyMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "svg/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
// playMusic function end.

// START CREATE A displayAlbums function
async function displayAlbums() {
  let a = await fetch(`https://abhishekchouhan143.github.io/spotify/songs/ncs`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  Array.from(anchors).forEach(async (e) => {
    if (e.href.includes("/songs")) {
      e.href.split("/").slice(-1)[0];
     
    }
  });

 }
// END CREATE A displayAlbums function

// START MAIN FUNCTION
async function main() {
  //Get all the list of the song .
  await getSongs("songs/ncs");
  palyMusic(songs[0], true);

  //CALL The Display function all the albums on the page
  await displayAlbums();

  // Attach an event listener to play and pause buttons.
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svg/play.svg";
    }
  });

  // Listen for timeupdate event in songs.
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}  /  ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener for song repeatedly plays looping.
  currentSong.addEventListener("ended", () => {
    // Restart the current song
    currentSong.currentTime = 0;
    currentSong.play();
    play.src = "svg/pause.svg";
  });

  //Add an event listener to seekbar updated
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger button
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-130%";
  });

  //Add an event listener for card click and left open
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      document
        .querySelectorAll(".left")
        .forEach((item) => (item.style.left = "0"));
    });
  });

  // Start Add an event listener to volume.
  const volumeRange = document
    .querySelector(".range")
    .getElementsByTagName("input")[0];
  const volumeIcon = document.querySelector(".volume-icon");
  let previousVolume = 0.5;

  volumeRange.addEventListener("change", (e) => {
    const volumeValue = parseInt(e.target.value);
    currentSong.volume = volumeValue / 100;

    // Change the icon based on the volume
    if (volumeValue === 0) {
      volumeIcon.src = "svg/mute.svg";
    } else {
      volumeIcon.src = "svg/volume.svg";
    }
  });

  // Add a click event to the volume icon to toggle mute/unmute
  volumeIcon.addEventListener("click", () => {
    if (currentSong.volume > 0) {
      // Mute the volume
      previousVolume = currentSong.volume;
      currentSong.volume = 0;
      volumeRange.value = 0; // Update the range slider
      volumeIcon.src = "svg/mute.svg"; // Change to mute icon
    } else {
      // Unmute the volume
      currentSong.volume = previousVolume; // Restore the previous volume
      volumeRange.value = previousVolume * 50; // Update the range slider
      volumeIcon.src = "svg/volume.svg"; // Change to volume icon
    }
  });
  // End Add an event listener to volume.

  // Start Add an event listener for next and previous buttons.
  // previous button
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      palyMusic(songs[index - 1]);
    }
  });

  // next button
  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 <= songs.length - 1) {
      palyMusic(songs[index + 1]);
    } else {
      palyMusic(songs[0]);
    }
  });
  // End Add an event listener for next and previous buttons.
 // Load the playlist whenever we are clicked on a card.
 Array.from(document.getElementsByClassName("card")).forEach((e) => {
  e.addEventListener("click", async (item) => {
    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    palyMusic(songs[0])
  });
});
  
}
main();
// main function end
