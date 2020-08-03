// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();
const assets = require("./assets");
const fs = require("fs");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");
const FormData = require('form-data');
const cookieParser = require('cookie-parser');
const queryString = require('query-string');
const expressSession = require('express-session');
// passport for dealing with API calls
const passport = require('passport');
// request for API calls/requests
const request = require('request');

const dbUsersFileName = "spotifyUsers.db";
const dbPlaylistsFileName = "spotifyPlaylists.db";

const spotify_scopes = ['user-read-email', 'playlist-read-collaborative', 'playlist-modify-private', 'playlist-modify-public', "user-read-playback-state", "user-modify-playback-state"];

// If db doesn't exist, create a new one
if (!fs.existsSync(dbUsersFileName)) {
  let dbUsers = new sqlite3.Database(dbUsersFileName);
  
  let cmdStr = "CREATE TABLE spotifyUsers (id TEXT, accessToken TEXT)";
  dbUsers.run(cmdStr, err => {
    if (err) {
      console.log("Table creation error", err);
    } else {
      console.log("Database created");
    }
  });

  dbUsers.close();
}

// If db doesn't exist, create a new one
if (!fs.existsSync(dbPlaylistsFileName)) {
  let dbPlaylists = new sqlite3.Database(dbPlaylistsFileName);
  
  let cmdStr = "CREATE TABLE spotifyPlaylists (user_id TEXT, playlist_id TEXT, playlist_name TEXT, accessToken TEXT)";
  dbPlaylists.run(cmdStr, err => {
    if (err) {
      console.log("Table creation error", err);
    } else {
      console.log("Database created");
    }
  });

  dbPlaylists.close();
}

const dbUsers = new sqlite3.Database(dbUsersFileName);
const dbPlaylists = new sqlite3.Database(dbPlaylistsFileName);

const clID = process.env.CLIENT_ID;
const clSecret = process.env.CLIENT_SECRET;
const callback_URL = process.env.Callback_URI;

let playlist_id = '';

// Creating Playlist to current user's account
function createPlaylist(user) {
  let getcmd = 'SELECT * FROM spotifyUsers WHERE id = ?';
  let username = user; // req.body.username;
  // let username = 'randalmurphal';
  let url = 'https://api.spotify.com/v1/users/' + username + '/playlists';
  let method = "POST";
  let playlist_name = "New Playlist";
  // let playlist_name = req.body.playlist_name;
  
  let reqBody = {
    "name": playlist_name,
    "public": false,
    "collaborative": true
  };
  
  dbUsers.get(getcmd, [username], 
         (err, data) => {
            
            let accessToken = data.accessToken;
            let headers = {
              "content-type": "application/json",
              'Authorization': 'Bearer ' + accessToken
            };

            request(
              {
                url: url,
                method: method,
                headers: headers,
                json: reqBody
              },
              (err, resHead, resBody) => {
                if(err) {
                  throw err;
                }
                else {
                  // Create new spotifyPlaylists.db entry
                  let inscmd = 'INSERT INTO spotifyPlaylists (user_id, playlist_id, playlist_name, accessToken) Values(?, ?, ?, ?)';
                  playlist_id = resBody.id; // use this later ***
                  let user_id = username;
                  
                  dbPlaylists.run(inscmd, [user_id, playlist_id, playlist_name, accessToken],
                    (err) => {
                      if (err) {
                        throw err;
                      }
                      else {
                        console.log("Successfully Inserted New Playlist: " + playlist_name);
                        // console.log(playlist_id);
                      }
                    });
                  // res.send();
                }
              }
            );
          });
}

let currentPlaying = {
  current_song: '',
  current_artist: '',
  current_album: ''
};

