"use strict";
// React & ReactDOM installed in background, shows error here but will run still.


function loginRequest() {
  let url = "/auth/spotify";
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function() {
    console.log("logged in!");
  };
  xhr.onerror = function() {
    console.log("browser sees error");
  };
  xhr.send();
}

function title() {
  return React.createElement("h1", { id: "title" }, "Welcome to Songs with Friends");
}

function titleMessage() {
  return React.createElement(
    "h2",
    { id: "message" },
    "Sit back, relax, and let your friends queue the music!"
  );
}

function welcomeSide() {
  return React.createElement(
    "div",
    { id: "welcome" },
    React.createElement(title, null),
    React.createElement(titleMessage, null),
    React.createElement(loginButton, null)
  );
}

function loginButton() {
  return React.createElement("a", { href: "/auth/spotify" }, "Login with Spotify"); //id: 'loginButton', onClick: loginRequest }, "Log in with Google");
}

/*function loginSide() {
  return React.createElement(
    "div",
    { id: "login" },
    React.createElement(loginButton, null)
  );
}*/

var main = React.createElement(
  "main",
  null,
  React.createElement(welcomeSide, null),
);

ReactDOM.render(main, document.getElementById("root"));
