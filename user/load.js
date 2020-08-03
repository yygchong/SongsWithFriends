"use strict";
let current_url = location.search;
let url_split = current_url.split("?")[1];
const username = url_split.split("=")[1];

const editables = document.querySelectorAll("[contenteditable]");

/*
editables.forEach(editTitle => {
  editTitle.addEventListener("blur", () => {
    localStorage.setItem("dataStorage-" + editTitle.id, editTitle.innerHTML);
  })
});

// once on load
for (var key in localStorage) {
  if (key.includes("dataStorage-")) {
    const id = key.replace("dataStorage-","");
    document.querySelector("#" + id).innerHTML = localStorage.getItem(key);
  }
}
*/

shuffleOff(); // have shuffle turned off for users upon load
repeatOff();

let queryPlayback = setInterval(function () {
  console.log("init queryPlayback");
}, 1000);

clearInterval(queryPlayback);

//let barReloader = setInterval(updateProgress, 1000);
/*


let whilePlaying = setInterval(function() {
  if (isPlaying()) {
    queryLoad = setInterval(function () { loadSongBar(); }, 1000);
    //loadSongBar();
  } else {
    clearInterval(queryLoad);
    //clearInterval(whilePlaying);
  }
}, 1000);
*/

function new_playlist() {
  let xhr = new XMLHttpRequest();

  // let current_url = location.search;
  // username = current_url.split("=")[1];

  let data = {
    playlist_name: "New Playlist",
    username: username
  };

  let playlist = JSON.stringify(data);

  xhr.onloadend =
    function() {
      console.log('Playlist Created');
    };

  xhr.onerror =
    function (err) {
      console.log("Error: ", err);
    };

  let url = '/create_playlist';

  xhr.open("POST", url, true);

  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(playlist);
}

// new_playlist();


let track_uris = [];
let track_names = [];
let artist_names = [];
let album_imgs = [];
let album_names = [];
let track_durations_ms = [];


function search_song() {
  let xhr = new XMLHttpRequest();

  

  xhr.onloadend =
    function(err) {
      let data = JSON.parse(xhr.responseText);
      track_names = data.track_names;
      artist_names = data.artist_names;
      track_uris = data.track_uris;
      album_imgs = data.album_imgs;
      album_names = data.album_names;
      track_durations_ms = data.track_durations_ms;
      let search_results = document.getElementsByClassName("search_results");
      let song_list = document.getElementsByClassName("song_list");
      let song_1 = document.getElementById("song_1");
      let song_2 = document.getElementById("song_2");
      let song_3 = document.getElementById("song_3");
      let song_4 = document.getElementById("song_4");
      let song_5 = document.getElementById("song_5");
      
      // search_results.display = "block";
      song_1.textContent = track_names[0] + ": " + artist_names[0];
      song_2.textContent = track_names[1] + ": " + artist_names[1];
      song_3.textContent = track_names[2] + ": " + artist_names[2];
      song_4.textContent = track_names[3] + ": " + artist_names[3];
      song_5.textContent = track_names[4] + ": " + artist_names[4];
  };
  xhr.onerror =
    function (err) {
      console.log("Error: ", err);
    };
  
  let song = document.getElementById("search_bar").value;
  let url = '/search_song?song=' + song + '&username=' + username;

  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send();
}
// search_song();

function volumeMute() {
  let xhr = new XMLHttpRequest();

  // let current_url = location.search;
  // username = current_url.split("=")[1];
  
  xhr.onloadend =
    function() {
      console.log("(browser) Volume muted");
    };

  xhr.onerror =
    function (err) {
      console.log("(browser) volume mute error: ", err);
    };
  
  let url = '/volume_mute?username=' + username;

  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send();
}

