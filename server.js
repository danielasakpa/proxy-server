const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = ['https://manga-website1.netlify.app', 'http://localhost:3000'];

app.use(cors({ origin: allowedOrigins }));
app.use(compression());

app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'deny');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});


// API proxy route
app.use(
    '/api',
    createProxyMiddleware({
        target: 'https://api.mangadex.org',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
    })
);

app.use(
    '/image',
    createProxyMiddleware({
        target: 'https://uploads.mangadex.org/covers',
        changeOrigin: true,
        pathRewrite: { '^/image': '' },
    })
);

app.use(
    '/chapter',
    createProxyMiddleware({
        target: 'https://uploads.mangadex.org',
        changeOrigin: true,
        pathRewrite: { '^/chapter': '' },
    })
);

app.listen(PORT, () => {
    console.log(`Worker ${process.pid} is up on localhost:${PORT}`);
});

