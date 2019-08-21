import React, { Component } from "react";
import logo from "./rev1x1.jpg";
import "./App.css";
import ClCamera from "./components/ClCamera";
import Notifier from "./components/Notifier";
import PushNotifier from "./components/PushNotifier";
class App extends Component {
  constructor() {
    super();
    this.state = {
      offline: false
    };
  }
  componentDidMount() {
    window.addEventListener("online", () => {
      this.setState({ offline: false });
    });

    window.addEventListener("offline", () => {
      this.setState({ offline: true });
    });
  }

  componentDidUpdate() {
    let offlineStatus = !navigator.onLine;
    if (this.state.offline !== offlineStatus) {
      this.setState({ offline: offlineStatus });
    }
  }

  render() {
    return (
      <div className="App">
        <Notifier offline={this.state.offline} />
        <PushNotifier />

        <header className="App-header">
          <img
            style={{ paddingTop: "15px" }}
            src={logo}
            className="App-logo"
            alt="Cloudinary Logo"
          />
          <h1 className="App-title">Revolution 1x1 App</h1>
        </header>
        <ClCamera offline={this.state.offline} />
      </div>
    );
  }
}

export default App;