function volumeIncrease() {
  let xhr = new XMLHttpRequest();

  // let current_url = location.search;
  // username = current_url.split("=")[1];
  
  xhr.onloadend =
    function () {
      //let volumeLevel = (JSON.parse(xhr.responseText)).device.volume_percent;
      let volumeLevel = JSON.parse(xhr.responseText);
      console.log("(browser) Volume data back: " + volumeLevel);
      
      let xhr2 = new XMLHttpRequest();
    
      xhr2.onloadend =
        function () {
          console.log("(browser) volume increased!")
        };
    
      xhr2.onerror =
        function (err) {
          console.log("(browser) xhr2 error: ", err);
        };
    
      let url2 = '/volume_increase?username=' + username + '&volume_percent=' + volumeLevel;
    
      xhr2.open("PUT", url2, true);
      xhr2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr2.send();
    };

  xhr.onerror =
    function (err) {
      console.log("(browser) volume data error: ", err);
    };
  
  let url = '/get_volume?username=' + username;
  
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send();
}

let playlist_name = "New Playlist";

let currentPlaylist = {
  track_names: [],
  track_artists: [],
  track_albums: [],
  track_uris: [],
  track_durations_ms: []
};

function add_to_playlist(index) {
  let xhr = new XMLHttpRequest();

  xhr.onloadend =
    (err) => {
      // console.log("Removing from playlist");
      // remove_from_playlist();
      // console.log(xhr.response);
      let data = JSON.parse(xhr.response);
      console.log(data);
    
      let name = data.track_name;
      let artist = data.track_artist;
      let album = data.track_album;
      let uri = data.track_uri;
      let duration_ms = data.track_length;
    
      console.log("Added to Playlist");
    
      currentPlaylist.track_names.push(name);
      currentPlaylist.track_artists.push(artist);
      currentPlaylist.track_albums.push(album);
      currentPlaylist.track_uris.push(uri);
      currentPlaylist.track_durations_ms.push(duration_ms);
    
      console.log(currentPlaylist);
    
      // // let playlist_song_1 = document.getElementById("playlist_song_1");
      // // playlist_song_1.textContent = name + ": " + artist
      let text_content = name + ": " + artist;
      call_add_song(text_content);
    };
  xhr.onerror =
    (err) => {
      console.log("Error: ", err);
    };

  // get these values from search results
  let track_artist = artist_names[index-1];
  let track_uri = track_uris[index-1];
  let track_name = track_names[index-1];
  let album_img = album_imgs[index-1];
  let album_name = album_names[index-1];
  let track_duration_ms = track_durations_ms[index-1];

  let query_string='?playlist_name='+playlist_name+'&track_uri='+track_uri+'&track_name='+track_name+'&album_img='
    +album_img+'&username='+username+'&album_name='+album_name+'&track_artist='+track_artist+'&track_duration_ms='+track_duration_ms;
  let url = '/addToPlaylist' + query_string;
  // console.log(url);
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send();
}

// add_to_playlist();



