const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    timings: { type: String },
    images: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Turf', turfSchema);
