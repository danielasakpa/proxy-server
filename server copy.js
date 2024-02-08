// const express = require('express');
// const cluster = require('cluster');
// const numCPUs = require('os').cpus().length;
// const axios = require('axios');
// const cors = require('cors');
// const compression = require('compression');
// const cache = require('memory-cache'); // Install using npm install memory-cache

// const app = express();
// const PORT = process.env.PORT || 4000;

// const allowedOrigins = [
//     'https://manga-website1.netlify.app',
//     'http://localhost:3000',
// ];

// app.use(cors({
//     origin: allowedOrigins,
// }));
// app.use(compression()); // Enable compression

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // API proxy route

// const handleApiRequest = async (req, res) => {
//     try {
//         const apiUrl = req.query.url;
//         const cachedData = cache.get(apiUrl);

//         if (cachedData) {
//             // Serve cached data
//             res.json(cachedData);
//         } else {
//             // Fetch data
//             const response = await axios.get(apiUrl, { withCredentials: false });

//             // Cache data
//             cache.put(apiUrl, response.data, 60000); // Cache for 1 minute

//             res.json(response.data);
//         }
//     } catch (error) {
//         console.error('API Proxy Error:', error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }

// // Manga proxy route
// const handleMangaRequest = async (req, res) => {
//     try {
//         const apiUrl = req.query.url;

//         const cacheKey = `${apiUrl}-${req.query.title}-${JSON.stringify(req.query)}`; // Include request parameters in the cache key

//         const cachedData = cache.get(cacheKey);
//         if (cachedData) {
//             res.json(cachedData);
//             return;
//         }
//         // Fetch data
//         const response = await axios.get(apiUrl, {
//             withCredentials: false,
//             params: { title: req.query.title },
//         });

//         // Cache data
//         cache.put(cacheKey, response.data, 60000); // Cache for 1 minute

//         res.json(response.data);
//     } catch (error) {
//         console.error('API Proxy Error:', error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }

// // Mangas proxy route
// const handleMangasRequest = async (req, res) => {
//     try {
//         const apiUrl = req.query.url;

//         const cacheKey = `${apiUrl}-${JSON.stringify(req.query)}`;

//         const cachedData = cache.get(cacheKey);
//         if (cachedData) {
//             res.json(cachedData);
//             return;
//         }

//         const response = await axios.get(apiUrl, {
//             withCredentials: false,
//             params: {
//                 includedTags: req.query.includedTags,
//                 excludedTags: req.query.excludedTags,
//                 order: req.query.order,
//                 limit: req.query.limit,
//                 offset: req.query.offset || 0, // Use the provided offset or default to 0
//             },
//             maxContentLength: Infinity,
//         });

//         cache.put(cacheKey, response.data, 60000);
//         res.json(response.data);
//     } catch (error) {
//         console.error('API Proxy Error:', error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }

// // Chapters proxy route
// const handleChaptersRequest = async (req, res) => {
//     try {
//         const apiUrl = req.query.url;
//         const cachedData = cache.get(apiUrl);

//         if (cachedData) {
//             // Serve cached data
//             res.json(cachedData);
//         } else {
//             // Fetch data
//             const response = await axios.get(apiUrl, {
//                 withCredentials: false,
//                 params: { translatedLanguage: req.query.translatedLanguage },
//             });

//             // Cache data
//             cache.put(apiUrl, response.data, 60000); // Cache for 1 minute

//             res.json(response.data);
//         }
//     } catch (error) {
//         console.error('API Proxy Error:', error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }

// // Image proxy route
// const handleImageRequest = async (req, res) => {
//     try {
//         const imageUrl = req.query.url;
//         const cachedImage = cache.get(imageUrl);

//         if (cachedImage) {
//             // Serve cached image
//             res.set('Content-Type', cachedImage.contentType);
//             res.send(cachedImage.data);
//         } else {
//             // Fetch image
//             const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//             const contentType = response.headers['content-type'];

//             // Cache image
//             cache.put(imageUrl, { contentType, data: response.data }, 60000); // Cache for 1 minute

//             res.set('Content-Type', contentType);
//             res.send(response.data);
//         }
//     } catch (error) {
//         console.error('Image Proxy Error:', error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }

// // Use clustering to take advantage of multiple CPU cores
// if (cluster.isMaster) {
//     console.log(`Master ${process.pid} is running`);

//     // Fork workers
//     for (let i = 0; i < numCPUs; i++) {
//         cluster.fork();
//     }

//     // Listen for worker exit events
//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`Worker ${worker.process.pid} died`);
//     });
// } else {

//     // Set up the server
//     app.get('/api', handleApiRequest);
//     app.get('/manga', handleMangaRequest);
//     app.get('/mangas', handleMangasRequest);
//     app.get('/chapters', handleChaptersRequest);
//     app.use('/image', handleImageRequest);

//     app.listen(PORT, () => {
//         console.log(`Worker ${process.pid} is up on localhost:${PORT}`);
//     });
// }

// // // Start the server
// // app.listen(port, () => {
// //     console.log(`Proxy Server is running on PORT:${port}`);
// // });
