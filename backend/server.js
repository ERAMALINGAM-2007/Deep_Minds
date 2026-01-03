
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health Check
app.get('/', (req, res) => {
  res.send('GlobeTrotter API is running');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}/api`);
});
