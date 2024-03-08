const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const compression = require('compression');
const axios = require('axios');
const cache = require('memory-cache');
const apicache = require('apicache');

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = ['https://manga-website1.netlify.app', 'https://manga-website-odjt.onrender.com', 'http://localhost:3000'];

// Set up CORS and compression middleware
app.use(cors({
  origin: allowedOrigins,
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));

app.use(compression());

// Cache middleware for API responses
const apiCache = apicache.middleware;

// Proxy middleware setup for '/api' and '/search'
const createProxyMiddlewareWithRewrite = (pathRewrite) => createProxyMiddleware({
  target: 'https://api.mangadex.org',
  changeOrigin: true,
  pathRewrite,
});

const proxyMiddleware = createProxyMiddlewareWithRewrite({ '^/api': '' });
const mangasProxyMiddleware = createProxyMiddlewareWithRewrite({ '^/mangas': '' });
const searchProxyMiddleware = createProxyMiddlewareWithRewrite({ '^/search': '' });

// Generic callback function for handling proxy request completion
const handleProxyCallback = (res) => (err) => {
  if (err) {
    console.error('Proxy request error:', err);
    res.status(500).send('Internal Server Error');
  } else {
    console.log('Proxy request completed.');
  }
};

// Apply proxy middleware to '/api', '/mangas' and '/search' routes
app.use('/api', apiCache('2 minutes'), (req, res) => {
  proxyMiddleware(req, res, handleProxyCallback(res));
});

app.use('/mangas', apiCache('2 minutes'), (req, res) => {
  mangasProxyMiddleware(req, res, handleProxyCallback(res));
});

app.use('/search', (req, res) => {
  searchProxyMiddleware(req, res, handleProxyCallback(res));
});

const proxyResource = async (targetUrl, req, res) => {
  const cachedResource = cache.get(targetUrl);

  if (cachedResource) {
    return cachedResource;
  }

  const response = await axios.get(targetUrl, { responseType: 'arraybuffer' });

  cache.put(targetUrl, {
    contentType: response.headers['content-type'],
    data: response.data,
  }, 60000);

  return {
    contentType: response.headers['content-type'],
    data: response.data,
  };
};

const proxyImage = async (id, imageUrl, req, res) => {
  const targetUrl = `https://uploads.mangadex.org/covers/${id}/${imageUrl}`;
  const result = await proxyResource(targetUrl, req, res);
  return result;
};

const proxyChapter = async (hash, img, req, res) => {
  const targetUrl = `https://uploads.mangadex.org/data/${hash}/${img}`;
  const result = await proxyResource(targetUrl, req, res);
  return result;
};

app.get('/images/:id/:imageUrl', async (req, res) => {
  try {
    const { id, imageUrl } = req.params;
    const result = await proxyImage(id, imageUrl, req, res);
    res.set('Content-Type', result.contentType);
    res.send(result.data);
  } catch (error) {
    console.error('Image Proxy Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/chapter/:hash/:img', async (req, res) => {
  try {
    const { hash, img } = req.params;
    const result = await proxyChapter(hash, img, req, res);
    res.set('Content-Type', result.contentType);
    res.send(result.data);
  } catch (error) {
    console.error('Chapter Proxy Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`App is running on localhost:${PORT}`);
});
