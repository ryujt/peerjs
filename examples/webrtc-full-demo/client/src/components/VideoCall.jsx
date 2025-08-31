import React, { useEffect, useRef } from 'react';
import './VideoCall.css';

function VideoCall({ localStream, remoteStream, isConnected, onStartCall, onEndCall, inCall }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="video-call-container">
      <div className="videos">
        <div className="video-wrapper local">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="video-element"
          />
          <div className="video-label">You</div>
        </div>
        
        <div className="video-wrapper remote">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="video-element"
          />
          <div className="video-label">Remote</div>
        </div>
      </div>

      <div className="video-controls">
        {!inCall ? (
          <button
            onClick={onStartCall}
            disabled={!isConnected}
            className="call-btn start"
          >
            Start Call
          </button>
        ) : (
          <button
            onClick={onEndCall}
            className="call-btn end"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
}

export default VideoCall;