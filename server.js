const express = require("express");
const app = express();

// a http server
const http = require("http").Server(app);

// a socket.io server
const io = require("socket.io")(http);

const port = process.env.PORT || 5000;

// go to public folder and load the index.html file
app.use(express.static(__dirname + "/public"));

let clients = 0;

io.on("connection", function (socket) {
  socket.on("NewClient", function () {
    if (clients < 2) {
      if (clients == 1) {
        this.emit("CreatePeer");
      }
    } else {
      this.emit("SessionActive");
    }
    clients++;
  });
  socket.on("Offer", SendOffer);
  socket.on("Answer", SendAnswer);
  socket.on("disconnect", Disconnect);
});

function Disconnect() {
  if (clients > 0) {
    clients--;
  }
}

function SendOffer(offer) {
  this.broadcast.emit("BackOffer", offer);
}

function SendAnswer(data) {
  this.broadcast.emit("BackAnswer", data);
}

http.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
