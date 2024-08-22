const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const Post = require('./models/posts'); // Ensure the model is correct
const Image = require('./models/image'); // Ensure the model is correct

const app = express();
app.use(cors());
app.use(express.json()); // Use express.json() for parsing JSON

const PORT = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Basic test endpoint
app.get('/', (req, res) => {
    res.send('Hello AI Image Generation App!');
});

// Route to save image
app.post('/api/images', async (req, res) => {
    try {
        const { name, url, prompt } = req.body;

        // Ensure all fields are provided
        if (!name || !url || !prompt) {
            return res.status(400).json({ error: 'All fields (name, url, prompt) are required' });
        }

        const image = new Image({ name, url, prompt });
        await image.save(); // Save image to database
        res.status(201).json(image);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to get all images
app.get('/api/images', async (req, res) => {
    try {
        const images = await Image.find().sort({ createdAt: -1 }).limit(50);
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete an image
app.delete('/api/images', async (req, res) => {
    try {
        const { url } = req.body;
        const result = await Image.deleteOne({ url });

        // Check if the image was found and deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to get posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).limit(50); 
        res.status(200).json({ data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching posts' });
    }
});


// Route to create a post
app.post('/api/posts', async (req, res) => {
    try {
        const { name, prompt, url } = req.body;

        // Ensure all fields are provided
        if (!name || !prompt || !url) {
            return res.status(400).json({ error: 'All fields (name, prompt, url) are required' });
        }

        const post = new Post({ name, prompt, url });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
