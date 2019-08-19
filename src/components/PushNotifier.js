import AutoButton from "./AutoButton";
import React from "react";

const makeAlert = () => {
  var frog = window.open(
    "",
    "wildebeast",
    "width=300,height=300,scrollbars=1,resizable=1"
  );

  var text = "This is stuff I want to put there";

  var html = "<html><head></head><body>Hello, <b>" + text + "</b>.";
  html += "How are you today?</body></html>";

  //variable name of window must be included for all three of the following methods so that
  //javascript knows not to write the string to this window, but instead to the new window

  frog.document.open();
  frog.document.write(html);
  frog.document.close();
};

const requestNotification = () => {
  Notification.requestPermission().then(function(status) {
    console.log(
      "Notification permission status:",
      status,
      Notification.permission
    );
    if (status === "granted") {
      var notification = new Notification("Hi there!");
    }
  });
};

let interval = null;

let toggleNotification = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  } else {
    interval = setInterval(sendNotification, 20000);
  }
};

const sendNotification = () => {
  console.log("Trying to send ", Notification.permission);
  if (Notification.permission === "granted") {
    console.log("GetReg");
    navigator.serviceWorker.getRegistration().then(function(reg) {
      console.log("Setting up");
      var options = {
        body: "Here is a notification body!",
        //icon: 'images/example.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        }
      };
      reg.showNotification("Hello world!", options);
    });
  }
};

// setInterval(sendNotification, 5000)

export default () => {
  return (
    <React.Fragment>
      <AutoButton
        onClick={requestNotification}
        label="Req Notification"
        id="requestit"
      />
      <AutoButton onClick={toggleNotification} label="Send it" id="sendit" />
    </React.Fragment>
  );
};
