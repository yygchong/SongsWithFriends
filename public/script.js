"use strict";

function new_playlist() {
  const xhr = new XMLHttpRequest();
  
  let playlist = {
    name: "New Playlist"
  };
  
  let name = JSON.stringify(playlist);
  
  xhr.onloadend = 
    function() {
      console.log('Playlist Created');
    };
  
  xhr.onerror = 
    function (err) {
      console.log("Error: ", err);
    };
  
  let url = '/playlist';

  xhr.open("POST", url, true);

  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(name);
}
