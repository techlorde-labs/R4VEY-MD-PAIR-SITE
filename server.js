const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const pairRoute = require('./routes/pair');
const statusRoute = require('./routes/status');

app.use('/pair', pairRoute);
app.use('/api', statusRoute);

// Fallback to Index
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
process.on('uncaughtException', (err) => console.error('[UNCAUGHT EXCEPTION]', err));
process.on('unhandledRejection', (reason) => console.error('[UNHANDLED REJECTION]', reason));

app.listen(PORT, () => {
    console.log(`\n🚀 R4VEY-MD Pair Server active at: http://localhost:${PORT}\n`);
});
