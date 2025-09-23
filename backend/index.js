const express = require('express');
const cors = require('cors');
const http = require('http'); // Import the http module
const { WebSocketServer } = require('ws'); // Import the WebSocket server
const pool = require('./src/config/database');
const authenticationRoutes = require('./src/api/authentication');
const userRoutes = require('./src/api/userProfile.js');
const bookRoutes = require('./src/api/books');
const adminRoutes = require('./src/api/admin');

const app = express();
const server = http.createServer(app); // Create an HTTP server using the Express app
const wss = new WebSocketServer({ server }); // Attach the WebSocket server to the HTTP server

// This function will be used to send messages to all connected clients
const broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Make the broadcast function globally available to your other API routes
app.set('broadcast', broadcast);

// Handle new WebSocket connections
wss.on('connection', ws => {
  console.log('Client connected to WebSocket');
  ws.on('close', () => {
    console.log('Client disconnected');
  });
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 8080;

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authenticationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Inkling Backend API!" });
});

// A special test route to verify the database connection.
app.get('/database-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    res.json(result.rows[0]);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection error");
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});