import { useState, useRef, useEffect } from "react";
import "./web.css";
import downloadIcon from "./assets/download_icon.svg"
import settingsIcon from "./assets/settings_icon.svg"
import playIcon from "./assets/play_icon.svg"
import stopIcon from "./assets/stop_icon.svg"
import aiIcon from "./assets/ai_icon.svg"

function WebCamera() {
    const mimeType = "video/webm";
    let imgChunk;
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState(null);

    const mediaRecorder = useRef(null);
    const liveVideoFeed = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");

    const [videoChunks, setVideoChunks] = useState([]);
    const [recordedVideo, setRecordedVideo] = useState(null);

    const getCameraPermission = async () => {
        setRecordedVideo(null);
        if ("MediaRecorder" in window) {
            try {
                const videoConstraints = {
                    audio: false,
                    video: true,
                };
                const audioConstraints = { audio: true };
                const audioStream = await navigator.mediaDevices.getUserMedia(
                    audioConstraints
                );
                const videoStream = await navigator.mediaDevices.getUserMedia(
                    videoConstraints
                );
                setPermission(true);
                const combinedStream = new MediaStream([
                    ...videoStream.getVideoTracks(),
                    ...audioStream.getAudioTracks(),
                ]);
                setStream(combinedStream);
                liveVideoFeed.current.srcObject = videoStream;
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const startRecording = async () => {
        setRecordingStatus("recording");
        const media = new MediaRecorder(stream, { mimeType });
        mediaRecorder.current = media;
        mediaRecorder.current.start();
        let localVideoChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            imgChunk = event.data;
            localVideoChunks.push(event.data);
        };
        setVideoChunks(localVideoChunks);
    };

    const stopRecording = () => {
        setPermission(false);
        setRecordingStatus("inactive");
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
            const videoBlob = new Blob(videoChunks, { type: mimeType });
            const videoUrl = URL.createObjectURL(videoBlob);
            setRecordedVideo(videoUrl);
            setVideoChunks([]);
        };
    };

    return (
        <div>
            
            <div className="cam-win">

                <span>
                    <h5>Welcome to LipSync</h5>
                <div className="video-win">

                    {recordedVideo ? (
                        <video src={recordedVideo} controls></video>
                    ):null}

                    {!permission ? (
                        <button className="enable-cam-btn" onClick={getCameraPermission}>New Session</button>
                    ):null}

                </div>

                <div className="pos-bottom">

                {permission && recordingStatus === "inactive" ? (
                        <button className="cam-btn" onClick={startRecording}><img src={playIcon}/></button>
                    ):null}
                
                {permission && recordingStatus === "recording" ? (
                        <button className="cam-btn-active" onClick={stopRecording}><img src={stopIcon}/></button>
                    ):null}

                {recordedVideo ? (
                    <button className="cam-btn" onClick={getCameraPermission}>
                        <a download href={recordedVideo} >
                            <img src={downloadIcon}/>
                            </a>
                    </button>
                    
                ):null}
                {recordedVideo ? (
                    <button className="cam-btn" ><img src={aiIcon}/></button>
                ):null}
                    
                </div>
                </span>  
            </div>

            <div className="output-box">
                <textarea></textarea>
            </div>
        </div>
    );
}

export default WebCamera;