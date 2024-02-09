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


app.get(
    '/images/:id/:imageUrl',
    async (req, res, next) => {
        try {
            const { id, imageUrl } = req.params;
            const targetUrl = `https://uploads.mangadex.org/covers/${id}/${imageUrl}`;

            const response = await axios.get(targetUrl, { responseType: 'arraybuffer' });

            res.set('Content-Type', response.headers['content-type']);

            res.send(response.data);
        } catch (error) {
            console.error('Image Proxy Error:', error.message);
            res.status(500).send('Internal Server Error');
        }
    }
);

app.get(
    '/chapter/:hash/:img',
    async (req, res, next) => {
        try {
            const { hash, img } = req.params;
            const targetUrl = `https://uploads.mangadex.org/data/${hash}/${img}`;

            const response = await axios.get(targetUrl, { responseType: 'arraybuffer' });

            res.set('Content-Type', response.headers['content-type']);

            res.send(response.data);
        } catch (error) {
            console.error('Image Proxy Error:', error.message);
            res.status(500).send('Internal Server Error');
        }
    }
);

app.listen(PORT, () => {
    console.log(`Worker ${process.pid} is up on localhost:${PORT}`);
});

