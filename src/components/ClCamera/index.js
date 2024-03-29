import React, { Component } from "react";
import { Webcam } from "../../webcam";
import "./ClCamera.css";
import axios from "axios";
let imageCount = 0;
class ClCamera extends Component {
  constructor() {
    super();
    this.webcam = null;
    this.interval = null;
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    this.takePicture = this.takePicture.bind(this);
    this.state = {
      capturedImage: null,
      captured: false,
      uploading: false
    };
  }

  takePicture() {
    imageCount++;
    this.captureImage();
  }

  start() {
    this.interval = setInterval(this.takePicture, 2000);
    this.setState({
      captured: true
    });
  }

  stop() {
    clearInterval(this.interval);
    this.interval = null;
    this.discardImage();
  }
  componentDidMount() {
    // initialize the camera

    // setInterval(takePicture, 2000);
    this.canvasElement = document.createElement("canvas");
    this.webcam = new Webcam(
      document.getElementById("webcam"),
      this.canvasElement
    );
    this.webcam.setup().catch(() => {
      alert(
        "Error getting access to your camera, open browser in a standalone window"
      );
    });
  }

  componentDidUpdate(prevProps) {
    if (!this.props.offline && prevProps.offline === true) {
      // if its online,
      this.batchUploads();
    }
  }

  render() {
    const imageDisplay = this.state.capturedImage ? (
      <img src={this.state.capturedImage} alt="captured" width="350" />
    ) : (
      <span />
    );

    const buttons = this.state.captured ? (
      <div>
        <button className="deleteButton" onClick={this.discardImage}>
          {" "}
          Delete Photo{" "}
        </button>
        <button className="captureButton" onClick={this.uploadImage}>
          {" "}
          Upload Photo{" "}
        </button>
        {this.interval ? (
          <button className="captureButton" onClick={this.stop}>
            {" "}
            Stop snapping{" "}
          </button>
        ) : (
          ""
        )}
      </div>
    ) : (
      <div>
        <button className="captureButton" onClick={this.captureImage}>
          {" "}
          Take Picture{" "}
        </button>
        {!this.interval ? (
          <button className="captureButton" onClick={this.start}>
            {" "}
            Every 2 seconds{" "}
          </button>
        ) : (
          ""
        )}
      </div>
    );

    const uploading = this.state.uploading ? (
      <div>
        <p> Uploading Image, please wait ... </p>
      </div>
    ) : (
      <span />
    );

    return (
      <div>
        {uploading}
        <video
          autoPlay
          playsInline
          muted
          id="webcam"
          width="100%"
          height="200"
        />
        <br />
        <div> Image count is {imageCount} </div>
        {this.state.captured ? (
          <div className="imageCanvas">{imageDisplay}</div>
        ) : (
          ""
        )}
        {buttons}
      </div>
    );
  }

  captureImage = async () => {
    const capturedData = this.webcam.takeBase64Photo({
      type: "jpeg",
      quality: 0.8
    });
    // console.log(capturedData);
    this.setState({
      captured: true,
      capturedImage: capturedData.base64
    });
  };

  discardImage = () => {
    this.setState({
      captured: false,
      capturedImage: null
    });
  };

  uploadImage = () => {
    if (this.props.offline) {
      console.log("you're using in offline mode sha");
      // create a random string with a prefix
      const prefix = "cloudy_pwa_";
      // create random string
      const rs = Math.random()
        .toString(36)
        .substr(2, 5);
      localStorage.setItem(`${prefix}${rs}`, this.state.capturedImage);
      alert(
        "Image saved locally, it will be uploaded to your Cloudinary media library once internet connection is detected"
      );
      this.discardImage();

      // save image to local storage
    } else {
      this.setState({ uploading: true });
      axios
        .post(`https://api.cloudinary.com/v1_1/cloudycam/image/upload`, {
          file: this.state.capturedImage,
          upload_preset: "pwa_cloudinary"
        })
        .then(data => {
          this.setState({ uploading: false });
          if (data.status === 200) {
            // console.log(data);
            alert("Image Uploaded to Cloudinary Media Library");
            this.discardImage();
          } else {
            alert("Sorry, we encountered an error uploading your image");
          }
        })
        .catch(error => {
          alert("Sorry, we encountered an error uploading your image");
          this.setState({ uploading: false });
        });
    }
  };

  findLocalItems = query => {
    var i,
      results = [];
    for (i in localStorage) {
      if (localStorage.hasOwnProperty(i)) {
        if (i.match(query) || (!query && typeof i === "string")) {
          const value = localStorage.getItem(i);
          results.push({ key: i, val: value });
        }
      }
    }
    return results;
  };

  checkUploadStatus = data => {
    this.setState({ uploading: false });
    if (data.status === 200) {
      alert("Image Uploaded to Cloudinary Media Library");
      this.discardImage();
    } else {
      alert("Sorry, we encountered an error uploading your image");
    }
  };

  batchUploads = () => {
    // this is where all the images saved can be uploaded as batch uploads
    const images = this.findLocalItems(/^cloudy_pwa_/);
    let error = false;
    if (images.length > 0) {
      this.setState({ uploading: true });
      for (let i = 0; i < images.length; i++) {
        // upload
        axios
          .post(`https://api.cloudinary.com/v1_1/cloudycam/image/upload`, {
            file: images[i].val,
            upload_preset: "pwa_cloudinary"
          })
          .then(data => this.checkUploadStatus(data))
          .catch(error => {
            error = true;
          });
      }
      this.setState({ uploading: false });
      if (!error) {
        alert(
          "All saved images have been uploaded to your Cloudinary Media Library"
        );
      }
    }
  };
}
export default ClCamera;
