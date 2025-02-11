let Peer = require("simple-peer"); // Importing the simple-peer module
let socket = io(); // Importing the socket.io module
const video = document.querySelector("video");
let client = {};

// Get stream
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    socket.emit("NewClient"); // Notfiy the backend
    video.srcObject = stream;
    video.play();

    function InitPeer(type) {
      //define a new peer and return it
      let peer = new Peer({
        initiator: type == "init" ? true : false,
        stream: stream,
        trickle: false,
      });
      peer.on("stream", function (stream) {
        CreateVideo(stream);
      });
      peer.on("close", function () {
        document.getElementById("peerVideo").remove();
        peer.destroy();
      });
      return peer;
    }

    function MakePeer() {
      client.gotAnswer = false;
      let peer = InitPeer("init");
      peer.on("signal", function (data) {
        //sets up a listener for the signal event
        if (!client.gotAnswer) {
          socket.emit("Offer", data);
        }
      });
      client.peer = peer;
    }

    // this function is used when we get an offer from the client and we want to send him the answer
    function FrontAnswer(offer) {
      let peer = InitPeer("notInit");
      peer.on("signal", (data) => {
        socket.emit("Answer", data);
      });
      peer.signal(offer);
    }

    // handle answers coming from the backend
    function SignalAnswer(answer) {
      client.gotAnswer = true;
      let peer = client.peer;
      peer.signal(answer);
    }

    function CreateVideo(stream) {
      CreateDiv();

      let video = document.createElement("video");
      video.id = "peerVideo";
      video.srcObject = stream;
      video.setAttribute("class", "embed-responsive-item");
      document.querySelector("#peerDiv").appendChild(video);
      video.play();
    }

    function SessionActive() {
      document.write("Session Active. Please come back later");
    }

    socket.on("BackOffer", FrontAnswer);
    socket.on("BackAnswer", SignalAnswer);
    socket.on("SessionActive", SessionActive);
    socket.on("CreatePeer", MakePeer);
  })
  .catch((err) => document.write(err));
