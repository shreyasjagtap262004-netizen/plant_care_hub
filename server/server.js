const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database connection pool
const { pool } = require('./config/database');

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Get all plants
app.get('/api/plants', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*, u.username, 
             TIMESTAMPDIFF(DAY, p.last_watered, CURDATE()) as days_since_watered
             FROM plants p 
             JOIN users u ON p.user_id = u.id 
             ORDER BY p.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch plants' });
    }
});

// Add new plant
app.post('/api/plants', async (req, res) => {
    try {
        const { name, species, user_id } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO plants (name, species, user_id, last_watered) VALUES (?, ?, ?, CURDATE())',
            [name, species, user_id || 1]
        );
        res.json({ id: result.insertId, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add plant' });
    }
});

// Update plant watering
app.put('/api/plants/:id/water', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute(
            'UPDATE plants SET last_watered = CURDATE() WHERE id = ?',
            [id]
        );
        res.json({ success: true, message: 'Plant watered!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update watering' });
    }
});

// Get users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🌱 Plant Care Hub running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});