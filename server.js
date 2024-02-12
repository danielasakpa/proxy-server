const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const compression = require('compression');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = ['https://manga-website1.netlify.app', 'http://localhost:3000'];

app.use(cors({ origin: allowedOrigins }));
app.use(compression());


app.use(
    '/api',
    createProxyMiddleware({
        target: 'https://api.mangadex.org',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
    })
);

// Define a helper function to proxy an image
const proxyImage = async (id, imageUrl) => {
    const targetUrl = `https://uploads.mangadex.org/covers/${id}/${imageUrl}`;
    const response = await axios.get(targetUrl, { responseType: 'arraybuffer' });
    return {
        contentType: response.headers['content-type'],
        data: response.data,
    };
};

// Define a helper function to proxy a chapter
const proxyChapter = async (hash, img) => {
    const targetUrl = `https://uploads.mangadex.org/data/${hash}/${img}`;
    const response = await axios.get(targetUrl, { responseType: 'arraybuffer' });
    return {
        contentType: response.headers['content-type'],
        data: response.data,
    };
};

app.get(
    '/images/:id/:imageUrl',
    async (req, res) => {
        try {
            const { id, imageUrl } = req.params;
            const result = await proxyImage(id, imageUrl);
            res.set('Content-Type', result.contentType);
            res.send(result.data);
        } catch (error) {
            console.error('Image Proxy Error:', error.message);
            res.status(500).send('Internal Server Error');
        }
    }
);

app.get(
    '/chapter/:hash/:img',
    async (req, res) => {
        try {
            const { hash, img } = req.params;
            const result = await proxyChapter(hash, img);
            res.set('Content-Type', result.contentType);
            res.send(result.data);
        } catch (error) {
            console.error('Chapter Proxy Error:', error.message);
            res.status(500).send('Internal Server Error');
        }
    }
);

app.listen(PORT, () => {
    console.log(`App is running on localhost:${PORT}`);
});

