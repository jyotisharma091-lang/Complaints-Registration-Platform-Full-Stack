const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const path = require('path');
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, 
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from Frontend directory
app.use(express.static(path.join(__dirname, '../Frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', complaintRoutes);
app.use('/api/admin', adminRoutes);

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
