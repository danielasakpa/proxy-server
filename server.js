const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const compression = require('compression');
const axios = require('axios');
const cache = require('memory-cache'); // Import the memory-cache library
const app = express();
const https = require('https');
const PORT = process.env.PORT || 4000;

const allowedOrigins = ['https://manga-website1.netlify.app', 'http://localhost:3000'];

app.use(cors({ origin: allowedOrigins }));
app.use(compression());

const proxyMiddleware = createProxyMiddleware({
  target: 'https://api.mangadex.org',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  proxyTimeout: 120000,
  agent: new https.Agent({
    maxSockets: 100,
  }),
});

app.use('/api', (req, res) => {
  proxyMiddleware(req, res, () => {
    console.log('Proxy request completed.');
  });
});

// Define a helper function to proxy an image
const proxyImage = async (id, imageUrl) => {
  const targetUrl = `https://uploads.mangadex.org/covers/${id}/${imageUrl}`;

  // Check if the image is in the cache
  const cachedImage = cache.get(targetUrl);

  if (cachedImage) {
    return cachedImage;
  }

  // Fetch the image if not in the cache
  const response = await axios.get(targetUrl, { responseType: 'arraybuffer' });

  // Cache the image
  cache.put(targetUrl, {
    contentType: response.headers['content-type'],
    data: response.data,
  }, 60000); // Cache for 1 minute

  return {
    contentType: response.headers['content-type'],
    data: response.data,
  };
};

// Define a helper function to proxy a chapter
const proxyChapter = async (hash, img) => {
  const targetUrl = `https://uploads.mangadex.org/data/${hash}/${img}`;

  // Check if the chapter is in the cache
  const cachedChapter = cache.get(targetUrl);

  if (cachedChapter) {
    return cachedChapter;
  }

  // Fetch the chapter if not in the cache
  const response = await axios.get(targetUrl, { responseType: 'arraybuffer' });

  // Cache the chapter
  cache.put(targetUrl, {
    contentType: response.headers['content-type'],
    data: response.data,
  }, 60000); // Cache for 1 minute

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
