require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const programRoutes = require('./routes/program');
const reviewRoutes = require('./routes/review');
const grantRoutes = require('./routes/grants');

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5175",
            "https://mantra-4-change.vercel.app",
        ],
        credentials: true,
    })
);
app.use(express.json());

app.use('/images', express.static(path.resolve(__dirname, '../../images')));
app.use('/api/program', programRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/grants', grantRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'mantra4change-program-intelligence' });
});

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});
module.exports = app;