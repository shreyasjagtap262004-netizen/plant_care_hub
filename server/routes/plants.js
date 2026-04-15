const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Get all plants with user info
router.get('/', async (req, res) => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword', // UPDATE THIS
            database: 'plantcarehub'
        });

        const [rows] = await connection.execute(`
            SELECT p.*, u.username,
                   TIMESTAMPDIFF(DAY, COALESCE(p.last_watered, '1970-01-01'), CURDATE()) as days_since_watered,
                   CASE 
                       WHEN TIMESTAMPDIFF(DAY, COALESCE(p.last_watered, '1970-01-01'), CURDATE()) > 7 THEN 'critical'
                       WHEN TIMESTAMPDIFF(DAY, COALESCE(p.last_watered, '1970-01-01'), CURDATE()) > 3 THEN 'warning'
                       ELSE 'healthy'
                   END as watering_status
            FROM plants p 
            LEFT JOIN users u ON p.user_id = u.id 
            ORDER BY p.last_watered DESC
        `);

        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Plants fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch plants' });
    }
});

// Get single plant by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword',
            database: 'plantcarehub'
        });

        const [rows] = await connection.execute(
            'SELECT p.*, u.username FROM plants p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?',
            [id]
        );

        await connection.end();
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Plant not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new plant
router.post('/', async (req, res) => {
    try {
        const { name, species, user_id, notes } = req.body;
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword',
            database: 'plantcarehub'
        });

        const [result] = await connection.execute(
            'INSERT INTO plants (name, species, user_id, notes, last_watered) VALUES (?, ?, ?, ?, CURDATE())',
            [name, species, user_id || 1, notes]
        );

        await connection.end();
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Plant added successfully',
            success: true 
        });
    } catch (error) {
        console.error('Plant creation error:', error);
        res.status(500).json({ error: 'Failed to create plant' });
    }
});

// Update plant watering
router.put('/:id/water', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword',
            database: 'plantcarehub'
        });

        const [result] = await connection.execute(
            'UPDATE plants SET last_watered = CURDATE() WHERE id = ?',
            [id]
        );

        await connection.end();
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Plant not found' });
        }
        res.json({ success: true, message: 'Plant watered successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update plant health status
router.put('/:id/health', async (req, res) => {
    try {
        const { id } = req.params;
        const { health_status } = req.body;
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword',
            database: 'plantcarehub'
        });

        await connection.execute(
            'UPDATE plants SET health_status = ? WHERE id = ?',
            [health_status, id]
        );

        await connection.end();
        res.json({ success: true, message: `Health status updated to ${health_status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete plant
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword',
            database: 'plantcarehub'
        });

        const [result] = await connection.execute('DELETE FROM plants WHERE id = ?', [id]);
        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Plant not found' });
        }
        res.json({ success: true, message: 'Plant deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;