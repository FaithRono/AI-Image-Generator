const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prompt: { type: String, required: true },
  url: { type: String, required: true },
});


const Image = mongoose.model('Image', imageSchema);

module.exports = Image;