function remove_from_playlist() {
  let xhr = new XMLHttpRequest();
  
  let remove_song_bar = document.getElementById("remove_song_bar");
  let index = remove_song_bar.value;
  console.log(index);
  console.log(ind);

  

  xhr.onloadend =
    (err) => {
      console.log("Deleted Track");
      // let playlist_song_1 = document.getElementById("playlist_song_1");
      // playlist_song_1.textContent = '';
      let song_num = "playlist_song_" + index;
      console.log(song_num);
      let playlist_song = document.getElementById(song_num);
      index++;
      for (var i=index; i<ind; i++) {
        // console.log("for loop");
        let song_num = "playlist_song_" + i;
        // console.log(song_num);
        let p_ele = document.getElementById(song_num);
        let i_temp = i-1;
        // console.log(i_temp);
        p_ele.id = "playlist_song_" + i_temp;
        let text_content = p_ele.textContent.substring(3);
        let new_text = i_temp + ". " + text_content;
        p_ele.textContent = new_text;
      }
      ind--;
      document.getElementById("playlist_songs").removeChild(playlist_song);
    
      let end = currentPlaylist.track_uris.length;
      let position = parseInt(positions);
            
      let uri1 = currentPlaylist.track_uris.slice(0, position);
      let uri2 = currentPlaylist.track_uris.slice(position+1, end);
      currentPlaylist.track_uris = uri1.concat(uri2);

      let name1 = currentPlaylist.track_names.slice(0, position);
      let name2 = currentPlaylist.track_names.slice(position+1, end);
      currentPlaylist.track_names = name1.concat(name2);

      let artist1 = currentPlaylist.track_artists.slice(0, position);
      let artist2 = currentPlaylist.track_artists.slice(position+1, end);
      currentPlaylist.track_artists = artist1.concat(artist2);
    
      let album1 = currentPlaylist.track_albums.slice(0, position);
      let album2 = currentPlaylist.track_albums.slice(position+1, end);
      currentPlaylist.track_albums = album1.concat(album2);
    
      let duration1 = currentPlaylist.track_durations_ms.slice(0, position);
      let duration2 = currentPlaylist.track_durations_ms.slice(position+1, end);
      currentPlaylist.track_durations_ms = duration1.concat(duration2);
    };
  xhr.onerror =
    (err) => {
      console.log("Error: ", err);
    };

  // get these values from search results
  let track_uri = currentPlaylist.track_uris[index-1];
  let track_name = currentPlaylist.track_names[index-1];
  let positions = (index-1).toString(); // TODO: get position from list (maybe in server end..?)
  console.log(positions);
  console.log(track_name);
  console.log(track_uri);

  // let data = JSON.stringify(song_data);
  let query_string='?playlist_name='+playlist_name+'&track_uri='+track_uri+'&track_name='+track_name
    +'&username='+username+'&positions='+positions;
  let url = '/removeFromPlaylist' + query_string;
  // console.log(url);
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
}

// remove_from_playlist();

function auto_remove_from_playlist() {
  let xhr = new XMLHttpRequest();
  
  let remove_song_bar = document.getElementById("remove_song_bar");
  let index = 1;
  // console.log(index);
  // console.log(ind);  

  xhr.onloadend =
    (err) => {
      console.log("Deleted Track");
      // let playlist_song_1 = document.getElementById("playlist_song_1");
      // playlist_song_1.textContent = '';
      let song_num = "playlist_song_" + index;
      console.log(song_num);
      let playlist_song = document.getElementById(song_num);
      // console.log(playlist_song.textContent);
      // playlist_song.textContent = '';
      // console.log(index);
      // console.log(ind);
      index++;
      for (var i=index; i<ind; i++) {
        // console.log("for loop");
        let song_num = "playlist_song_" + i;
        // console.log(song_num);
        let p_ele = document.getElementById(song_num);
        let i_temp = i-1;
        // console.log(i_temp);
        p_ele.id = "playlist_song_" + i_temp;
        let text_content = p_ele.textContent.substring(3);
        let new_text = i_temp + ". " + text_content;
        p_ele.textContent = new_text;
      }
      ind--;
      document.getElementById("playlist_songs").removeChild(playlist_song);
    
      let end = currentPlaylist.track_uris.length;
      let position = parseInt(positions);
            
      let uri1 = currentPlaylist.track_uris.slice(0, position);
      let uri2 = currentPlaylist.track_uris.slice(position+1, end);
      currentPlaylist.track_uris = uri1.concat(uri2);

      let name1 = currentPlaylist.track_names.slice(0, position);
      let name2 = currentPlaylist.track_names.slice(position+1, end);
      currentPlaylist.track_names = name1.concat(name2);

      let artist1 = currentPlaylist.track_artists.slice(0, position);
      let artist2 = currentPlaylist.track_artists.slice(position+1, end);
      currentPlaylist.track_artists = artist1.concat(artist2);
    
      let album1 = currentPlaylist.track_albums.slice(0, position);
      let album2 = currentPlaylist.track_albums.slice(position+1, end);
      currentPlaylist.track_albums = album1.concat(album2);
    
      let duration1 = currentPlaylist.track_durations_ms.slice(0, position);
      let duration2 = currentPlaylist.track_durations_ms.slice(position+1, end);
      currentPlaylist.track_durations_ms = duration1.concat(duration2);

      playSong();
    };
  xhr.onerror =
    (err) => {
      console.log("Error: ", err);
    };

  // get these values from search results
  let track_uri = currentPlaylist.track_uris[index-1];
  let track_name = currentPlaylist.track_names[index-1];
  let positions = (index-1).toString(); // TODO: get position from list (maybe in server end..?)
  console.log(positions);
  console.log(track_name);
  console.log(track_uri);

  // let data = JSON.stringify(song_data);
  let query_string='?playlist_name='+playlist_name+'&track_uri='+track_uri+'&track_name='+track_name
    +'&username='+username+'&positions='+positions;
  let url = '/removeFromPlaylist' + query_string;
  // console.log(url);
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
}


