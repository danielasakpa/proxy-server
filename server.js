const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import cors module

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
    origin: 'http://localhost:3000',
})); // Use cors middleware


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API proxy route

app.get('/api', async (req, res) => {
    try {
        const apiUrl = req.query.url;

        const response = await axios.get(apiUrl, { withCredentials: false, });

        res.json(response.data);
    } catch (error) {
        console.error('API Proxy Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/manga', async (req, res) => {
    try {
        const apiUrl = req.query.url;

        const response = await axios.get(apiUrl, { withCredentials: false, params: { title: req.query.title } });

        res.json(response.data);
    } catch (error) {
        console.error('API Proxy Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/mangas', async (req, res) => {
    try {
        const apiUrl = req.query.url;

        console.log(req.query.url)

        const response = await axios.get(apiUrl,
            {
                withCredentials: false,
                params: {
                    includedTags: req.query.includedTags,
                    excludedTags: req.query.excludedTags,
                    order: req.query.order,
                    limit: req.query.limit
                },
                maxContentLength: Infinity,
            });
        res.json(response.data);
    } catch (error) {
        console.error('API Proxy Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/chapters', async (req, res) => {
    try {
        const apiUrl = req.query.url;

        const response = await axios.get(apiUrl, {
            withCredentials: false, params: {
                translatedLanguage: req.query.translatedLanguage,
            },
        });

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
    console.log(`Proxy Server is running on PORT:${port}`);
});