app.put("/playSong", playSong);
function playSong(req, res) {
  let user = req.query.username;
  currentPlaying.current_song = req.query.current_song;
  currentPlaying.current_artist = req.query.current_artist;
  currentPlaying.current_album = req.query.current_album;
  let cmd = "SELECT accessToken FROM spotifyUsers"; // WHERE id = ?";
  let method = "PUT";
  dbUsers.all(cmd,  
    (err, data) => {
      // console.log(data);
      let size = data.length;
      // console.log(size);
      // console.log(data[0].accessToken);
    
      for (let i=0; i<size; i++) {
        let accessToken = data[i].accessToken;
        let url = "https://api.spotify.com/v1/me/player/play"
        let headers = {
          "Accept": "application/json",
          "content-type": "application/json",
          "Authorization": "Bearer " + accessToken
        }; 
        let playData = {
          "context_uri": "spotify:playlist:" + playlist_id,
          "offset": {
            "position": 0
           },
          "position_ms": 0
        }
        request(
        {
          url: url,
          method: method,
          headers: headers,
          json: playData      
        },
        (err, resHead, resBody) => {
          if (err) {
            throw err;
          }
          else {
            // console.log(resHead);
            console.log("(server) played song for user 1st time: ", user);
          }
        })
      }
      res.send();
  });
}

app.put("/resumeSong", resumeSong);
function resumeSong(req, res) {
  let user = req.query.username;
  currentPlaying.current_song = req.query.current_song;
  currentPlaying.current_artist = req.query.current_artist;
  currentPlaying.current_album = req.query.current_album;
  let cmd = "SELECT accessToken FROM spotifyUsers"; // WHERE id = ?";
  let method = "PUT";
  dbUsers.all(cmd, 
    (err, data) => {
      let size = data.length;
      for (let i=0; i<size; i++) {
        let accessToken = data[i].accessToken;
        let url = "https://api.spotify.com/v1/me/player/play"
        let headers = {
          "Accept": "application/json",
          "content-type": "application/json",
          "Authorization": "Bearer " + accessToken
        }; 
        request(
        {
          url: url,
          method: method,
          headers: headers    
        },
        (err, resHead, resBody) => {
          if (err) {
            throw err;
          }
          else {
            console.log("(server) resumed song for user: ", user);
          }
        })
      }
      res.send();
  });
}

app.put("/pauseSong", pauseSong);
function pauseSong(req, res) {
  let user = req.query.username;
  let cmd = "SELECT accessToken FROM spotifyUsers"; // WHERE id = ?";
  let method = "PUT";
  dbUsers.all(cmd, 
    (err, data) => {
      let size = data.length;
      for (let i=0; i<size; i++) {
        let accessToken = data[i].accessToken;
        let url = "https://api.spotify.com/v1/me/player/pause"
        let headers = {
          "Accept": "application/json",
          "content-type": "application/json",
          "Authorization": "Bearer " + accessToken
        }; 
        request(
        {
          url: url,
          method: method,
          headers: headers    
        },
        (err, resHead, resBody) => {
          if (err) {
            throw err;
          }
          else {
            console.log("(server) paused song for user 1st time: ", user);
          }
        })
      }
      res.send();
  });
}

app.put("/shuffleOff", shuffleOff);
function shuffleOff(req, res) {
  let user = req.query.username;
  let cmd = "SELECT * FROM spotifyUsers WHERE id = ?";
  let method = "PUT";
  dbUsers.get(cmd, [user], 
    (err, data) => {
      let accessToken = data.accessToken;
      let url = "https://api.spotify.com/v1/me/player/shuffle?state=false";
      let headers = {
        "Accept": "application/json",
        "content-type": "application/json",
        "Authorization": "Bearer " + accessToken
      };
    
    request(
      {
        url: url,
        method: method,
        headers: headers,
      },
    (err, resHead, resBody) => {
      if (err) {
        throw err;
      }
      else {
        console.log("(server) shuffle toggled off for user: ", user);
        res.send();
      }
    })
  });
}

