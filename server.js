const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const compression = require('compression');
const axios = require('axios');
const cache = require('memory-cache');
const apicache = require('apicache');

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = ['https://manga-website1.netlify.app', 'http://localhost:3000'];

app.use(cors({ origin: allowedOrigins }));
app.use(compression());
const apiCache = apicache.middleware;

const proxyMiddleware = createProxyMiddleware({
  target: 'https://api.mangadex.org',
  changeOrigin: true,
  pathRewrite: { '^/api': '' }
});

const handleProxyRequest = (req, res, next) => {
  proxyMiddleware(req, res, (err) => {
    if (err) {
      console.error('Proxy request error:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Proxy request completed.');
    }
  });
};

app.use('/api', apiCache('5 minutes'), handleProxyRequest);
app.use('/search', handleProxyRequest);

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

app.listen(PORT, () => {
  console.log(`App is running on localhost:${PORT}`);
});