function get_playlist() {
  let xhr = new XMLHttpRequest();

  xhr.onloadend =
    function(err, resHead, resBody) {
      console.log("Playlist: " + resBody.data);
      console.log('Playlist Retrieved');
    };

  xhr.onerror =
    function (err) {
      console.log("Error: ", err);
    };

  let data = {
    playlist_name: playlist_name,
    username: username
  };

  let playlist = JSON.stringify(data);

  let url = '/get_playlist';

  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(playlist);
}

function delete_tracks() {
  let xhr = new XMLHttpRequest();

  xhr.onloadend =
    function(err, resHead, resBody) {
      console.log("Playlist: " + resBody.data);
      console.log('Playlist Retrieved');
    };

  xhr.onerror =
    function (err) {
      console.log("Error: ", err);
    };

  let data = {
    playlist_name: playlist_name,
    username: username
  };

  let playlist = JSON.stringify(data);

  let url = '/delete_tracks';

  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(playlist);
}

function share(){
  let randomString = makeid(36);
  on();
  let newURL = window.location.href + "?display.html?id=" + randomString;
  document.getElementById("url-hyperlink").textContent = 	newURL;
  document.getElementById("url-hyperlink").href = newURL;
}

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

function editName() {
  document.getElementById("playlistName").contentEditable = "true";
}

function search_on() {
  document.getElementById("search_overlay").style.display = "block";
}

function search_off() {
  document.getElementById("search_overlay").style.display = "none";
  let song_1 = document.getElementById("song_1");
  let song_2 = document.getElementById("song_2");
  let song_3 = document.getElementById("song_3");
  let song_4 = document.getElementById("song_4");
  let song_5 = document.getElementById("song_5");
  let search_bar = document.getElementById("search_bar");
  
  search_bar.value = '';
  
  song_1.textContent = '';
  song_2.textContent = '';
  song_3.textContent = '';
  song_4.textContent = '';
  song_5.textContent = '';
  
  track_uris = [];
  track_names = [];
  artist_names = [];
  album_imgs = [];
  album_names = [];
}
let input = document.getElementById("search_bar");

input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
   event.preventDefault();
   document.getElementById("myBtn").click();
  }
});

// this is the version where you pass in "this" in the html onclick function
function togglePause(x) {
  x.classList.toggle("fa-play");
  x.classList.toggle("fa-pause");

  let className = document.getElementById("play-pause-button").className;
  console.log("className: ", className);
  let pauseStr = "fa fa-pause";
  let playStr = "fa fa-play";
   if (className.localeCompare(playStr) == 0) { 
     console.log("paused");
     pauseSong();
  } else { 
    console.log("playing");
    playSong();
  }
}
  
function isPlaying() {
  let className = document.getElementById("play-pause-button").className;
  //console.log("className: ", className);
  let pauseStr = "fa fa-pause";
  let playStr = "fa fa-play";
  if (className.localeCompare(playStr) == 0) { 
    return false;
  } else { 
    return true;
  }
}

/*
function lagExecution(x) { // runs for x milliseconds
  var startTime = new Date().getTime();
  var endTime = startTime;
  while(endTime < startTime + x) {
     endTime = new Date().getTime();
  }
}
*/
let currentSeconds = 0;
let currentMinutes = 0;
let currentDuration = 0;
let timer = 0;

