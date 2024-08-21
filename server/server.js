const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const Post = require('./models/posts');
const Image = require('./models/image');

const app = express();
app.use(cors());
app.use(express.json()); // Use only express.json()

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
        const {name, url, prompt} = req.body;
        const image = new Image({name, url, prompt});
        // const post = new Post({ url, prompt });
        // await post.save();
        await image.save();
        res.status(201).json(image);
    } catch (err) {
        res.status(500).json({error: err});
    }
});

// Route to get all images
app.get('/api/images', async (req, res) => {
    try {
        const images = await Image.find().sort({createdAt: -1});
        res.json(images);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Route to delete an image
app.delete('/api/images', async (req, res) => {
    try {
        const {url} = req.body;
        await Image.deleteOne({url});
        res.status(200).json({message: 'Image deleted successfully'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Route to get posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Image.find(); // Adjust according to your schema
        res.status(200).json({data: posts});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error fetching posts'});
    }
});

// Route to create a post
app.post('/api/posts', async (req, res) => {
    try {
        const {name, prompt, url} = req.body;
        const post = new Post({name, prompt, url});
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://local:3000`);
});
