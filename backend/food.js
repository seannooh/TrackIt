const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 5002;

// CalorieNinjas API credentials
require('dotenv').config();
const API_KEY = process.env.API_KEY;

app.use(cors());

// Search for foods
app.get('/api/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        const response = await axios.get('https://api.calorieninjas.com/v1/nutrition', {
            params: { query },
            headers: {
                'X-Api-Key': API_KEY,
            },
        });

        // Food data from response
        const foods = response.data.items;

        if (foods && foods.length > 0) {
            res.json(foods);
        } else {
            res.status(404).json({ error: 'Food data not found' });
        }
    } catch (error) {
        console.error('Error fetching data from CalorieNinjas API:', error.message);
        res.status(500).json({ error: 'Error fetching data from CalorieNinjas API' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