function runTimerUp(duration) {
  console.log("in run timer up");
  // var timer = 0;
  let white_bar = document.getElementById("white_bar");
    queryPlayback = setInterval(function () {
      if(!isPlaying()) {
        clearInterval(queryPlayback); // stops time elapsed timer on pause
      }
      // console.log(currentSeconds);
      currentMinutes = parseInt(timer / 60, 10); // x:yz -> z
      currentSeconds = parseInt(timer % 60, 10); // x:yz -> yz
      let time_bar =  ((currentSeconds + 60*currentMinutes) / duration) * 100;
      white_bar.style.width = time_bar.toString() + '%';
      

      currentSeconds = currentSeconds < 10 ? "0" + currentSeconds : currentSeconds;
      // console.log(currentSeconds);
      // console.log(currentMinutes);
      
      currentDuration = currentSeconds + 60*currentMinutes;

      if (++timer > duration + 1) {
        document.getElementById("time-elapsed").innerHTML = currentSeconds + ':' + currentMinutes;
        white_bar.style.width = '0%';
        currentSeconds = 0;
        currentMinutes = 0;
        timer = 0;
        //clearInterval(queryPlayback);
        console.log("reloading upon song completion");
        auto_remove_from_playlist();
        //loadSongBar(); // updates to next song details
      } else {
        document.getElementById("time-elapsed").innerHTML = currentMinutes + ":" + currentSeconds;
      }
    }, 1000);
}

/*
let currentPlaylist = {
  track_names: [],
  track_artists: [],
  track_albums: [],
  track_uris: [],
  track_durations_ms: []
};
*/
/*
function isSameSong() {
  let currentSong = document.getElementById("song").innerHTML;
  let currentArtist = document.getElementById("artist").innerHTML;
  let currentAlbum = document.getElementById("album").innerHTML;
  
  if (currentSong.localeCompare(currentPlaylist.track_names[0]) == 0 &&
      currentArtist.localeCompare(currentPlaylist.track_artists[0]) == 0 &&
      currentAlbum.localeCompare(currentPlaylist.track_albums[0]) == 0) {
    return true;
  } else {
    return false;
  }
}
*/

function loadSongBar() {
  //console.log(currentPlaylist.track_durations_ms);
  
  if (currentPlaylist.track_names.length == 0) {
    console.log("Track names == 0 size");
    document.getElementById("song").innerHTML = '';
    document.getElementById("artist").innerHTML = '';
    document.getElementById("album").innerHTML = '';
    // console.log(currentPlaylist.track_albums[0]);
    document.getElementById("song-length").innerHTML = '';
  }
  else {
    console.log("Track Names Exist");
    let duration = currentPlaylist.track_durations_ms[0];
    let songMin = Math.floor((duration/1000)/60); // x:yz -> x
    let songSec = Math.floor((duration/1000)%60); // x:yz -> yz
    // console.log(duration);


    document.getElementById("song").innerHTML = currentPlaylist.track_names[0] + "&nbsp;&nbsp;&nbsp;";
    document.getElementById("artist").innerHTML = currentPlaylist.track_artists[0] + "&nbsp;&nbsp;&nbsp;";
    document.getElementById("album").innerHTML = currentPlaylist.track_albums[0];
    // console.log(currentPlaylist.track_albums[0]);
    document.getElementById("song-length").innerHTML = songMin + ':' + songSec;

    currentDuration = songSec + songMin*60;
    clearInterval(queryPlayback);
    runTimerUp(currentDuration);
  }
  
}

let isFirstPlay = true;

