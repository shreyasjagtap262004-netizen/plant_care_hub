const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Get care logs for a plant
router.get('/plant/:plantId', async (req, res) => {
    try {
        const { plantId } = req.params;
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword', // UPDATE THIS
            database: 'plantcarehub'
        });

        const [rows] = await connection.execute(`
            SELECT cl.*, p.name as plant_name 
            FROM care_logs cl 
            JOIN plants p ON cl.plant_id = p.id 
            WHERE cl.plant_id = ? 
            ORDER BY cl.date DESC 
            LIMIT 50
        `, [plantId]);

        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Care logs error:', error);
        res.status(500).json({ error: 'Failed to fetch care logs' });
    }
});

// Log care activity
router.post('/', async (req, res) => {
    try {
        const { plant_id, action, details } = req.body;
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword',
            database: 'plantcarehub'
        });

        const [result] = await connection.execute(
            'INSERT INTO care_logs (plant_id, action, details) VALUES (?, ?, ?)',
            [plant_id, action, details || '']
        );

        await connection.end();
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Care log created successfully',
            success: true 
        });
    } catch (error) {
        console.error('Care log error:', error);
        res.status(500).json({ error: 'Failed to create care log' });
    }
});

// Get care statistics
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword',
            database: 'plantcarehub'
        });

        const [stats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_logs,
                COUNT(DISTINCT cl.plant_id) as plants_cared_for,
                DATE_FORMAT(cl.date, '%Y-%m') as month,
                COUNT(CASE WHEN cl.action = 'watered' THEN 1 END) as watering_count,
                COUNT(CASE WHEN cl.action = 'fertilized' THEN 1 END) as fertilizing_count
            FROM care_logs cl
            JOIN plants p ON cl.plant_id = p.id
            WHERE p.user_id = ?
            GROUP BY DATE_FORMAT(cl.date, '%Y-%m')
            ORDER BY month DESC
            LIMIT 12
        `, [userId]);

        await connection.end();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;