app.put("/repeatOff", repeatOff);
function repeatOff(req, res) {
  let user = req.query.username;
  let cmd = "SELECT * FROM spotifyUsers WHERE id = ?";
  let method = "PUT";
  dbUsers.get(cmd, [user], 
    (err, data) => {
      let accessToken = data.accessToken;
      let url = "https://api.spotify.com/v1/me/player/repeat?state=off";
      let headers = {
        "Accept": "application/json",
        "content-type": "application/json",
        "Authorization": "Bearer " + accessToken
      };
    
    request(
      {
        url: url,
        method: method,
        headers: headers,
      },
    (err, resHead, resBody) => {
      if (err) {
        throw err;
      }
      else {
        console.log("(server) repeat toggled off for user: ", user);
        res.send();
      }
    })
  });
}

function addToQueue(req, res) {
  let user = req.body.username;
  let track_uri = req.body.track_uri;
  // let user = "randalmurphal";
  let cmd = "SELECT * FROM spotifyUsers WHERE id = ?";
  let method = "POST";
  
  // TODO: Get Track id from search
  // let track_uri = 'spotify:track:19eS1kCEvKz2eVOrRGb1uL';
  dbUsers.get(cmd, [user], 
    (err, data) => {
      let accessToken = data.accessToken;
      //console.log(accessToken);
      let url = "https://api.spotify.com/v1/me/player/queue?uri=" + encodeURIComponent(track_uri);
      let headers = {
        "Accept": "application/json",
        "content-type": "application/json",
        "Authorization": "Bearer " + accessToken
      };
    
    request(
      {
        url: url,
        method: method,
        headers: headers
      },
    (err, resHead, resBody) => {
      if (err) {
        throw err;
      }
      else {
        console.log("Added Song to Queue");
        res.send();
      }
    })
  });  
}

app.get('/search_song', searchSong);

function searchSong(req, res) {
  let song = req.query.song;
  
  let user = req.query.username;
  // console.log(req.query);
  // let user = "randalmurphal";
  let cmd = "SELECT * FROM spotifyUsers WHERE id = ?";
  
  // let song = "Could Have Been Me";
  // let artist = "The Struts";
  
  dbUsers.get(cmd, [user], 
    (err, data) => {
      let accessToken = data.accessToken;
      let url = "https://api.spotify.com/v1/search?q=" + encodeURIComponent(song) + "&type=track&limit=5";

      let headers = {
        "Accept": "application/json",
        "content-type": "application/json",
        "Authorization": "Bearer " + accessToken
      };
    
      request(
      {
        url: url,
        method: "GET",
        headers: headers
      },
      (err, resHead, resBody) => {
        if (err) {
          throw err;
        }
        else {
          let tracks = JSON.parse(resBody).tracks.items;
          let track_names = [];
          let artist_names = [];
          let track_uris = [];
          let album_names = [];
          let album_imgs = [];
          let track_durations_ms = [];
                    
          for (let i=0; i < tracks.length; i++) {
            track_uris.push(tracks[i].uri);
            track_names.push(tracks[i].name);
            artist_names.push(tracks[i].artists[0].name);
            album_names.push(tracks[i].album.name);
            album_imgs.push(tracks[i].album.images[0].url);
            track_durations_ms.push(tracks[i].duration_ms);
          }
          let json = {
            track_names: track_names,
            artist_names: artist_names,
            track_uris: track_uris,
            album_names: album_names,
            album_imgs: album_imgs,
            track_durations_ms: track_durations_ms
          };
          json = JSON.stringify(json);
          res.send(json);
        }
      })
  });
}

// searchSong();

let currentPlaylist = {
  "playlist_name": "New Playlist",
  "playlist_uri": "6NJNWcbotw72PXfcfVkH6g",
  "tracks_uri": [],
  "track_names": new Map(),
  "artist_names": [],
  "album_imgs": [],
  "album_names": [],
  "track_durations_ms": []
};


app.put("/volume_mute", volume_mute);
function volume_mute(req, res) {
  let getcmd = "SELECT * FROM spotifyUsers WHERE id = ?";
  let username = req.query.username;
  
  dbUsers.get(getcmd, [username],
    (err, data) => {
      if (err) {
        throw err;
      }
      let accessToken = data.accessToken;
      let url = "https://api.spotify.com/v1/me/player/volume?volume_percent=0";
      
      let headers = {
        "Accept": "application/json",
        "Authorization": "Bearer " + accessToken
      };
    
      request(
      {
        url: url,
        method: "PUT",
        headers: headers
      },
      (err, resHead, resBody) => {
        if (err) {
          // throw err;
          console.log("(server) Error muting volume");
        }
        else {
          console.log("(server) volume muted");
          res.send();
        }
      });
  });
}