function playSong() { // plays song first on the queue in the playlist 
  console.log("browser has reached playSong(), isFirstPlay = " + isFirstPlay);
  let xhr = new XMLHttpRequest();
  
  let current_song = currentPlaylist.track_names[0];
  let current_artist = currentPlaylist.track_artists[0];
  let current_album = currentPlaylist.track_albums[0];

  xhr.onloadend =
    function() { // get info on current playback -> load artist, song, and album names + times + song bar
      console.log("(browser) song playing");
      loadSongBar();
    };

  xhr.onerror =
    function (err) {
      console.log("(browser) song play error: ", err);
  };
  let url = '';
  if (isFirstPlay) {
    url = '/playSong?username=' + username + '&playlist_name=' + playlist_name + '&current_song='+current_song+'&current_artist='+current_artist+'&current_album='+current_album;
    isFirstPlay = false;
  } else {
    url = '/resumeSong?username=' + username + '&playlist_name=' + playlist_name + '&current_song='+current_song+'&current_artist='+current_artist+'&current_album='+current_album;
  }
  console.log("url is: " + url);
  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send();
} 

function pauseSong() {
  //console.log("browser has reached pauseSong()");
  let xhr = new XMLHttpRequest();

  // let current_url = location.search;
  // username = current_url.split("=")[1];
  
  xhr.onloadend =
    function() {
      console.log("(browser) song paused");
      //clearInterval(queryPlayback);
    };

  xhr.onerror =
    function (err) {
      console.log("(browser) song pause error: ", err);
  };
    
  
  let url = '/pauseSong?username=' + username;

  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send();
}

function shuffleOff() {
  //console.log("browser has reached shuffleOff()");
  let xhr = new XMLHttpRequest();

  // let current_url = location.search;
  // username = current_url.split("=")[1];
  
  xhr.onloadend =
    function() {
      console.log("(browser) shuffle turned off");
    };

  xhr.onerror =
    function (err) {
      console.log("(browser) shuffle off error: ", err);
  };
    
  
  let url = '/shuffleOff?username=' + username;

  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send();
}

function repeatOff() {
  //console.log("browser has reached repeatOff()");
  let xhr = new XMLHttpRequest();

  // let current_url = location.search;
  // username = current_url.split("=")[1];
  
  xhr.onloadend =
    function() {
      console.log("(browser) repeat turned off");
    };

  xhr.onerror =
    function (err) {
      console.log("(browser) repeat off error: ", err);
  };
    
  
  let url = '/repeatOff?username=' + username;

  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send();
}

let ind = 1

// function add_song() {
//   let ele = React.createElement("p", { id: "song_"+ind });
//   ind += 1
//   return ele;
// }

// let playlist_songs = React.createElement(
//   "playlist_songs",
//   null,
//   React.createElement(add_song, null)
// );

// ReactDOM.render(null, document.getElementById("playlist_songs"));

function call_add_song(text_content) {
  let p = document.createElement("p");
  p.textContent =  ind+". "+text_content;
  p.id = "playlist_song_" + ind;
  ind += 1
  // let btn = document.createElement("BUTTON");
  // btn.onclick = remove_from_playlist(ind);
  // p.addEventListener("click", remove_from_playlist(ind));
  // p.onclick = remove_from_playlist(ind);
  document.getElementById("playlist_songs").appendChild(p);  
  // document.getElementById("playlist_songs").appendChild(btn);  
}

function load_playlist() {
  let xhr = new XMLHttpRequest();
  
  let url = '/loadPlaylist';
  
  xhr.onload = 
  function() {
    // console.log(xhr.response);
    let data = JSON.parse(xhr.response);
    // console.log(data);
    currentPlaylist.track_names = data.track_names;
    currentPlaylist.track_artists = data.track_artists;
    currentPlaylist.track_albums = data.track_albums;
    currentPlaylist.track_uris = data.track_uris;
    currentPlaylist.track_durations_ms = data.track_durations_ms;
    
    let size = data.track_names.length;
    
    for (var i=0; i<size; i++) {
      let text = currentPlaylist.track_names[i] + ": " + currentPlaylist.track_artists[i];
      
      call_add_song(text);
    }
    
    document.getElementById("song").innerHTML = currentPlaylist.track_names[0] + "&nbsp;&nbsp;&nbsp;";
    document.getElementById("artist").innerHTML = currentPlaylist.track_artists[0] + "&nbsp;&nbsp;&nbsp;";
    document.getElementById("album").innerHTML = currentPlaylist.track_albums[0];
  }
  
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-9");
  xhr.send();
  
}

