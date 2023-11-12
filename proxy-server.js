const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import cors module

const app = express();
const port = 4000;

app.use(cors()); // Use cors middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API proxy route
app.use('/api', async (req, res) => {
    try {
        const apiUrl = req.query.url;
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error('API Proxy Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Image proxy route
app.use('/image', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (error) {
        console.error('Image Proxy Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Proxy Server is running on http://localhost:${port}`);
});