app.put("/volume_increase", volume_increase);
function volume_increase(req, res) {
  let getcmd = "SELECT * FROM spotifyUsers WHERE id = ?";
  let username = req.query.username;
  let volumeLevel = req.query.volume_percent;
  let volume_percent = +volumeLevel + 15;
  if (volume_percent > 100) { volume_percent = 100; }
  console.log("(server) old volume: " + volumeLevel + " new volume: " + volume_percent);
  
  dbUsers.get(getcmd, [username],
    (err, data) => {
      if (err) {
        throw err;
      }
      let accessToken = data.accessToken;
      let url = "https://api.spotify.com/v1/me/player/volume?volume_percent=" + volume_percent;
      
      let headers = {
        "Accept": "application/json",
        "Authorization": "Bearer " + accessToken
      };
    
      request(
      {
        url: url,
        method: "PUT",
        headers: headers
      },
      (err, resHead, resBody) => {
        if (err) {
          // throw err;
          console.log("(server) increasing volume");
        }
        else {
          console.log("(server) volume increased");
          res.send();
        }
      });
  });
}

app.get("/get_volume", get_volume);
function get_volume(req, res) { 
  let getcmd = "SELECT * FROM spotifyUsers WHERE id = ?";
  let username = req.query.username;
  
  dbUsers.get(getcmd, [username],
    (err, data) => {
      if (err) {
        throw err;
      }
      let accessToken = data.accessToken;
      let url = "https://api.spotify.com/v1/me/player";
      
      let headers = {
        "Accept": "application/json",
        "Authorization": "Bearer " + accessToken
      };
    
      request(
      {
        url: url,
        method: "GET",
        headers: headers
      },
      (err, resHead, resBody) => {
        if (err) {
          // throw err;
          console.log("(server) Error getting volume info");
        }
        else {
          //console.log("(server) playback info retrieved");
          console.log("VOLUME DATA: " + JSON.stringify((JSON.parse(resBody)).device.volume_percent));
          res.send(JSON.stringify((JSON.parse(resBody)).device.volume_percent));
        }
      });
  });
}

app.get("/get_playback_info", get_playback_info);
function get_playback_info(req, res) { 
  //console.log("entered server get playback");
  let getcmd = "SELECT * FROM spotifyUsers WHERE id = ?";
  let username = req.query.username;
  
  dbUsers.get(getcmd, [username],
    (err, data) => {
      if (err) {
        throw err;
      }
      let accessToken = data.accessToken;
      let url = "https://api.spotify.com/v1/me/player/currently-playing";
      
      let headers = {
        "Accept": "application/json",
        "Authorization": "Bearer " + accessToken
      };
    
      request(
      {
        url: url,
        method: "GET",
        headers: headers
      },
      (err, resHead, resBody) => {
        if (err) {
          throw err;
        }
        else {
          res.send(resBody);
        }
      });
  });
}

