require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const pasteRoutes = require('./routes/pasteRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust reverse proxy (for Render / Heroku / Netlify)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

app.get('/', (req, res) => res.send('SnipShare API is running! 🚀'));

// CORS
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
}));

// Body parser
app.use(express.json({ limit: '2mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Routes
app.use('/api/paste', pasteRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
