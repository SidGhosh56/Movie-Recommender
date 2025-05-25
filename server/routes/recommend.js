const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
    const { title } = req.body;

    try {
        const response = await axios.post('http://localhost:5001/recommend', { title });
        res.json(response.data);
    } catch (error) {
        console.error("Error communicating with Flask API:", error.message);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

module.exports = router;