app.get('/addToPlaylist', addToPlaylist);
// Expects to be send: playlist_name, track_uri, track_name, album_img, username, album_name, track_duration, artist name
function addToPlaylist(req, res) {
  let playlist_name = req.query.playlist_name;
  let track_uri = req.query.track_uri;
  let track_name = req.query.track_name;
  let album_img = req.query.album_img;
  let username = req.query.username;
  let album_name = req.query.album_name;
  let track_artist = req.query.track_artist;
  let track_duration_ms = req.query.track_duration_ms;
  let getcmd = "SELECT * FROM spotifyPlaylists WHERE playlist_name = ?";
  
  dbPlaylists.get(getcmd, [playlist_name], 
    (err, data) => {
      if (err) {
        throw err;
      }
      let playlist_id = data.playlist_id;
      let accessToken = data.accessToken;
      console.log("access token: " + accessToken)
      let url = "https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks?uris=" + encodeURIComponent(track_uri);
    
      let headers = {
        "Accept": "application/json",
        "Authorization": "Bearer " + accessToken
      };
    
      request(
      {
        url: url,
        method: "POST",
        headers: headers
      },
      (err, resHead, resBody) => {
        if (err || resHead.statusCode != 201) {
          // throw err;
          console.log("Error Adding Song to Playlist " + accessToken);
        }
        else {
          let playlist = {
            "track_uri": '',
            "track_name": '',
            "track_artist": '',
            "track_album": '',
            "track_length": ''
          }
          playlist.track_uri = track_uri;
          playlist.track_name = track_name;
          playlist.track_artist = track_artist;
          playlist.track_album = album_name;
          playlist.track_length = track_duration_ms;
          
          currentPlaylist.tracks_uri.push(track_uri);
          currentPlaylist.track_names.set(track_name, username);
          currentPlaylist.album_imgs.push(album_img);
          currentPlaylist.album_names.push(album_name);
          currentPlaylist.track_durations_ms.push(track_duration_ms);
          currentPlaylist.artist_names.push(track_artist);
          
          console.log("Added Song to Playlist");
          let res_playlist = JSON.stringify(playlist);
          res.send(playlist);
        }
      });    
  });
}


app.post('/removeFromPlaylist', removeFromPlaylist);
function removeFromPlaylist(req, res) {
  let playlist_name = req.query.playlist_name;
  let username = req.query.username;
  let track_uri = req.query.track_uri;
  let positions = [parseInt(req.query.positions)]; // req.query.positions;
  let track_name = req.query.track_name;
  let getcmd = "SELECT * FROM spotifyPlaylists WHERE playlist_name = ?";
  
  
  dbPlaylists.get(getcmd, [playlist_name], 
    (err, data) => {
      if (err) {
        throw err;
      }
      let playlist_id = data.playlist_id;
      let accessToken = data.accessToken;
      let track_owner = currentPlaylist.track_names.get(track_name);
    
      if (track_owner != username) {
        console.log("owner: " + track_owner);
        console.log("user: " + username);
        console.log("Invalid Owner of Track");
      }
      else {
        let url = "https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks"; 
    
        let headers = {
          "Accept": "application/json",
          "content-type": "application/json",
          "Authorization": "Bearer " + accessToken
        };

        let json = {
          "tracks": [
            {
              "uri": track_uri,
              "positions": positions
            }
          ]
        };

        request(
        {
          url: url,
          method: "DELETE",
          headers: headers,
          json: json
        },
        (err, resHead, resBody) => {
          if (err || resHead.statusCode != 200) {
            // throw err;
            console.log("Error Deleting Track");
          }
          else {
            let end = currentPlaylist.tracks_uri.length;
            
            let uri1 = currentPlaylist.tracks_uri.slice(0, positions);
            let uri2 = currentPlaylist.tracks_uri.slice(positions+1, end);
            currentPlaylist.tracks_uri = uri1.concat(uri2);
            
            let album_img1 = currentPlaylist.album_imgs.slice(0, positions);
            let album_img2 = currentPlaylist.album_imgs.slice(positions+1, end);
            currentPlaylist.album_imgs = album_img1.concat(album_img2);
            
            let album_name1 = currentPlaylist.album_names.slice(0, positions);
            let album_name2 = currentPlaylist.album_names.slice(positions+1, end);
            currentPlaylist.album_names = album_name1.concat(album_name2);
            
            let duration1 = currentPlaylist.track_durations_ms.slice(0, positions);
            let duration2 = currentPlaylist.track_durations_ms.slice(positions+1, end);
            currentPlaylist.track_durations_ms = duration1.concat(duration2);
            
            currentPlaylist.track_names.delete(track_name);
            
            
            console.log("Deleted Song From Playlist");
            res.send();
          }
        });    
      }
  });
}

