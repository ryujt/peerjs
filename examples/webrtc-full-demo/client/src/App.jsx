import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import VideoCall from './components/VideoCall';
import TextChat from './components/TextChat';
import Whiteboard from './components/Whiteboard';
import UserList from './components/UserList';
import './App.css';

function App() {
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [connection, setConnection] = useState(null);
  const [call, setCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('video');
  const whiteboardRef = useRef(null);

  useEffect(() => {
    const newPeer = new Peer(undefined, {
      host: 'localhost',
      port: 9000,
      path: '/peerjs',
    });

    newPeer.on('open', (id) => {
      setPeerId(id);
      console.log('My peer ID is:', id);
    });

    newPeer.on('connection', (conn) => {
      handleIncomingConnection(conn);
    });

    newPeer.on('call', (incomingCall) => {
      handleIncomingCall(incomingCall);
    });

    newPeer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    setPeer(newPeer);

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      newPeer.destroy();
    };
  }, []);

  useEffect(() => {
    if (peerId && username) {
      registerUser();
    }
  }, [peerId, username]);

  useEffect(() => {
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  const registerUser = async () => {
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId, username }),
      });
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.filter(user => user.peerId !== peerId));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleIncomingConnection = (conn) => {
    conn.on('open', () => {
      setConnection(conn);
      setIsConnected(true);
      setRemotePeerId(conn.peer);

      conn.on('data', (data) => {
        handleDataReceived(data);
      });

      conn.on('close', () => {
        setIsConnected(false);
        setConnection(null);
      });
    });
  };

  const handleIncomingCall = async (incomingCall) => {
    const stream = await startLocalStream();
    incomingCall.answer(stream);
    
    incomingCall.on('stream', (stream) => {
      setRemoteStream(stream);
    });

    setCall(incomingCall);
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Failed to get local stream:', error);
      return null;
    }
  };

  const connectToPeer = (targetPeerId) => {
    if (!peer) return;

    const conn = peer.connect(targetPeerId);
    
    conn.on('open', () => {
      setConnection(conn);
      setIsConnected(true);
      setRemotePeerId(targetPeerId);

      conn.on('data', (data) => {
        handleDataReceived(data);
      });

      conn.on('close', () => {
        setIsConnected(false);
        setConnection(null);
      });
    });
  };

  const startCall = async () => {
    if (!peer || !remotePeerId) return;

    const stream = await startLocalStream();
    if (!stream) return;

    const outgoingCall = peer.call(remotePeerId, stream);
    
    outgoingCall.on('stream', (stream) => {
      setRemoteStream(stream);
    });

    setCall(outgoingCall);
  };

  const endCall = () => {
    if (call) {
      call.close();
      setCall(null);
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
  };

  const handleDataReceived = (data) => {
    if (data.type === 'message') {
      setMessages(prev => [...prev, { ...data.payload, received: true }]);
    } else if (data.type === 'whiteboard') {
      if (whiteboardRef.current) {
        whiteboardRef.current.handleRemoteDrawing(data.payload);
      }
    }
  };

  const sendMessage = (text) => {
    if (!connection) return;

    const message = {
      id: Date.now(),
      text,
      sender: username || peerId,
      timestamp: new Date().toISOString(),
    };

    connection.send({
      type: 'message',
      payload: message,
    });

    setMessages(prev => [...prev, { ...message, received: false }]);
  };

  const sendWhiteboardData = (data) => {
    if (!connection) return;

    connection.send({
      type: 'whiteboard',
      payload: data,
    });
  };

  const disconnect = () => {
    if (connection) {
      connection.close();
    }
    if (call) {
      endCall();
    }
    setIsConnected(false);
    setConnection(null);
    setRemotePeerId('');
  };

  if (!username) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Enter Your Name</h2>
          <input
            type="text"
            placeholder="Your name"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                setUsername(e.target.value.trim());
              }
            }}
          />
          <button onClick={(e) => {
            const input = e.target.previousSibling;
            if (input.value.trim()) {
              setUsername(input.value.trim());
            }
          }}>
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>WebRTC Video Chat</h1>
        <div className="connection-info">
          <span>Your ID: {peerId}</span>
          {isConnected && <span className="connected">Connected to: {remotePeerId}</span>}
        </div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <UserList
            users={users}
            onUserClick={(user) => {
              setRemotePeerId(user.peerId);
              connectToPeer(user.peerId);
            }}
            currentUser={username}
          />
          
          <div className="connection-controls">
            {!isConnected ? (
              <>
                <input
                  type="text"
                  placeholder="Remote Peer ID"
                  value={remotePeerId}
                  onChange={(e) => setRemotePeerId(e.target.value)}
                />
                <button onClick={() => connectToPeer(remotePeerId)}>
                  Connect
                </button>
              </>
            ) : (
              <button onClick={disconnect} className="disconnect-btn">
                Disconnect
              </button>
            )}
          </div>
        </aside>

        <main className="content">
          <div className="tabs">
            <button
              className={activeTab === 'video' ? 'active' : ''}
              onClick={() => setActiveTab('video')}
            >
              Video Call
            </button>
            <button
              className={activeTab === 'whiteboard' ? 'active' : ''}
              onClick={() => setActiveTab('whiteboard')}
            >
              Whiteboard
            </button>
            <button
              className={activeTab === 'chat' ? 'active' : ''}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'video' && (
              <VideoCall
                localStream={localStream}
                remoteStream={remoteStream}
                isConnected={isConnected}
                onStartCall={startCall}
                onEndCall={endCall}
                inCall={!!call}
              />
            )}
            {activeTab === 'whiteboard' && (
              <Whiteboard
                ref={whiteboardRef}
                onDraw={sendWhiteboardData}
                isConnected={isConnected}
              />
            )}
            {activeTab === 'chat' && (
              <TextChat
                messages={messages}
                onSendMessage={sendMessage}
                isConnected={isConnected}
                username={username}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;