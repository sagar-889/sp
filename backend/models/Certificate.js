const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Refers to User in Main DB
    email: { type: String, required: true },
    filePath: { type: String, required: true }, // Path to file on disk
    uploadDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

module.exports = certificateSchema; // Export Schema, not Model (Model depends on connection)