// shows all contents of the database
function dumpDBUsers() {
  dbUsers.all("SELECT * FROM spotifyUsers", function(err, data) {
    console.log(data);
  });
}


function dumpDBPlaylists() {
  dbPlaylists.all("SELECT * FROM spotifyPlaylists", function(err, data) {
    console.log(data);
  });
}

dumpDBPlaylists();

// App pipeline

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/login.html');
});
app.get('/*', express.static('public'));


// puts cookies into req.cookies
app.use(cookieParser());
app.use(express.json());
// take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({extended: true}));
// Initializes request object for further handling by passport
app.use(passport.initialize()); 
app.use(passport.session());



// Use cookies
app.use(expressSession(
  { 
    secret:'spotify',  // a random string used for encryption of cookies
    maxAge: 6 * 60 * 60 * 1000, // Cookie time out - six hours in milliseconds
    // setting these to default values to prevent warning messages
    resave: true,
    saveUninitialized: false,
    // make a named session cookie; makes one called "connect.sid" as well
    name: "ecs162-session-cookie"
  }));

app.get('/setcookie', requireUser,
  function(req, res, next) {
    let username = req.user.id;
    let url = '/user/load.html';
    res.cookie('spotify-passport', new Date());
    res.redirect(url + '?username=' + username);
  }
);

// Spotify Login Stuff

const SpotifyStrategy = require('passport-spotify').Strategy;
const spotifyLoginData = {
  clientID: clID,
  clientSecret: clSecret,
  callbackURL: callback_URL
};
// Tell passport that it can use spotify API
passport.use(new SpotifyStrategy(spotifyLoginData, gotProfile));

let num_users = 0;

// Callback once spotify account is retreived
function gotProfile(accessToken, refreshToken, profile, done) {
  let insertcmd = 'INSERT INTO spotifyUsers (id, accessToken) Values(?, ?)';
  let selectcmd = 'SELECT * FROM spotifyUsers WHERE id = ?';
  let updateUserscmd = 'UPDATE spotifyUsers SET accessToken = ? WHERE id = ?';
  let updatePlaylistscmd = 'UPDATE spotifyPlaylists SET accessToken = ? WHERE user_id = ?';
  let id = profile.id;
  console.log("id is: " + id);
  
  dbUsers.all(selectcmd, [id], (err, row) => {
    if (err) {
      console.log("Error: ", err);
      throw err;
    }
    // if user is not yet created, create the user. Else, update to new accessToken
    if (row[0] == null) {
      dbUsers.run(insertcmd, [id, accessToken], 
             (err) => {
                if (err) {
                  console.log("Error: ", err);
                } 
                else {
                  console.log("Successfully inserted user.");
                  num_users++;
                  if (num_users == 1) {
                    createPlaylist(id);
                  }
                  // let isClientOpen = availClient(accessToken);
                  // dumpDB();
                }
            });
    }
    else {
      dbUsers.run(updateUserscmd, [accessToken, id], (err) => {
        if (err) {
          throw err;
        }
        else {
          console.log("Updated User Access Token");
          console.log("User: ", id);
          console.log("Access Token: ", accessToken);
          // availClient(accessToken);
        }
      });
      dbPlaylists.run(updatePlaylistscmd, [accessToken, id], 
        (err) => {
          if (err) {
            throw err;
          }
          else {
            console.log("Updated Playlist Access Token");
            console.log("User: ", id);
            console.log("Access Token: ", accessToken);
          }
        })
    }
  });
  
  let user = {
    id: id,
    accessToken: accessToken
  };
  
  
  done(null, user);
}

app.get('/user/*', requireUser, requireLogin, express.static('.'));

// app.get('/user/*', express.static('.'));
app.get('/auth/spotify', passport.authenticate('spotify', {
        scope: spotify_scopes,
      })
);
app.get('/auth/accepted', 
  passport.authenticate('spotify', { successRedirect: '/setcookie', failureRedirect: '/public/login.html' })
);
app.post('/create_playlist', createPlaylist, (err, req, res) => {
  if (err) {
    // Shouldn't call this function, callback in createPlaylist API request
    throw err;
  }
});

