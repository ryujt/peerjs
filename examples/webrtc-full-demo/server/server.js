const express = require('express');
const cors = require('cors');
const { PeerServer } = require('peer');

const app = express();
const PORT = process.env.PORT || 3001;
const PEER_PORT = process.env.PEER_PORT || 9000;

app.use(cors());
app.use(express.json());

const connectedUsers = new Map();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/register', (req, res) => {
  const { peerId, username } = req.body;
  connectedUsers.set(peerId, { username, connectedAt: new Date() });
  res.json({ success: true, peerId });
});

app.delete('/api/unregister/:peerId', (req, res) => {
  const { peerId } = req.params;
  connectedUsers.delete(peerId);
  res.json({ success: true });
});

app.get('/api/users', (req, res) => {
  const users = Array.from(connectedUsers.entries()).map(([peerId, data]) => ({
    peerId,
    ...data
  }));
  res.json(users);
});

const server = app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

const peerServer = PeerServer({
  port: PEER_PORT,
  path: '/peerjs',
  proxied: true
});

peerServer.on('connection', (client) => {
  console.log(`Peer connected: ${client.id}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`Peer disconnected: ${client.id}`);
  connectedUsers.delete(client.id);
});

console.log(`PeerJS server running on http://localhost:${PEER_PORT}`);

process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  server.close();
  process.exit(0);
});