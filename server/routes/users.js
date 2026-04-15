const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword', // UPDATE THIS
            database: 'plantcarehub'
        });

        const [rows] = await connection.execute(`
            SELECT u.*, 
                   COUNT(p.id) as plant_count,
                   AVG(CASE 
                       WHEN TIMESTAMPDIFF(DAY, COALESCE(p.last_watered, '1970-01-01'), CURDATE()) > 7 THEN 1
                       ELSE 0 
                   END) as neglected_plants_ratio
            FROM users u 
            LEFT JOIN plants p ON u.id = p.user_id 
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);

        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID with plants
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword',
            database: 'plantcarehub'
        });

        const [userRows] = await connection.execute(
            'SELECT * FROM users WHERE id = ?', [id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [plantRows] = await connection.execute(
            'SELECT * FROM plants WHERE user_id = ? ORDER BY created_at DESC', [id]
        );

        await connection.end();
        res.json({
            user: userRows[0],
            plants: plantRows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { username, email } = req.body;
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'yourpassword',
            database: 'plantcarehub'
        });

        const [result] = await connection.execute(
            'INSERT INTO users (username, email) VALUES (?, ?)',
            [username, email]
        );

        await connection.end();
        res.status(201).json({ 
            id: result.insertId, 
            message: 'User created successfully',
            success: true 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'User already exists' });
        }
        console.error('User creation error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

module.exports = router;