// using this route, we can clear the cookie and close the session
app.get('/logout',
  function(req, res) {
    // clear both the public and the named session cookie
    req.logout();
    res.clearCookie('spotify-passport');
    res.clearCookie('ecs162-session-cookie');
    res.redirect('/login.html');
  }
);

passport.serializeUser((user, done) => {
    // console.log("SerializeUser. Input is", user);
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Login Credential Stuff
function requireUser (req, res, next) {
  let session_passport = req.session.passport
  if (session_passport == null) {
    console.log("no req.user");
    res.redirect('/login.html');
  } else {
    req.user = session_passport.user;
    next();
  }
};

function requireLogin (req, res, next) {
  //console.log("checking:",req.cookies);
  if (req.cookies == null) {
    res.redirect('/public/login.html');
  } else {
    next();
  }
};


// listen for HTTP requests :)


app.get('/loadPlaylist', loadPlaylist);

function loadPlaylist(req, res) {
  let username = req.query.username;
  // let isClientOpen = availClient(username);
  // console.log(currentPlaylist.track_names.keys);//.keys());
  let keys = currentPlaylist.track_names.keys();
  let num_keys = currentPlaylist.track_names.size;
  let track_names = [];
  for (var i = 0; i < num_keys; i++) {
    track_names.push(keys.next().value);
  }
  // console.log(track_names);
  // console.log(currentPlaylist);
  let track_artists = currentPlaylist.artist_names;
  let track_albums = currentPlaylist.album_names;
  let track_uris = currentPlaylist.tracks_uri;
  let track_durations_ms = currentPlaylist.track_durations_ms;
  // console.log(isClientOpen);
  let playlist = {
    track_names: track_names,
    track_artists: track_artists,
    track_albums: track_albums,
    track_uris: track_uris,
    track_durations_ms: track_durations_ms
    // isClientOpen: isClientOpen
  };
  let response = JSON.stringify(playlist);
  
  res.send(response);
}

app.get('/isClientOpen', availClient);

function availClient(req, res) {
  let getcmd = "SELECT * FROM spotifyUsers WHERE id = ?";
  let username = req.query.username;
  
  dbUsers.get(getcmd, [username],
             (err, data) => {
    if (err) {
      throw err;
    }
    else {
      let accessToken = data.accessToken;
      
      let url = 'https://api.spotify.com/v1/me/player';
      let method = "GET";

      let headers = {
        "Authorization": "Bearer " + accessToken
      }
      // console.log(accessToken);
      request(
            {
              url: url,
              method: method,
              headers: headers
            },
            (err, resHead, resBody) => {
              if (err) {
                console.log("Error: " + err);
              }
              else {
                // console.log(resHead);
                // console.log(resBody);
                if (resBody) {
                  console.log("resBody");
                  res.send(true);
                }
                else {
                  console.log("No Client Open for last user.");
                  // return false;
                  res.send(false);
                }
              }
            }); 
    }
  })
  
     
  
}

app.get('/loadCurrentSong', loadCurrentSong);

function loadCurrentSong(req, res) {
  let current_playing = {
    current_song: currentPlaylist.currentSong,
    current_artist: currentPlaylist.currentArtist,
    current_album: currentPlaylist.currentAlbum
  }
  
  let response = JSON.stringify(current_playing);
  res.send(response);
}

app.get('/getNumUsers', getNumUsers);

function getNumUsers(req, res) {
  let getcmd = "SELECT COUNT(*) FROM spotifyUsers";
  
  dbUsers.all(getcmd,
     (err, data) => {
        let count = data[0]['COUNT(*)'];
        // console.log
        let values = {
          num_users: count
        };
        let response = JSON.stringify(values);
        res.send(response);
      });
}

//Chat features

const WebSocket = require('ws');
const http = require("http");
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    broadcast(message)
  })
  ws.send('connected!')
})

wss.on('infoConnection', (ws) => {
  ws.on('infoObj', (infoObj) => {
    broadcast(infoObj)
  })
  ws.send('connected!')
})

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});