let current_playing = {
  current_song: '',
  current_artist: '',
  current_album: ''
};

function load_current_song() {
  let xhr = new XMLHttpRequest();
  
  let url = '/loadCurrentSong';
  
  xhr.onload = 
  function() {
    // console.log(xhr.response);
    let data = JSON.parse(xhr.response);
    // console.log(data);
    current_playing.current_song = data.current_song;
    current_playing.current_artist = data.current_artist;
    current_playing.current_album = data.current_album;
    
    let play_count = data.play_count;
    
    if (currentPlaylist.track_names.length == 0) {
      document.getElementById("song").innerHTML = '';
      document.getElementById("artist").innerHTML = '';
      document.getElementById("album").innerHTML = '';
      // console.log(currentPlaylist.track_albums[0]);
      document.getElementById("song-length").innerHTML = '';
    }
    else {
      let duration = currentPlaylist.track_durations_ms[0];
      let songMin = Math.floor((duration/1000)/60); // x:yz -> x
      let songSec = Math.floor((duration/1000)%60); // x:yz -> yz
      // console.log(duration);


      document.getElementById("song").innerHTML = currentPlaylist.track_names[0] + "&nbsp;&nbsp;&nbsp;";
      document.getElementById("artist").innerHTML = currentPlaylist.track_artists[0] + "&nbsp;&nbsp;&nbsp;";
      document.getElementById("album").innerHTML = currentPlaylist.track_albums[0];
      // console.log(currentPlaylist.track_albums[0]);
      document.getElementById("song-length").innerHTML = songMin + ':' + songSec;

      currentDuration = songSec + songMin*60;
      clearInterval(queryPlayback);
      runTimerUp(currentDuration);
    }
    
    // let size = data.track_names.length;
  }
  
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send();
}

// new_playlist();

load_playlist();
// load_current_song();

function load_num_users() {
  let xhr = new XMLHttpRequest();
  
  let url = '/getNumUsers';
  
  xhr.onload = 
  function() {
    let data = JSON.parse(xhr.response);
    console.log("Num_Users: " + data.num_users);
    let num_users = data.num_users;
    if (num_users == 2) {
      console.log("Play SONG");
      playSong();
    }
  }
  
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
  
  xhr.send();
}

load_num_users();

function closeChat() {
  document.getElementById("chat").style.display = "none";

}

function openChat() {
  document.getElementById("chat").style.display = "block";

}

function updateProgress() {
  $("#white_bar").load(location.href + " #white_bar");
  console.log("width %: " + document.getElementById("white_bar").style.width);
}

function is_client_open() {
  let xhr = new XMLHttpRequest();
  
  let url = '/isClientOpen?username=' + username;
  
  xhr.onload = 
  function() {
    let data = xhr.response;
    if (data == "true") {
      console.log("Client is Open");
    }
    else {
      alert("Your Spotify Client doesn't seem to be running. Open Spotify and play any song to get started.");
    }
  }
  
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send();
}
is_client_open();


//Chat

const url = "wss://chestnut-lowly-word.glitch.me";
const connection = new WebSocket(url);

let e = document.getElementById("newMsg");
e.addEventListener("change", sendNewMsg);

function sendNewMsg() {
  let e = document.getElementById("newMsg");
  let msgObj = {
    "type": "message",
    "from": username,
    "msg": e.value
  }
  connection.send(JSON.stringify(msgObj));
  e.value = null;
}

let addMessage = function(message) {
  const pTag = document.createElement("p");
  pTag.appendChild(document.createTextNode(message));
  document.getElementById("messages").appendChild(pTag);
};

connection.onopen = () => {
  connection.send(JSON.stringify({"type":"*New User Has Joined Chat"}));
};

connection.onerror = error => {
  console.log(`WebSocket error: ${error}`);
};

connection.onmessage = event => {
  let msgObj = JSON.parse(event.data);
  if (msgObj.type == "message") {
    addMessage(msgObj.from+": "+msgObj.msg);
  } else {
    addMessage(msgObj.type);
  }
};