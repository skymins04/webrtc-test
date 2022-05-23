let channel = null;
let connected = false;

let rtcConnection = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});

const rtcConnectionInit = () => {
  rtcConnection.ondatachannel = (event) => {
    console.log("ondatachannel");
    channel = event.channel;
    channel.onmessage = (event) => {
      if (event.data !== "ping") {
        document.getElementById("msgbox").innerHTML = event.data;
      }
    };
    const interval = setInterval(() => {
      try {
        sendPing();
        document.getElementById("total-state").innerHTML = "connected";
        connected = true;
      } catch (e) {
        if (connected) {
          clearInterval(interval);
          document.getElementById("total-state").innerHTML = "not connected";
          channel = null;
          rtcConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });
          rtcConnectionInit();
        }
      }
    }, 100);
  };
};
rtcConnectionInit();

const acceptRemoteOffer = async () => {
  await rtcConnection.setRemoteDescription(
    JSON.parse(document.getElementById("remote-description").value)
  );
};

const createAnswer = async () => {
  rtcConnection.onicecandidate = (event) => {
    console.log("onicecandidate", event);
    if (!event.candidate) {
      console.log(
        "created offer local description: ",
        JSON.stringify(rtcConnection.localDescription)
      );
      document.getElementById("local-description").value = JSON.stringify(
        rtcConnection.localDescription
      );
    }
  };

  const answer = await rtcConnection.createAnswer();
  await rtcConnection.setLocalDescription(answer);
};

const sendMessage = () => {
  channel.send(document.getElementById("message").value);
  document.getElementById("message").value = "";
};

const sendPing = () => {
  channel.send("ping");
};
